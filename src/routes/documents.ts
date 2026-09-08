import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole } from '../lib/auth.ts';
import { offerLetter, employmentContract, noticeLetter, terminationLetter, travelAuthorisation, procurementRequest, visaSupportLetter, type StaffRow, type AllocRow } from '../lib/documents.ts';

export const documents = new Hono<{ Bindings: Env; Variables: Vars }>();

async function staffWithAllocs(db: D1Database, id: string) {
  const s = await db.prepare('SELECT * FROM staff WHERE id = ?').bind(id).first<StaffRow>();
  if (!s) return null;
  const allocs = (await db.prepare('SELECT project_code, pct FROM staff_allocations WHERE staff_id = ?').bind(id).all<AllocRow>()).results;
  return { s, allocs };
}

documents.get('/offer/:staffId', requireRole('HR'), async (c) => {
  const r = await staffWithAllocs(c.env.DB, c.req.param('staffId'));
  if (!r) return c.text('not found', 404);
  await audit(c, 'generate', 'document', `offer/${r.s.id}`);
  return c.html(offerLetter(r.s, r.allocs));
});

documents.get('/contract/:staffId', requireRole('HR'), async (c) => {
  const r = await staffWithAllocs(c.env.DB, c.req.param('staffId'));
  if (!r) return c.text('not found', 404);
  if (r.s.contract_type === 'consultant' || r.s.contract_type === 'daily') return c.text('use the consultancy or daily worker agreement (not in PoC)', 400);
  await audit(c, 'generate', 'document', `contract/${r.s.id}`);
  return c.html(employmentContract(r.s, r.allocs));
});

documents.get('/notice/:staffId', requireRole('HR'), async (c) => {
  const r = await staffWithAllocs(c.env.DB, c.req.param('staffId'));
  if (!r) return c.text('not found', 404);
  const kind = c.req.query('kind') === 'resignation' ? 'resignation' : 'employer';
  const lastDay = c.req.query('last_day') || r.s.end_date || '[last day]';
  await audit(c, 'generate', 'document', `notice/${r.s.id}`, { kind, lastDay });
  return c.html(noticeLetter(r.s, kind, lastDay));
});

/** Termination letters are only generated from an ED-approved termination record. */
documents.get('/termination/:terminationId', requireRole('HR'), async (c) => {
  const t = await c.env.DB.prepare('SELECT * FROM terminations WHERE id = ?').bind(c.req.param('terminationId')).first<{ staff_id: string; rationale: string; proposed_last_day: string; status: string; decided_by: string | null }>();
  if (!t) return c.text('not found', 404);
  if (t.status !== 'approved') return c.text(`termination ${t.status}: letter can only be generated after Executive Director approval`, 409);
  const r = await staffWithAllocs(c.env.DB, t.staff_id);
  if (!r) return c.text('staff not found', 404);
  await audit(c, 'generate', 'document', `termination/${c.req.param('terminationId')}`);
  return c.html(terminationLetter(r.s, t.rationale, t.proposed_last_day, t.decided_by));
});

documents.get('/travel/:id', async (c) => {
  const t = await c.env.DB.prepare('SELECT * FROM travel WHERE id = ?').bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!t) return c.text('not found', 404);
  return c.html(travelAuthorisation(t));
});

documents.get('/visa-letter/:id', requireRole('HR'), async (c) => {
  const t = await c.env.DB.prepare('SELECT * FROM travel WHERE id = ?').bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!t) return c.text('not found', 404);
  if (t.status !== 'authorised') return c.text('travel must be authorised before a visa letter is issued', 409);
  const s = await c.env.DB.prepare('SELECT * FROM staff WHERE name = ?').bind(t.traveller).first<StaffRow>();
  await audit(c, 'generate', 'document', `visa-letter/${t.id}`);
  return c.html(visaSupportLetter(t, s));
});

documents.get('/procurement/:id', async (c) => {
  const p = await c.env.DB.prepare('SELECT * FROM procurements WHERE id = ?').bind(c.req.param('id')).first<Record<string, unknown>>();
  if (!p) return c.text('not found', 404);
  return c.html(procurementRequest(p));
});
