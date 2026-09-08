import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole, newId } from '../lib/auth.ts';
import { procurementRoute, venueScore, travelApprover, canApprove, segregated, daysBetween, VISA_LEAD_DAYS, VENUE_WEIGHTS, type Role } from '../lib/rules.ts';

export const logistics = new Hono<{ Bindings: Env; Variables: Vars }>();

logistics.get('/procurements', async (c) => c.json((await c.env.DB.prepare('SELECT * FROM procurements ORDER BY created_at DESC').all()).results));

logistics.post('/procurements', async (c) => {
  const b = await c.req.json<{ project_code: string; budget_line_id?: string; description: string; est_value_usd: number }>();
  if (!b.project_code || !b.description || !(b.est_value_usd > 0)) return c.json({ error: 'project_code, description, est_value_usd required' }, 400);
  const r = procurementRoute(b.est_value_usd);
  const id = newId('PR');
  await c.env.DB.prepare('INSERT INTO procurements (id, project_code, budget_line_id, description, est_value_usd, route, required_role, requested_by) VALUES (?,?,?,?,?,?,?,?)')
    .bind(id, b.project_code, b.budget_line_id ?? null, b.description, b.est_value_usd, r.route, r.approver, c.get('user').name).run();
  await audit(c, 'request', 'procurement', id, { ...b, ...r });
  return c.json({ id, ...r }, 201);
});

logistics.post('/procurements/:id/quotes', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ quotes_received: number; supplier?: string }>();
  await c.env.DB.prepare("UPDATE procurements SET quotes_received = ?, supplier = COALESCE(?, supplier), status = 'quoting', updated_at = datetime('now') WHERE id = ?").bind(b.quotes_received, b.supplier ?? null, id).run();
  await audit(c, 'quotes', 'procurement', id, b);
  return c.json({ ok: true });
});

/** Approval enforces the quote minimum for the route and segregation from the requester. */
logistics.post('/procurements/:id/decide', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ approve: boolean; po_number?: string; note?: string }>();
  const p = await c.env.DB.prepare('SELECT * FROM procurements WHERE id = ?').bind(id).first<{ est_value_usd: number; quotes_received: number; required_role: Role; requested_by: string; status: string }>();
  if (!p) return c.json({ error: 'not found' }, 404);
  if (!['requested', 'quoting'].includes(p.status)) return c.json({ error: `already ${p.status}` }, 409);
  const u = c.get('user');
  if (!canApprove(u.role, p.required_role)) return c.json({ error: `requires ${p.required_role}; you are ${u.role}` }, 403);
  if (!segregated(p.requested_by, u.name)) return c.json({ error: 'segregation of duties: requester cannot approve' }, 403);
  const r = procurementRoute(p.est_value_usd);
  if (b.approve && p.quotes_received < r.minQuotes) return c.json({ error: `${r.route} requires ${r.minQuotes} quotes; ${p.quotes_received} recorded` }, 422);
  await c.env.DB.prepare("UPDATE procurements SET status = ?, approver = ?, po_number = COALESCE(?, po_number), updated_at = datetime('now') WHERE id = ?").bind(b.approve ? 'approved' : 'rejected', u.name, b.po_number ?? null, id).run();
  await audit(c, b.approve ? 'approve' : 'reject', 'procurement', id, b);
  return c.json({ ok: true });
});

logistics.post('/procurements/:id/status', requireRole('FM'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ status: 'ordered' | 'received' | 'paid'; po_number?: string }>();
  await c.env.DB.prepare("UPDATE procurements SET status = ?, po_number = COALESCE(?, po_number), updated_at = datetime('now') WHERE id = ?").bind(b.status, b.po_number ?? null, id).run();
  await audit(c, 'status', 'procurement', id, b);
  return c.json({ ok: true });
});

logistics.get('/venues', async (c) => c.json({ weights: VENUE_WEIGHTS, venues: (await c.env.DB.prepare('SELECT * FROM venues ORDER BY event, weighted_score DESC').all()).results.map((v) => ({ ...v, scores: JSON.parse(String(v.scores_json)) })) }));

logistics.post('/venues', async (c) => {
  const b = await c.req.json<{ event: string; project_code: string; name: string; city: string; scores: Record<string, number>; quoted_usd: number; participants?: number; site_visit?: string }>();
  let score: number;
  try { score = venueScore(b.scores); } catch (e) { return c.json({ error: (e as Error).message }, 400); }
  const needsVisit = (b.participants ?? 0) > 30 || b.quoted_usd > 3000;
  const id = newId('VN');
  await c.env.DB.prepare('INSERT INTO venues (id, event, project_code, name, city, scores_json, weighted_score, quoted_usd, participants, site_visit) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.event, b.project_code, b.name, b.city, JSON.stringify(b.scores), score, b.quoted_usd, b.participants ?? 0, b.site_visit ?? null).run();
  await audit(c, 'create', 'venue', id, b);
  return c.json({ id, weighted_score: score, site_visit_required: needsVisit }, 201);
});

logistics.post('/venues/:id/select', requireRole('OD'), async (c) => {
  const id = c.req.param('id');
  const v = await c.env.DB.prepare('SELECT * FROM venues WHERE id = ?').bind(id).first<{ event: string; participants: number; quoted_usd: number; site_visit: string | null }>();
  if (!v) return c.json({ error: 'not found' }, 404);
  if ((v.participants > 30 || v.quoted_usd > 3000) && !v.site_visit) return c.json({ error: 'site visit required before selection (above 30 participants or USD 3,000)' }, 422);
  await c.env.DB.prepare('UPDATE venues SET recommended = 0, approved_by = NULL WHERE event = ?').bind(v.event).run();
  await c.env.DB.prepare('UPDATE venues SET recommended = 1, approved_by = ? WHERE id = ?').bind(c.get('user').name, id).run();
  await audit(c, 'select', 'venue', id);
  return c.json({ ok: true });
});

logistics.get('/travel', async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  return c.json((await c.env.DB.prepare('SELECT * FROM travel ORDER BY depart_date DESC').all()).results.map((t) => ({ ...t, days_to_depart: daysBetween(today, String(t.depart_date)), advance_overdue: !t.settled_at && Number(t.advance_usd) > 0 && daysBetween(String(t.return_date), today) > 10 })));
});

logistics.post('/travel', async (c) => {
  const b = await c.req.json<{ project_code: string; destination: string; purpose: string; depart_date: string; return_date: string; international?: boolean; visa_required?: boolean; advance_usd?: number; traveller?: string }>();
  if (!b.project_code || !b.destination || !b.purpose || !b.depart_date || !b.return_date) return c.json({ error: 'project_code, destination, purpose, depart_date, return_date required' }, 400);
  const intl = !!b.international; const visa = !!b.visa_required;
  const warnings: string[] = [];
  const lead = daysBetween(new Date().toISOString().slice(0, 10), b.depart_date);
  if (visa && lead < VISA_LEAD_DAYS) warnings.push(`visa travel should be requested ${VISA_LEAD_DAYS}+ days ahead; ${lead} days remain`);
  const id = newId('TRV');
  await c.env.DB.prepare('INSERT INTO travel (id, traveller, project_code, destination, purpose, depart_date, return_date, international, visa_required, visa_status, advance_usd, required_role) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.traveller ?? c.get('user').name, b.project_code, b.destination, b.purpose, b.depart_date, b.return_date, intl ? 1 : 0, visa ? 1 : 0, visa ? 'not started' : 'n/a', b.advance_usd ?? 0, travelApprover(intl)).run();
  await audit(c, 'request', 'travel', id, { ...b, warnings });
  return c.json({ id, required_role: travelApprover(intl), warnings }, 201);
});

logistics.post('/travel/:id/decide', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ approve: boolean }>();
  const t = await c.env.DB.prepare('SELECT * FROM travel WHERE id = ?').bind(id).first<{ required_role: Role; traveller: string; status: string }>();
  if (!t) return c.json({ error: 'not found' }, 404);
  const u = c.get('user');
  if (!canApprove(u.role, t.required_role)) return c.json({ error: `requires ${t.required_role}` }, 403);
  if (!segregated(t.traveller, u.name)) return c.json({ error: 'travellers cannot authorise their own travel' }, 403);
  await c.env.DB.prepare('UPDATE travel SET status = ?, authorised_by = ? WHERE id = ?').bind(b.approve ? 'authorised' : 'rejected', u.name, id).run();
  await audit(c, b.approve ? 'authorise' : 'reject', 'travel', id);
  return c.json({ ok: true });
});

/** Embassy handling: visa status, appointment, passport custody receipt. Advance is only releasable once visa is issued. */
logistics.post('/travel/:id/visa', requireRole('HR'), async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ visa_status: string; embassy_appointment?: string; passport_custody_ref?: string }>();
  await c.env.DB.prepare('UPDATE travel SET visa_status = ?, embassy_appointment = COALESCE(?, embassy_appointment), passport_custody_ref = COALESCE(?, passport_custody_ref) WHERE id = ?').bind(b.visa_status, b.embassy_appointment ?? null, b.passport_custody_ref ?? null, id).run();
  await audit(c, 'visa', 'travel', id, b);
  return c.json({ ok: true });
});

logistics.post('/travel/:id/settle', requireRole('FM'), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("UPDATE travel SET settled_at = datetime('now'), status = 'completed' WHERE id = ?").bind(id).run();
  await audit(c, 'settle', 'travel', id);
  return c.json({ ok: true });
});
