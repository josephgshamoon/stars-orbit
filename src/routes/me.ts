import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole, newId } from '../lib/auth.ts';
import { ragStatus } from '../lib/rules.ts';

export const me = new Hono<{ Bindings: Env; Variables: Vars }>();

type IndicatorRow = { id: string; project_code: string; level: string; definition: string; unit: string; disaggregation: string | null; baseline: number; target: number; frequency: string; source: string | null; responsible: string | null };
type ValueRow = { indicator_id: string; period: string; value: number; verified_by: string | null; verified_at: string | null; note: string | null };

export async function indicatorProgress(db: D1Database, projectCode?: string) {
  const inds = projectCode
    ? (await db.prepare('SELECT * FROM indicators WHERE project_code = ? ORDER BY id').bind(projectCode).all<IndicatorRow>()).results
    : (await db.prepare('SELECT * FROM indicators ORDER BY project_code, id').all<IndicatorRow>()).results;
  const vals = (await db.prepare('SELECT * FROM indicator_values ORDER BY indicator_id, period').all<ValueRow>()).results;
  return inds.map((i) => {
    const v = vals.filter((x) => x.indicator_id === i.id);
    const cumulative = v.length === 0 ? null : i.unit === '%' ? v[v.length - 1].value : v.reduce((s, x) => s + x.value, 0);
    const pct = cumulative === null || i.target === 0 ? null : cumulative / i.target;
    const unverified = v.filter((x) => !x.verified_by).length;
    return { ...i, values: v, cumulative, pct, rag: ragStatus(pct), unverified };
  });
}

me.get('/indicators', async (c) => c.json(await indicatorProgress(c.env.DB, c.req.query('project'))));

me.post('/indicators', requireRole('ME'), async (c) => {
  const b = await c.req.json<Partial<IndicatorRow>>();
  if (!b.project_code || !b.definition || !b.unit || b.target === undefined) return c.json({ error: 'project_code, definition, unit, target required' }, 400);
  const id = b.id || newId('IND');
  await c.env.DB.prepare('INSERT INTO indicators (id, project_code, level, definition, unit, disaggregation, baseline, target, frequency, source, responsible) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.project_code, b.level ?? 'Output', b.definition, b.unit, b.disaggregation ?? null, b.baseline ?? 0, b.target, b.frequency ?? 'quarterly', b.source ?? null, b.responsible ?? null).run();
  await audit(c, 'create', 'indicator', id, b);
  return c.json({ id }, 201);
});

/** Post a period value. Any staff can enter; only ME or above can verify. A changed value after verification requires a correction note. */
me.post('/indicators/:id/values', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ period: string; value: number; note?: string; verify?: boolean }>();
  if (!b.period || typeof b.value !== 'number') return c.json({ error: 'period and numeric value required' }, 400);
  const existing = await c.env.DB.prepare('SELECT * FROM indicator_values WHERE indicator_id = ? AND period = ?').bind(id, b.period).first<ValueRow>();
  if (existing?.verified_by && existing.value !== b.value && !b.note) return c.json({ error: 'value already verified; a correction note is required to change it' }, 409);
  const u = c.get('user');
  const verify = b.verify && ['ME', 'PM', 'OD', 'ED'].includes(u.role);
  await c.env.DB.prepare(`INSERT INTO indicator_values (indicator_id, period, value, note, verified_by, verified_at) VALUES (?,?,?,?,?,?)
    ON CONFLICT(indicator_id, period) DO UPDATE SET value = excluded.value, note = COALESCE(excluded.note, note), verified_by = excluded.verified_by, verified_at = excluded.verified_at`)
    .bind(id, b.period, b.value, b.note ?? null, verify ? u.name : null, verify ? new Date().toISOString() : null).run();
  await audit(c, existing ? 'update' : 'create', 'indicator_value', `${id}/${b.period}`, { value: b.value, note: b.note, verified: !!verify, previous: existing?.value });
  return c.json({ ok: true, verified: !!verify });
});

me.get('/translations', async (c) => {
  const status = c.req.query('status');
  const q = status ? c.env.DB.prepare('SELECT * FROM translations WHERE status = ? ORDER BY updated_at DESC').bind(status) : c.env.DB.prepare('SELECT * FROM translations ORDER BY updated_at DESC');
  const rows = (await q.all()).results.map((r) => ({ ...r, qa: r.qa_json ? JSON.parse(String(r.qa_json)) : null }));
  return c.json(rows);
});

me.post('/translations', async (c) => {
  const b = await c.req.json<{ project_code: string; source_ref: string; arabic_text: string; english_text?: string; translator?: string }>();
  if (!b.project_code || !b.source_ref || !b.arabic_text) return c.json({ error: 'project_code, source_ref, arabic_text required' }, 400);
  const id = newId('TR');
  await c.env.DB.prepare('INSERT INTO translations (id, project_code, source_ref, arabic_text, english_text, translator, status) VALUES (?,?,?,?,?,?,?)')
    .bind(id, b.project_code, b.source_ref, b.arabic_text, b.english_text ?? null, b.translator ?? c.get('user').name, b.english_text ? 'translated' : 'draft').run();
  await audit(c, 'create', 'translation', id);
  return c.json({ id }, 201);
});

/** Workflow: draft -> translated (translator) -> reviewed (ME meaning review) -> final (PM sensitive-content check). */
me.post('/translations/:id/advance', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ english_text?: string }>();
  const row = await c.env.DB.prepare('SELECT * FROM translations WHERE id = ?').bind(id).first<{ status: string; english_text: string | null }>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const u = c.get('user');
  const next: Record<string, { to: string; roles: string[] }> = {
    draft: { to: 'translated', roles: ['STAFF', 'ME', 'PM', 'HR', 'FM', 'OD', 'ED'] },
    translated: { to: 'reviewed', roles: ['ME', 'OD', 'ED'] },
    reviewed: { to: 'final', roles: ['PM', 'OD', 'ED'] },
  };
  const step = next[row.status];
  if (!step) return c.json({ error: 'already final' }, 409);
  if (!step.roles.includes(u.role)) return c.json({ error: `step ${row.status} -> ${step.to} requires one of ${step.roles.join(', ')}` }, 403);
  const english = b.english_text ?? row.english_text;
  if (!english) return c.json({ error: 'english_text required to advance from draft' }, 400);
  await c.env.DB.prepare("UPDATE translations SET status = ?, english_text = ?, reviewer = CASE WHEN ? = 'reviewed' THEN ? ELSE reviewer END, updated_at = datetime('now') WHERE id = ?")
    .bind(step.to, english, step.to, u.name, id).run();
  await audit(c, 'advance', 'translation', id, { from: row.status, to: step.to });
  return c.json({ status: step.to });
});

me.get('/glossary', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM glossary ORDER BY domain, english').all()).results));
