import { Hono } from 'hono';
import type { Env, Vars } from '../lib/auth.ts';
import { audit, requireRole } from '../lib/auth.ts';
import { runTask, translationQaPrompt, cvScreenPrompt, reportDraftPrompt, expenseTriagePrompt, PROMPT_VERSION } from '../lib/ai.ts';
import { indicatorProgress } from './me.ts';

export const ai = new Hono<{ Bindings: Env; Variables: Vars }>();

async function logAi(c: { env: Env; get: (k: 'user') => { email: string } }, task: string, provider: string, model: string | undefined, inputChars: number, ok: boolean) {
  await c.env.DB.prepare('INSERT INTO ai_log (actor, task, provider, model, prompt_version, input_chars, ok) VALUES (?,?,?,?,?,?,?)').bind(c.get('user').email, task, provider, model ?? null, PROMPT_VERSION, inputChars, ok ? 1 : 0).run();
}

ai.get('/status', (c) => c.json({ provider: c.env.AI_PROVIDER, model: c.env.AI_PROVIDER === 'anthropic' ? c.env.ANTHROPIC_MODEL : c.env.AI_PROVIDER === 'workers-ai' ? c.env.WORKERS_AI_MODEL : 'mock', prompt_version: PROMPT_VERSION }));

/** Translation QA: flags only. Stores the flag list on the translation record; never overwrites the human's English. */
ai.post('/translation-qa', async (c) => {
  const b = await c.req.json<{ ids?: string[] }>();
  const rows = b.ids?.length
    ? (await c.env.DB.prepare(`SELECT id, arabic_text, english_text FROM translations WHERE id IN (${b.ids.map(() => '?').join(',')}) AND english_text IS NOT NULL`).bind(...b.ids).all<{ id: string; arabic_text: string; english_text: string }>()).results
    : (await c.env.DB.prepare("SELECT id, arabic_text, english_text FROM translations WHERE status = 'translated' AND english_text IS NOT NULL").all<{ id: string; arabic_text: string; english_text: string }>()).results;
  if (!rows.length) return c.json({ error: 'no translated items to check' }, 400);
  const glossary = (await c.env.DB.prepare('SELECT arabic, english, do_not_use FROM glossary').all<{ arabic: string; english: string; do_not_use: string | null }>()).results;
  const prompt = translationQaPrompt(rows.map((r) => ({ id: r.id, arabic: r.arabic_text, english: r.english_text })), glossary);
  const res = await runTask(c.env, 'translation-qa', prompt);
  await logAi(c, 'translation-qa', res.provider, res.model, prompt.length, res.ok);
  if (!res.ok) return c.json({ error: res.error, provider: res.provider }, 502);
  const out = res.output as { items?: { id: string; issues: unknown[]; ready_for_meaning_review: boolean }[] };
  for (const item of out.items ?? []) {
    await c.env.DB.prepare("UPDATE translations SET qa_json = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify({ ...item, provider: res.provider, prompt_version: PROMPT_VERSION, at: new Date().toISOString() }), item.id).run();
  }
  await audit(c, 'ai-translation-qa', 'translation', rows.map((r) => r.id).join(','), { provider: res.provider });
  return c.json({ provider: res.provider, model: res.model, result: res.output });
});

/** CV pre-screen: essential criteria pass/fail. HR decides the longlist. */
ai.post('/cv-screen', requireRole('HR'), async (c) => {
  const b = await c.req.json<{ vacancy_ref: string }>();
  const v = await c.env.DB.prepare('SELECT * FROM vacancies WHERE ref = ?').bind(b.vacancy_ref).first<{ essential_criteria_json: string }>();
  if (!v) return c.json({ error: 'unknown vacancy' }, 404);
  const cands = (await c.env.DB.prepare("SELECT id, candidate_ref, cv_text FROM candidates WHERE vacancy_ref = ? AND status = 'received'").bind(b.vacancy_ref).all<{ id: string; candidate_ref: string; cv_text: string }>()).results;
  if (!cands.length) return c.json({ error: 'no unscreened candidates' }, 400);
  const prompt = cvScreenPrompt(JSON.parse(v.essential_criteria_json), cands.map((x) => ({ ref: x.candidate_ref, cv: x.cv_text })));
  const res = await runTask(c.env, 'cv-screen', prompt);
  await logAi(c, 'cv-screen', res.provider, res.model, prompt.length, res.ok);
  if (!res.ok) return c.json({ error: res.error, provider: res.provider }, 502);
  const out = res.output as { candidates?: { ref: string }[] };
  for (const sc of out.candidates ?? []) {
    const cand = cands.find((x) => x.candidate_ref === sc.ref);
    if (cand) await c.env.DB.prepare('UPDATE candidates SET screen_json = ? WHERE id = ?').bind(JSON.stringify({ ...sc, provider: res.provider, prompt_version: PROMPT_VERSION }), cand.id).run();
  }
  await audit(c, 'ai-cv-screen', 'vacancy', b.vacancy_ref, { provider: res.provider, n: cands.length });
  return c.json({ provider: res.provider, model: res.model, result: res.output });
});

/** Report draft: narrative sections from the ITT. Every number must cite an indicator ID. */
ai.post('/report-draft', async (c) => {
  const b = await c.req.json<{ project_code: string; period: string; dq_notes?: string[]; activity_notes?: string[] }>();
  const p = await c.env.DB.prepare('SELECT code, name, donor FROM projects WHERE code = ?').bind(b.project_code).first<{ code: string; name: string; donor: string }>();
  if (!p) return c.json({ error: 'unknown project' }, 404);
  const inds = await indicatorProgress(c.env.DB, b.project_code);
  const prompt = reportDraftPrompt(p, b.period, inds.map((i) => ({ id: i.id, definition: i.definition, unit: i.unit, baseline: i.baseline, target: i.target, cumulative: i.cumulative, pct: i.pct, rag: i.rag })), b.dq_notes ?? [], b.activity_notes ?? []);
  const res = await runTask(c.env, 'report-draft', prompt);
  await logAi(c, 'report-draft', res.provider, res.model, prompt.length, res.ok);
  if (!res.ok) return c.json({ error: res.error, provider: res.provider }, 502);
  await audit(c, 'ai-report-draft', 'project', b.project_code, { period: b.period, provider: res.provider });
  return c.json({ provider: res.provider, model: res.model, indicators: inds, result: res.output });
});

/** Expense triage for the submitted queue. Advisory only. */
ai.post('/expense-triage', requireRole('FM'), async (c) => {
  const b = await c.req.json<{ project_code: string }>();
  const p = await c.env.DB.prepare('SELECT start_date, end_date FROM projects WHERE code = ?').bind(b.project_code).first<{ start_date: string; end_date: string }>();
  if (!p) return c.json({ error: 'unknown project' }, 404);
  const exp = (await c.env.DB.prepare("SELECT id, description, usd_amount, expense_date, receipt_ref, budget_line_id FROM expenses WHERE project_code = ? AND status = 'submitted'").bind(b.project_code).all<{ id: string; description: string; usd_amount: number; expense_date: string; receipt_ref: string | null; budget_line_id: string | null }>()).results;
  if (!exp.length) return c.json({ error: 'no submitted claims' }, 400);
  const lines = (await c.env.DB.prepare('SELECT id, code, description FROM budget_lines WHERE project_code = ?').bind(b.project_code).all<{ id: string; code: string; description: string }>()).results;
  const prompt = expenseTriagePrompt(exp.map((e) => ({ id: e.id, description: e.description, usd: e.usd_amount, date: e.expense_date, receipt: e.receipt_ref, line: e.budget_line_id ?? 'none' })), lines, ['VAT where recoverable', 'fines', 'alcohol', 'gifts', 'costs outside project period', 'unapproved international travel'], { start: p.start_date, end: p.end_date });
  const res = await runTask(c.env, 'expense-triage', prompt);
  await logAi(c, 'expense-triage', res.provider, res.model, prompt.length, res.ok);
  if (!res.ok) return c.json({ error: res.error, provider: res.provider }, 502);
  return c.json({ provider: res.provider, model: res.model, result: res.output });
});

ai.get('/log', requireRole('OD'), async (c) => c.json((await c.env.DB.prepare('SELECT * FROM ai_log ORDER BY id DESC LIMIT 100').all()).results));
