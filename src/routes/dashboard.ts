import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { indicatorProgress } from './me.ts';
import { budgetVsActual } from './finance.ts';
import { daysBetween, CONTRACT_ALERT_DAYS, PROBATION_ALERT_DAYS, LEAVE_BALANCE_ALERT, ADVANCE_SETTLEMENT_DAYS, BURN_ALERT_PCT, MAX_MONTH_TO_MONTH_RENEWALS } from '../lib/rules.ts';

export const dashboard = new Hono<{ Bindings: Env; Variables: Vars }>();

export type Alert = { severity: 'high' | 'medium' | 'low'; domain: 'hr' | 'finance' | 'me' | 'logistics'; item: string; owner: string; due?: string; rule: string; next_step: string };

export async function computeAlerts(db: D1Database, today = new Date().toISOString().slice(0, 10)): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const contracts = (await db.prepare("SELECT * FROM contracts WHERE status = 'active'").all<{ id: string; party: string; type: string; end_date: string; renewal_count: number }>()).results;
  for (const ct of contracts) {
    const d = daysBetween(today, ct.end_date);
    if (d < 0) alerts.push({ severity: 'high', domain: 'hr', item: `${ct.id} ${ct.party}`, owner: 'HR Officer', due: ct.end_date, rule: 'contract expired', next_step: 'renew by amendment or close and offboard' });
    else if (d <= CONTRACT_ALERT_DAYS) alerts.push({ severity: d <= 14 ? 'high' : 'medium', domain: 'hr', item: `${ct.id} ${ct.party}`, owner: 'HR Officer', due: ct.end_date, rule: `contract ends in ${d} days (alert at ${CONTRACT_ALERT_DAYS})`, next_step: 'confirm funding, prepare renewal or notice letter' });
  }
  const staff = (await db.prepare("SELECT * FROM staff WHERE status = 'active'").all<{ id: string; name: string; contract_type: string; probation_end: string | null; renewal_count: number }>()).results;
  for (const s of staff) {
    if (s.probation_end) { const d = daysBetween(today, s.probation_end); if (d >= 0 && d <= PROBATION_ALERT_DAYS) alerts.push({ severity: 'medium', domain: 'hr', item: `${s.id} ${s.name}`, owner: 'Line manager', due: s.probation_end, rule: `probation ends in ${d} days`, next_step: 'hold probation review, confirm or extend in writing' }); }
    if (s.contract_type === 'month-to-month' && s.renewal_count >= MAX_MONTH_TO_MONTH_RENEWALS - 1) alerts.push({ severity: 'medium', domain: 'hr', item: `${s.id} ${s.name}`, owner: 'Operations Director', rule: `month-to-month renewal count ${s.renewal_count} (limit ${MAX_MONTH_TO_MONTH_RENEWALS})`, next_step: 'Executive Director review: convert to fixed term or end' });
  }
  const leave = (await db.prepare("SELECT l.staff_id, s.name, SUM(CASE WHEN l.type IN ('accrual','annual') THEN l.days ELSE 0 END) AS balance FROM leave_ledger l JOIN staff s ON s.id = l.staff_id GROUP BY l.staff_id").all<{ staff_id: string; name: string; balance: number }>()).results;
  for (const l of leave) if (l.balance > LEAVE_BALANCE_ALERT) alerts.push({ severity: 'low', domain: 'hr', item: `${l.staff_id} ${l.name}`, owner: 'Line manager', rule: `leave balance ${l.balance.toFixed(1)} days (alert above ${LEAVE_BALANCE_ALERT})`, next_step: 'plan leave before year end' });
  const bva = await budgetVsActual(db, undefined, today);
  for (const p of bva) {
    for (const line of p.lines) {
      if (line.burn_pct >= BURN_ALERT_PCT) alerts.push({ severity: line.burn_pct >= 1 ? 'high' : 'medium', domain: 'finance', item: `${p.project.code} line ${line.code} ${line.description}`, owner: 'Finance Manager', rule: `${Math.round(line.burn_pct * 100)}% burned`, next_step: line.burn_pct >= 1 ? 'stop spend on line, realignment request' : 'review forecast, prepare realignment if needed' });
      else if (line.flag === 'Review') alerts.push({ severity: 'low', domain: 'finance', item: `${p.project.code} line ${line.code} ${line.description}`, owner: 'Project Manager', rule: `variance vs time ${Math.round(line.variance_pct * 100)}% (limit ${Math.round(p.project.flexibility_pct * 100)}%)`, next_step: 'written explanation at monthly BvA' });
    }
    if (p.totals.forecast_variance_usd > 0) alerts.push({ severity: 'high', domain: 'finance', item: p.project.code, owner: 'Executive Director', rule: `forecast overspend USD ${Math.round(p.totals.forecast_variance_usd).toLocaleString('en-GB')}`, next_step: 'ED decision and cover plan' });
  }
  const pending = (await db.prepare("SELECT id, claimant, usd_amount, required_role, submitted_at FROM expenses WHERE status = 'submitted'").all<{ id: string; claimant: string; usd_amount: number; required_role: string; submitted_at: string }>()).results;
  for (const e of pending) { const age = daysBetween(e.submitted_at.slice(0, 10), today); if (age > 5) alerts.push({ severity: 'low', domain: 'finance', item: `${e.id} ${e.claimant} USD ${e.usd_amount}`, owner: e.required_role, rule: `awaiting approval ${age} days`, next_step: 'approve or reject' }); }
  const travel = (await db.prepare("SELECT * FROM travel WHERE status IN ('authorised','requested')").all<{ id: string; traveller: string; return_date: string; depart_date: string; advance_usd: number; settled_at: string | null; visa_required: number; visa_status: string; status: string }>()).results;
  for (const t of travel) {
    if (!t.settled_at && t.advance_usd > 0 && daysBetween(t.return_date, today) > ADVANCE_SETTLEMENT_DAYS) alerts.push({ severity: 'medium', domain: 'logistics', item: `${t.id} ${t.traveller}`, owner: 'Finance Manager', due: t.return_date, rule: `advance USD ${t.advance_usd} unsettled ${daysBetween(t.return_date, today)} days after return`, next_step: 'chase settlement with receipts' });
    if (t.visa_required && t.visa_status !== 'issued' && daysBetween(today, t.depart_date) <= 21) alerts.push({ severity: 'high', domain: 'logistics', item: `${t.id} ${t.traveller}`, owner: 'HR Officer', due: t.depart_date, rule: `visa ${t.visa_status}, departure in ${daysBetween(today, t.depart_date)} days`, next_step: 'confirm embassy appointment or reschedule travel' });
  }
  const inds = await indicatorProgress(db);
  for (const i of inds) {
    if (i.rag === 'R') alerts.push({ severity: 'medium', domain: 'me', item: `${i.id} ${i.definition}`, owner: 'Project Manager', rule: `${i.pct === null ? 'no data' : Math.round(i.pct * 100) + '% of target'}`, next_step: 'adaptation note in quarterly report' });
    if (i.unverified) alerts.push({ severity: 'low', domain: 'me', item: `${i.id}`, owner: 'M&E Officer', rule: `${i.unverified} unverified value(s)`, next_step: 'spot check and verify' });
  }
  const tr = await db.prepare("SELECT COUNT(*) AS n FROM translations WHERE status IN ('draft','translated')").first<{ n: number }>();
  if (tr && tr.n > 0) alerts.push({ severity: 'low', domain: 'me', item: `${tr.n} translation item(s) awaiting review`, owner: 'M&E Officer', rule: 'translation backlog', next_step: 'run QA and meaning review' });
  const order = { high: 0, medium: 1, low: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

dashboard.get('/', async (c) => {
  const today = c.req.query('as_of') || new Date().toISOString().slice(0, 10);
  const [bva, inds, alerts] = await Promise.all([budgetVsActual(c.env.DB, undefined, today), indicatorProgress(c.env.DB), computeAlerts(c.env.DB, today)]);
  const staff = await c.env.DB.prepare("SELECT contract_type, COUNT(*) AS n FROM staff WHERE status = 'active' GROUP BY contract_type").all<{ contract_type: string; n: number }>();
  const expenses = await c.env.DB.prepare('SELECT status, COUNT(*) AS n, SUM(usd_amount) AS usd FROM expenses GROUP BY status').all<{ status: string; n: number; usd: number }>();
  const monthly = await c.env.DB.prepare("SELECT project_code, substr(expense_date,1,7) AS month, SUM(usd_amount) AS usd FROM expenses WHERE status IN ('approved','paid') GROUP BY project_code, month ORDER BY month").all<{ project_code: string; month: string; usd: number }>();
  const translations = await c.env.DB.prepare('SELECT status, COUNT(*) AS n FROM translations GROUP BY status').all<{ status: string; n: number }>();
  const procurement = await c.env.DB.prepare('SELECT status, COUNT(*) AS n FROM procurements GROUP BY status').all<{ status: string; n: number }>();
  return c.json({ as_of: today, alerts, budget: bva, indicators: inds, staff: staff.results, expenses: expenses.results, monthly_spend: monthly.results, translations: translations.results, procurement: procurement.results });
});

dashboard.get('/alerts', async (c) => c.json(await computeAlerts(c.env.DB, c.req.query('as_of') || undefined)));
