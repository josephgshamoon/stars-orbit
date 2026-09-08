import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole, newId } from '../lib/auth.ts';
import { expenseApprover, canApprove, segregated, daysBetween, type Role } from '../lib/rules.ts';

export const finance = new Hono<{ Bindings: Env; Variables: Vars }>();

export type LineBva = { id: string; project_code: string; code: string; category: string; description: string; approved_usd: number; actual_usd: number; committed_usd: number; remaining_usd: number; burn_pct: number; expected_pct: number; variance_pct: number; flag: 'OK' | 'Review' };

export async function budgetVsActual(db: D1Database, projectCode?: string, asOf = new Date().toISOString().slice(0, 10)) {
  const projects = (await db.prepare(projectCode ? 'SELECT * FROM projects WHERE code = ?' : 'SELECT * FROM projects').bind(...(projectCode ? [projectCode] : [])).all<{ code: string; name: string; donor: string; start_date: string; end_date: string; flexibility_pct: number }>()).results;
  const lines = (await db.prepare('SELECT * FROM budget_lines ORDER BY project_code, code').all<{ id: string; project_code: string; code: string; category: string; description: string; approved_usd: number }>()).results;
  const spend = (await db.prepare("SELECT budget_line_id, SUM(CASE WHEN status IN ('approved','paid') THEN usd_amount ELSE 0 END) AS actual, SUM(CASE WHEN status = 'submitted' THEN usd_amount ELSE 0 END) AS committed FROM expenses GROUP BY budget_line_id").all<{ budget_line_id: string; actual: number; committed: number }>()).results;
  return projects.map((p) => {
    const total = Math.max(1, daysBetween(p.start_date, p.end_date));
    const elapsed = Math.min(total, Math.max(0, daysBetween(p.start_date, asOf)));
    const expected = elapsed / total;
    const pl: LineBva[] = lines.filter((l) => l.project_code === p.code).map((l) => {
      const s = spend.find((x) => x.budget_line_id === l.id);
      const actual = s?.actual ?? 0; const committed = s?.committed ?? 0;
      const burn = l.approved_usd ? (actual + committed) / l.approved_usd : 0;
      const variance = burn - expected;
      return { ...l, actual_usd: actual, committed_usd: committed, remaining_usd: l.approved_usd - actual - committed, burn_pct: burn, expected_pct: expected, variance_pct: variance, flag: Math.abs(variance) > p.flexibility_pct ? 'Review' : 'OK' };
    });
    const approved = pl.reduce((s, l) => s + l.approved_usd, 0);
    const actual = pl.reduce((s, l) => s + l.actual_usd, 0);
    const committed = pl.reduce((s, l) => s + l.committed_usd, 0);
    const months = Math.max(1, elapsed / 30.4);
    const burnRate = actual / months;
    const forecast = pl.reduce((s, l) => s + (elapsed ? l.actual_usd / elapsed * total : l.approved_usd) + l.committed_usd, 0);
    return { project: p, lines: pl, totals: { approved_usd: approved, actual_usd: actual, committed_usd: committed, remaining_usd: approved - actual - committed, burn_pct: approved ? (actual + committed) / approved : 0, expected_pct: expected, monthly_burn_usd: burnRate, months_remaining_at_burn: burnRate ? (approved - actual - committed) / burnRate : null, forecast_to_completion_usd: forecast, forecast_variance_usd: forecast - approved, large_grant: approved >= 100000 } };
  });
}

finance.get('/projects', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM projects ORDER BY code').all()).results));
finance.get('/budget', async (c) => c.json(await budgetVsActual(c.env.DB, c.req.query('project'), c.req.query('as_of'))));
finance.get('/budget-lines', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM budget_lines ORDER BY project_code, code').all()).results));

finance.get('/expenses', async (c) => {
  const status = c.req.query('status');
  const q = status ? c.env.DB.prepare('SELECT * FROM expenses WHERE status = ? ORDER BY submitted_at DESC').bind(status) : c.env.DB.prepare('SELECT * FROM expenses ORDER BY submitted_at DESC');
  return c.json((await q.all()).results);
});

/** Submit a claim. Approver is derived server-side from the USD amount; the client cannot choose it. */
finance.post('/expenses', async (c) => {
  const b = await c.req.json<{ project_code: string; budget_line_id?: string; description: string; expense_date: string; amount: number; currency: string; fx_rate?: number; receipt_ref?: string }>();
  if (!b.project_code || !b.description || !b.expense_date || !(b.amount > 0) || !b.currency) return c.json({ error: 'project_code, description, expense_date, amount, currency required' }, 400);
  const fx = b.currency === 'USD' ? 1 : Number(b.fx_rate);
  if (!(fx > 0)) return c.json({ error: 'fx_rate to USD required for non-USD claims' }, 400);
  const usd = Math.round(b.amount * fx * 100) / 100;
  const p = await c.env.DB.prepare('SELECT start_date, end_date FROM projects WHERE code = ?').bind(b.project_code).first<{ start_date: string; end_date: string }>();
  if (!p) return c.json({ error: 'unknown project' }, 400);
  const flags: string[] = [];
  if (b.expense_date < p.start_date || b.expense_date > p.end_date) flags.push('date outside project period');
  if (!b.receipt_ref && usd > 20) flags.push('receipt reference missing (required above USD 20)');
  if (b.currency !== 'USD' && !b.fx_rate) flags.push('fx rate missing');
  const role = expenseApprover(usd);
  const id = newId('EXP');
  await c.env.DB.prepare('INSERT INTO expenses (id, project_code, budget_line_id, claimant, description, expense_date, amount, currency, fx_rate, usd_amount, receipt_ref, required_role) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.project_code, b.budget_line_id ?? null, c.get('user').name, b.description, b.expense_date, b.amount, b.currency, fx, usd, b.receipt_ref ?? null, role).run();
  await audit(c, 'submit', 'expense', id, { usd, required_role: role, flags });
  return c.json({ id, usd_amount: usd, required_role: role, flags }, 201);
});

finance.post('/expenses/:id/decide', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ approve: boolean; note?: string }>();
  const e = await c.env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first<{ claimant: string; required_role: Role; status: string; usd_amount: number; budget_line_id: string | null; project_code: string }>();
  if (!e) return c.json({ error: 'not found' }, 404);
  if (e.status !== 'submitted') return c.json({ error: `already ${e.status}` }, 409);
  const u = c.get('user');
  if (!canApprove(u.role, e.required_role)) return c.json({ error: `USD ${e.usd_amount} requires ${e.required_role}; you are ${u.role}` }, 403);
  if (!segregated(e.claimant, u.name)) return c.json({ error: 'segregation of duties: the claimant cannot approve their own claim' }, 403);
  if (b.approve && e.budget_line_id) {
    const bva = await budgetVsActual(c.env.DB, e.project_code);
    const line = bva[0]?.lines.find((l) => l.id === e.budget_line_id);
    if (line && line.actual_usd + e.usd_amount > line.approved_usd && u.role !== 'ED') {
      return c.json({ error: `approving would overspend line ${line.code} (approved ${line.approved_usd}, actual ${line.actual_usd}); Executive Director decision required` }, 422);
    }
  }
  await c.env.DB.prepare("UPDATE expenses SET status = ?, approver = ?, decision_note = ?, decided_at = datetime('now') WHERE id = ?").bind(b.approve ? 'approved' : 'rejected', u.name, b.note ?? null, id).run();
  await audit(c, b.approve ? 'approve' : 'reject', 'expense', id, b);
  return c.json({ ok: true });
});

/** Payment release: FM or above, and never the approver (two-person control). */
finance.post('/expenses/:id/pay', requireRole('FM'), async (c) => {
  const id = c.req.param('id');
  const e = await c.env.DB.prepare('SELECT status, approver FROM expenses WHERE id = ?').bind(id).first<{ status: string; approver: string | null }>();
  if (!e || e.status !== 'approved') return c.json({ error: 'only approved claims can be paid' }, 409);
  const u = c.get('user');
  if (e.approver && !segregated(e.approver, u.name)) return c.json({ error: 'two-person control: the approver cannot release payment' }, 403);
  await c.env.DB.prepare("UPDATE expenses SET status = 'paid' WHERE id = ?").bind(id).run();
  await audit(c, 'pay', 'expense', id);
  return c.json({ ok: true });
});

finance.get('/audit', requireRole('FM'), async (c) => c.json((await c.env.DB.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 200').all()).results));
