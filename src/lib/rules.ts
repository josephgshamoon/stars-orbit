// Business rules from the SOC Operations Playbook. Pure functions, no I/O, unit-tested in tests/rules.test.ts.

export type Role = 'ED' | 'OD' | 'FM' | 'PM' | 'ME' | 'HR' | 'STAFF';

export const ROLE_RANK: Record<Role, number> = { STAFF: 0, HR: 1, ME: 1, PM: 2, FM: 3, OD: 4, ED: 5 };

/** Expense approval matrix (USD). */
export function expenseApprover(usd: number): Role {
  if (usd <= 1000) return 'PM';
  if (usd <= 5000) return 'FM';
  if (usd <= 25000) return 'OD';
  return 'ED';
}

export type ProcurementRoute = 'single-quote' | 'three-quotes' | 'rfq-committee' | 'tender';

export function procurementRoute(usd: number): { route: ProcurementRoute; minQuotes: number; approver: Role; dueDiligence: boolean } {
  if (usd < 1000) return { route: 'single-quote', minQuotes: 1, approver: 'PM', dueDiligence: false };
  if (usd <= 5000) return { route: 'three-quotes', minQuotes: 3, approver: 'FM', dueDiligence: usd > 5000 };
  if (usd <= 25000) return { route: 'rfq-committee', minQuotes: 3, approver: 'OD', dueDiligence: true };
  return { route: 'tender', minQuotes: 3, approver: 'ED', dueDiligence: true };
}

export type ContractType = 'one-year' | 'month-to-month' | 'consultant' | 'daily';

export function noticeDays(type: ContractType, inProbation = false): number {
  switch (type) {
    case 'one-year': return inProbation ? 7 : 30;
    case 'month-to-month': return 15;
    case 'consultant': return 7;
    case 'daily': return 0;
  }
}

/** Month-to-month contracts may not run beyond 6 consecutive months (start + 5 renewals) without ED review. */
export const MAX_MONTH_TO_MONTH_RENEWALS = 6;

export const TERMINATION_RATIONALES = ['end-of-funding', 'non-performance', 'misconduct', 'redundancy'] as const;
export type TerminationRationale = typeof TERMINATION_RATIONALES[number];

/** Required evidence per rationale. Keys must be present and truthy in evidence. */
export const TERMINATION_EVIDENCE: Record<TerminationRationale, string[]> = {
  'end-of-funding': ['funding_end_reference', 'entitlements_calculated', 'donor_notified_if_key_personnel'],
  'non-performance': ['pip_start_date', 'pip_review_1', 'pip_review_2', 'pip_duration_days_gte_30'],
  'misconduct': ['investigation_report', 'employee_response_recorded', 'code_of_conduct_clause'],
  'redundancy': ['business_case', 'selection_criteria', 'consultation_record'],
};

export function terminationGaps(rationale: TerminationRationale, evidence: Record<string, unknown>): string[] {
  return TERMINATION_EVIDENCE[rationale].filter((k) => !evidence[k]);
}

export function travelApprover(international: boolean): Role {
  return international ? 'OD' : 'PM';
}

/** Travel abroad requiring a visa must be authorised at least 21 days before departure. */
export const VISA_LEAD_DAYS = 21;
export const ADVANCE_SETTLEMENT_DAYS = 10;
export const CONTRACT_ALERT_DAYS = 45;
export const PROBATION_ALERT_DAYS = 14;
export const LEAVE_BALANCE_ALERT = 15;
export const REPORT_ALERT_DAYS = 10;
export const BURN_ALERT_PCT = 0.9;

export const VENUE_WEIGHTS: Record<string, number> = { security: 0.25, room: 0.20, cost: 0.20, accessibility: 0.15, catering: 0.10, terms: 0.10 };

export function venueScore(scores: Record<string, number>): number {
  let total = 0;
  for (const [k, w] of Object.entries(VENUE_WEIGHTS)) {
    const s = Number(scores[k] ?? 0);
    if (s < 0 || s > 5) throw new Error(`score ${k} out of range 1-5`);
    total += s * w;
  }
  return Math.round(total * 100) / 100;
}

export const RUBRIC_WEIGHTS: Record<string, number> = { experience: 0.30, technical: 0.25, language: 0.15, context: 0.15, interview: 0.15 };

export function rubricScore(scores: Record<string, number>): number {
  let total = 0;
  for (const [k, w] of Object.entries(RUBRIC_WEIGHTS)) total += Number(scores[k] ?? 0) * w;
  return Math.round(total * 100) / 100;
}

export function ragStatus(pct: number | null): 'G' | 'A' | 'R' | '-' {
  if (pct === null || Number.isNaN(pct)) return '-';
  if (pct >= 0.9) return 'G';
  if (pct >= 0.6) return 'A';
  return 'R';
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso + 'T00:00:00Z');
  const b = Date.parse(toIso + 'T00:00:00Z');
  return Math.round((b - a) / 86400000);
}

export function canApprove(actor: Role, required: Role): boolean {
  return ROLE_RANK[actor] >= ROLE_RANK[required];
}

/** Segregation of duties: requester never approves their own item. */
export function segregated(requester: string, approver: string): boolean {
  return requester.trim().toLowerCase() !== approver.trim().toLowerCase();
}
