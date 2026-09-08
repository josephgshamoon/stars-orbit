import Anthropic from '@anthropic-ai/sdk';
import type { Env } from './auth.ts';

export const PROMPT_VERSION = '2026-09-08.1';

/** Frozen system prompt: the guardrails from prompts/ai-operations-assistant-prompt.md, kept byte-stable for caching. */
export const SYSTEM_PROMPT = `You are the SOC Operations Assistant for Stars Orbit Consultants and Management Development (Amman HQ, Iraq operations). You draft, check, translate, screen and summarise for the Operations Director, Finance Manager, HR Officer, M&E Officer and Project Managers.
You never approve, authorise, sign or release anything; when an action needs approval, name the approver and stop.
You never make hiring, termination or disciplinary decisions.
You never score or comment on a candidate's name, sex, age, nationality, religion, ethnicity, marital status or appearance.
You never invent a number, date, clause, law or donor rule; if it is not in the material provided, say "not in the material provided".
You never output beneficiary personal data; refer to record IDs only.
You never soften a compliance failure.
British spelling. No emojis. Respond with valid JSON only, no prose before or after, no markdown fences.`;

type Task = 'translation-qa' | 'cv-screen' | 'report-draft' | 'expense-triage';

export interface AiResult { ok: boolean; provider: string; model?: string; output: unknown; raw?: string; error?: string }

export async function runTask(env: Env, task: Task, userPrompt: string): Promise<AiResult> {
  const provider = env.AI_PROVIDER || 'workers-ai';
  try {
    let raw: string;
    let model: string | undefined;
    if (provider === 'mock') {
      raw = JSON.stringify(mock(task, userPrompt));
    } else if (provider === 'anthropic') {
      if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret not set');
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      model = env.ANTHROPIC_MODEL || 'claude-opus-5';
      const res = await client.beta.messages.create({
        model,
        max_tokens: 8000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      });
      if (res.stop_reason === 'refusal') throw new Error('model declined the request');
      raw = res.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('');
    } else {
      model = env.WORKERS_AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
      const res = (await env.AI.run(model as Parameters<Ai['run']>[0], {
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.2,
      } as never)) as { response?: string };
      raw = res.response ?? '';
    }
    const output = parseJson(raw);
    return { ok: true, provider, model, output, raw };
  } catch (e) {
    return { ok: false, provider, output: null, error: e instanceof Error ? e.message : String(e) };
  }
}

function parseJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(trimmed); } catch { /* fall through */ }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error('model did not return JSON');
}

// ---- Task prompt builders (the user turn; volatile content goes here, never in the system prompt)

export function translationQaPrompt(items: { id: string; arabic: string; english: string }[], glossary: { arabic: string; english: string; do_not_use: string | null }[]): string {
  return `Task: review Arabic source against English draft for meaning, omissions, additions, register, glossary compliance and personal data.
Glossary (Arabic -> preferred English; do not use):
${glossary.map((g) => `- ${g.arabic} -> ${g.english}${g.do_not_use ? ` (do not use: ${g.do_not_use})` : ''}`).join('\n')}

Items:
${items.map((i) => `ID ${i.id}\nARABIC: ${i.arabic}\nENGLISH: ${i.english}`).join('\n\n')}

Return JSON: {"items":[{"id":string,"issues":[{"type":"omission"|"addition"|"meaning"|"register"|"glossary"|"pii","severity":"high"|"medium"|"low","excerpt_en":string,"fix":string}],"ready_for_meaning_review":boolean}],"summary":string}`;
}

export function cvScreenPrompt(criteria: string[], candidates: { ref: string; cv: string }[]): string {
  return `Task: pre-screen CVs against essential criteria. Pass/fail only, no ranking. Ignore name, sex, age, nationality (except right-to-work), religion, ethnicity, marital status.
Essential criteria:
${criteria.map((c, i) => `E${i + 1}: ${c}`).join('\n')}

Candidates:
${candidates.map((c) => `REF ${c.ref}\n${c.cv}`).join('\n\n')}

Return JSON: {"candidates":[{"ref":string,"criteria":[{"id":string,"met":"yes"|"no"|"unclear","evidence":string}],"result":"pass"|"fail"|"unclear","note":string}]}`;
}

export function reportDraftPrompt(project: { code: string; name: string; donor: string }, period: string, indicators: { id: string; definition: string; unit: string; baseline: number; target: number; cumulative: number | null; pct: number | null; rag: string }[], dq: string[], activities: string[]): string {
  return `Task: draft sections of the quarterly M&E report for ${project.code} (${project.name}, donor ${project.donor}), period ${period}. Cite the indicator ID for every number as (source: ITT ${'<id>'}). Do not invent figures.
Indicators:
${indicators.map((i) => `${i.id}: ${i.definition} | unit ${i.unit} | baseline ${i.baseline} | target ${i.target} | cumulative ${i.cumulative ?? 'no data'} | ${i.pct === null ? 'n/a' : Math.round(i.pct * 100) + '% of target'} | RAG ${i.rag}`).join('\n')}
Data quality log entries: ${dq.length ? dq.join('; ') : 'none provided'}
Activity notes: ${activities.length ? activities.join('; ') : 'none provided'}

Return JSON: {"executive_summary":string,"progress_against_indicators":string,"activity_progress":string,"challenges_and_risks":string,"data_quality_and_limitations":string,"missing":[string]}`;
}

export function expenseTriagePrompt(expenses: { id: string; description: string; usd: number; date: string; receipt: string | null; line: string }[], lines: { id: string; code: string; description: string }[], ineligible: string[], projectPeriod: { start: string; end: string }): string {
  return `Task: triage expense claims. Check each against budget lines, project period ${projectPeriod.start} to ${projectPeriod.end}, duplicates, missing receipts, amounts within 5% below an approval threshold (1000, 5000, 25000 USD), and the ineligible list. Name the required approver: PM up to 1000, FM to 5000, OD to 25000, ED above.
Budget lines: ${lines.map((l) => `${l.id} (${l.code} ${l.description})`).join('; ')}
Ineligible: ${ineligible.join('; ')}
Claims:
${expenses.map((e) => `${e.id} | ${e.date} | ${e.description} | USD ${e.usd} | line ${e.line} | receipt ${e.receipt ?? 'none'}`).join('\n')}

Return JSON: {"claims":[{"id":string,"suggested_line":string,"flags":[string],"required_approver":"PM"|"FM"|"OD"|"ED","recommendation":string}]}`;
}

// ---- Deterministic mock for local development and tests (no model call)

function mock(task: Task, prompt: string): unknown {
  switch (task) {
    case 'translation-qa': {
      const ids = [...prompt.matchAll(/^ID (\S+)/gm)].map((m) => m[1]);
      return { items: ids.map((id) => ({ id, issues: id === 'TR-0042' ? [
        { type: 'glossary', severity: 'high', excerpt_en: 'mayor', fix: 'mukhtar (community leader)' },
        { type: 'glossary', severity: 'high', excerpt_en: 'refugees who came back', fix: 'returnees' },
        { type: 'glossary', severity: 'medium', excerpt_en: 'housing card', fix: 'residency card' },
        { type: 'glossary', severity: 'medium', excerpt_en: 'province', fix: 'district (qadha)' },
      ] : [], ready_for_meaning_review: id !== 'TR-0042' })), summary: 'mock provider: glossary check only' };
    }
    case 'cv-screen': {
      const refs = [...prompt.matchAll(/^REF (\S+)/gm)].map((m) => m[1]);
      const crit = [...prompt.matchAll(/^(E\d+):/gm)].map((m) => m[1]);
      return { candidates: refs.map((ref) => ({ ref, criteria: crit.map((id) => ({ id, met: ref === 'C-002' && (id === 'E1' || id === 'E2' || id === 'E4') ? 'no' : 'yes', evidence: 'mock' })), result: ref === 'C-002' ? 'fail' : 'pass', note: 'mock provider' })) };
    }
    case 'report-draft':
      return { executive_summary: 'Mock draft. Replace AI_PROVIDER with workers-ai or anthropic for a real draft.', progress_against_indicators: '', activity_progress: '', challenges_and_risks: '', data_quality_and_limitations: '', missing: ['real model output'] };
    case 'expense-triage': {
      const ids = [...prompt.matchAll(/^(EXP-\S+) \|/gm)].map((m) => m[1]);
      return { claims: ids.map((id) => ({ id, suggested_line: 'as submitted', flags: [], required_approver: 'PM', recommendation: 'mock provider' })) };
    }
  }
}
