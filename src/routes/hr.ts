import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole, newId } from '../lib/auth.ts';
import { noticeDays, terminationGaps, TERMINATION_RATIONALES, rubricScore, MAX_MONTH_TO_MONTH_RENEWALS, type ContractType, type TerminationRationale } from '../lib/rules.ts';

export const hr = new Hono<{ Bindings: Env; Variables: Vars }>();

hr.get('/staff', async (c) => {
  const staff = (await c.env.DB.prepare('SELECT * FROM staff ORDER BY id').all()).results;
  const allocs = (await c.env.DB.prepare('SELECT * FROM staff_allocations').all<{ staff_id: string; project_code: string; pct: number }>()).results;
  const leave = (await c.env.DB.prepare("SELECT staff_id, SUM(CASE WHEN type IN ('accrual','annual') THEN days ELSE 0 END) AS balance FROM leave_ledger GROUP BY staff_id").all<{ staff_id: string; balance: number }>()).results;
  return c.json(staff.map((s) => ({ ...s, allocations: allocs.filter((a) => a.staff_id === s.id), leave_balance: leave.find((l) => l.staff_id === s.id)?.balance ?? 0 })));
});

hr.post('/staff', requireRole('HR'), async (c) => {
  const b = await c.req.json<Record<string, unknown>>();
  const type = b.contract_type as ContractType;
  if (!b.name || !b.position || !type || !b.start_date) return c.json({ error: 'name, position, contract_type, start_date required' }, 400);
  const allocs = (b.allocations as { project_code: string; pct: number }[] | undefined) ?? [];
  const sum = allocs.reduce((s, a) => s + Number(a.pct), 0);
  if (allocs.length && Math.abs(sum - 1) > 0.001) return c.json({ error: `allocations must sum to 100%, got ${Math.round(sum * 100)}%` }, 400);
  const id = (b.id as string) || newId('S');
  const notice = noticeDays(type);
  await c.env.DB.prepare('INSERT INTO staff (id, name, position, grade, duty_station, country, contract_type, start_date, end_date, probation_end, renewal_count, line_manager, salary, currency, notice_days) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.name, b.position, b.grade ?? null, b.duty_station ?? null, b.country ?? 'Iraq', type, b.start_date, b.end_date ?? null, b.probation_end ?? null, 0, b.line_manager ?? null, Number(b.salary ?? 0), b.currency ?? 'USD', notice).run();
  for (const a of allocs) await c.env.DB.prepare('INSERT INTO staff_allocations (staff_id, project_code, pct) VALUES (?,?,?)').bind(id, a.project_code, a.pct).run();
  if (type !== 'daily') {
    await c.env.DB.prepare('INSERT INTO contracts (id, type, party, project_code, value_usd, start_date, end_date, notice_days, renewal_count, signatory, staff_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(newId('CT'), type === 'consultant' ? 'consultant' : 'employment', b.name, allocs[0]?.project_code ?? null, 0, b.start_date, b.end_date ?? b.start_date, notice, 0, 'OD', id).run();
  }
  await audit(c, 'create', 'staff', id, { ...b, notice_days: notice });
  return c.json({ id, notice_days: notice }, 201);
});

/** Renewal: month-to-month beyond 6 renewals needs ED. */
hr.post('/staff/:id/renew', requireRole('OD'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ new_end_date: string }>();
  const s = await c.env.DB.prepare('SELECT * FROM staff WHERE id = ?').bind(id).first<{ contract_type: string; renewal_count: number }>();
  if (!s) return c.json({ error: 'not found' }, 404);
  const u = c.get('user');
  if (s.contract_type === 'month-to-month' && s.renewal_count + 1 >= MAX_MONTH_TO_MONTH_RENEWALS && u.role !== 'ED') {
    return c.json({ error: `renewal ${s.renewal_count + 1} would take this month-to-month contract beyond ${MAX_MONTH_TO_MONTH_RENEWALS} consecutive months; Executive Director review required` }, 403);
  }
  await c.env.DB.prepare('UPDATE staff SET end_date = ?, renewal_count = renewal_count + 1 WHERE id = ?').bind(b.new_end_date, id).run();
  await c.env.DB.prepare('UPDATE contracts SET end_date = ?, renewal_count = renewal_count + 1 WHERE staff_id = ? AND status = ?').bind(b.new_end_date, id, 'active').run();
  await audit(c, 'renew', 'staff', id, b);
  return c.json({ ok: true, renewal_count: s.renewal_count + 1 });
});

hr.get('/leave/:staffId', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM leave_ledger WHERE staff_id = ? ORDER BY entry_date').bind(c.req.param('staffId')).all()).results));

hr.post('/leave', async (c) => {
  const b = await c.req.json<{ staff_id: string; entry_date: string; type: string; days: number }>();
  const u = c.get('user');
  if (b.type === 'accrual' && !['HR', 'OD', 'ED'].includes(u.role)) return c.json({ error: 'accruals are posted by HR' }, 403);
  if (b.type !== 'accrual' && !['PM', 'HR', 'OD', 'ED'].includes(u.role)) return c.json({ error: 'leave is approved by the line manager (PM) or above' }, 403);
  await c.env.DB.prepare('INSERT INTO leave_ledger (staff_id, entry_date, type, days, approved_by) VALUES (?,?,?,?,?)').bind(b.staff_id, b.entry_date, b.type, b.days, u.name).run();
  await audit(c, 'create', 'leave', b.staff_id, b);
  return c.json({ ok: true }, 201);
});

hr.get('/contracts', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM contracts ORDER BY end_date').all()).results));

hr.get('/terminations', requireRole('HR'), async (c) => c.json((await c.env.DB.prepare('SELECT t.*, s.name FROM terminations t JOIN staff s ON s.id = t.staff_id ORDER BY created_at DESC').all()).results.map((r) => ({ ...r, evidence: JSON.parse(String(r.evidence_json)), gaps: terminationGaps(r.rationale as TerminationRationale, JSON.parse(String(r.evidence_json))) }))));

/** Propose a termination: validated against the four rationales and their evidence set. Decision is ED only. */
hr.post('/terminations', requireRole('OD'), async (c) => {
  const b = await c.req.json<{ staff_id: string; rationale: TerminationRationale; evidence: Record<string, unknown>; proposed_last_day: string }>();
  if (!TERMINATION_RATIONALES.includes(b.rationale)) return c.json({ error: `rationale must be one of ${TERMINATION_RATIONALES.join(', ')}` }, 400);
  const gaps = terminationGaps(b.rationale, b.evidence ?? {});
  if (gaps.length) return c.json({ error: 'evidence incomplete for this rationale', gaps }, 422);
  const id = newId('TERM');
  await c.env.DB.prepare('INSERT INTO terminations (id, staff_id, rationale, evidence_json, proposed_last_day, proposed_by) VALUES (?,?,?,?,?,?)')
    .bind(id, b.staff_id, b.rationale, JSON.stringify(b.evidence), b.proposed_last_day, c.get('user').name).run();
  await audit(c, 'propose', 'termination', id, b);
  return c.json({ id }, 201);
});

hr.post('/terminations/:id/decide', requireRole('ED'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ approve: boolean; note?: string }>();
  const t = await c.env.DB.prepare('SELECT * FROM terminations WHERE id = ?').bind(id).first<{ staff_id: string; proposed_last_day: string; status: string }>();
  if (!t || t.status !== 'proposed') return c.json({ error: 'not found or already decided' }, 404);
  await c.env.DB.prepare("UPDATE terminations SET status = ?, decided_by = ?, decided_at = datetime('now') WHERE id = ?").bind(b.approve ? 'approved' : 'rejected', c.get('user').name, id).run();
  if (b.approve) {
    await c.env.DB.prepare("UPDATE staff SET status = 'leaving', end_date = ? WHERE id = ?").bind(t.proposed_last_day, t.staff_id).run();
    await c.env.DB.prepare("UPDATE contracts SET status = 'terminating', end_date = ? WHERE staff_id = ? AND status = 'active'").bind(t.proposed_last_day, t.staff_id).run();
  }
  await audit(c, b.approve ? 'approve' : 'reject', 'termination', id, b);
  return c.json({ ok: true });
});

hr.get('/vacancies', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM vacancies ORDER BY closes_at DESC').all()).results.map((v) => ({ ...v, essential_criteria: JSON.parse(String(v.essential_criteria_json)) }))));

hr.get('/candidates', requireRole('HR'), async (c) => {
  const ref = c.req.query('vacancy');
  const q = ref ? c.env.DB.prepare('SELECT * FROM candidates WHERE vacancy_ref = ? ORDER BY candidate_ref').bind(ref) : c.env.DB.prepare('SELECT * FROM candidates ORDER BY vacancy_ref, candidate_ref');
  return c.json((await q.all()).results.map((r) => ({ ...r, screen: r.screen_json ? JSON.parse(String(r.screen_json)) : null, rubric: r.rubric_json ? JSON.parse(String(r.rubric_json)) : null })));
});

hr.post('/candidates', requireRole('HR'), async (c) => {
  const b = await c.req.json<{ vacancy_ref: string; candidate_ref?: string; cv_text: string }>();
  if (!b.vacancy_ref || !b.cv_text) return c.json({ error: 'vacancy_ref and cv_text required' }, 400);
  const id = newId('CAND');
  await c.env.DB.prepare('INSERT INTO candidates (id, vacancy_ref, candidate_ref, cv_text) VALUES (?,?,?,?)').bind(id, b.vacancy_ref, b.candidate_ref ?? id, b.cv_text).run();
  await audit(c, 'create', 'candidate', id);
  return c.json({ id }, 201);
});

/** Panel scoring: stores per-panellist 1-5 scores and computes the weighted total. Decision stays human. */
hr.post('/candidates/:id/rubric', requireRole('HR'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ panellist: string; scores: Record<string, number>; conflict_declared?: boolean }>();
  for (const v of Object.values(b.scores)) if (v < 1 || v > 5) return c.json({ error: 'scores must be 1-5' }, 400);
  const row = await c.env.DB.prepare('SELECT rubric_json FROM candidates WHERE id = ?').bind(id).first<{ rubric_json: string | null }>();
  if (!row) return c.json({ error: 'not found' }, 404);
  const rubric = row.rubric_json ? JSON.parse(row.rubric_json) : { panel: [] };
  rubric.panel = rubric.panel.filter((p: { panellist: string }) => p.panellist !== b.panellist);
  rubric.panel.push({ panellist: b.panellist, scores: b.scores, weighted: rubricScore(b.scores), conflict_declared: !!b.conflict_declared });
  rubric.average = Math.round((rubric.panel.reduce((s: number, p: { weighted: number }) => s + p.weighted, 0) / rubric.panel.length) * 100) / 100;
  rubric.divergence = rubric.panel.length > 1 && Math.max(...rubric.panel.map((p: { weighted: number }) => p.weighted)) - Math.min(...rubric.panel.map((p: { weighted: number }) => p.weighted)) > 1.5;
  await c.env.DB.prepare('UPDATE candidates SET rubric_json = ? WHERE id = ?').bind(JSON.stringify(rubric), id).run();
  await audit(c, 'score', 'candidate', id, b);
  return c.json(rubric);
});

hr.post('/candidates/:id/status', requireRole('HR'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ status: string }>();
  await c.env.DB.prepare('UPDATE candidates SET status = ? WHERE id = ?').bind(b.status, id).run();
  await audit(c, 'status', 'candidate', id, b);
  return c.json({ ok: true });
});
