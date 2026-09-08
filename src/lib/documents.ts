// Server-rendered, print-ready HTML documents generated from live records. Replaces the Word templates in the PoC.

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function shell(title: string, body: string, missing: string[] = []): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;color:#111;max-width:800px;margin:40px auto;padding:0 24px;line-height:1.45}
h1{font-size:16pt;color:#1F3A5F;border-bottom:2px solid #1F3A5F;padding-bottom:6px}h2{font-size:12pt;color:#1F3A5F;margin-top:22px}
table{border-collapse:collapse;width:100%;margin:10px 0}td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef2f7}
.hdr{display:flex;justify-content:space-between;color:#555;font-size:9pt;margin-bottom:20px}.sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig div{border-top:1px solid #333;padding-top:6px}.missing{background:#fff3cd;border:1px solid #ffe08a;padding:8px 12px;margin:14px 0;font-size:10pt}
.tag{background:#fff3cd;padding:0 4px}@media print{.missing{display:none}}</style></head><body>
<div class="hdr"><span>Stars Orbit Consultants and Management Development</span><span>Generated ${esc(new Date().toISOString().slice(0, 10))}</span></div>
${missing.length ? `<div class="missing"><b>Fields to complete before signature:</b> ${missing.map(esc).join(', ')}</div>` : ''}
${body}</body></html>`;
}

const M = (label: string) => `<span class="tag">[${esc(label)}]</span>`;

export type StaffRow = { id: string; name: string; position: string; grade: string | null; duty_station: string | null; country: string | null; contract_type: string; start_date: string; end_date: string | null; probation_end: string | null; salary: number; currency: string; notice_days: number; line_manager: string | null };
export type AllocRow = { project_code: string; pct: number };

export function offerLetter(s: StaffRow, allocs: AllocRow[]): string {
  const missing = ['Acceptance deadline', 'Signatory name'];
  return shell(`Offer letter ${s.id}`, `
<h1>Offer of Employment</h1>
<p>Date: ${esc(new Date().toISOString().slice(0, 10))}</p>
<p>Dear ${esc(s.name)},</p>
<p>Stars Orbit Consultants and Management Development (SOC) is pleased to offer you the position of <b>${esc(s.position)}</b>${s.grade ? `, grade ${esc(s.grade)}` : ''}, based in ${esc(s.duty_station)}, ${esc(s.country)}.</p>
<table><tr><th>Contract type</th><td>${esc(contractLabel(s.contract_type))}</td></tr>
<tr><th>Start date</th><td>${esc(s.start_date)}</td></tr><tr><th>End date</th><td>${esc(s.end_date ?? 'per contract')}</td></tr>
<tr><th>Probation</th><td>${s.probation_end ? `until ${esc(s.probation_end)} (maximum 3 months)` : 'not applicable'}</td></tr>
<tr><th>Gross monthly salary</th><td>${esc(s.currency)} ${esc(s.salary.toLocaleString('en-GB'))}</td></tr>
<tr><th>Funding allocation</th><td>${allocs.map((a) => `${esc(a.project_code)} ${Math.round(a.pct * 100)}%`).join(', ') || M('allocation')}</td></tr>
<tr><th>Notice period</th><td>${esc(s.notice_days)} days after probation (7 days during probation for fixed-term contracts)</td></tr></table>
<p>This offer is conditional on satisfactory references, verification of identity and qualifications, and sanctions screening. It is subject to the SOC Code of Conduct, PSEA and safeguarding policies, and the labour law of the place of employment.</p>
<p>Please confirm acceptance by ${M('Acceptance deadline')}.</p>
<div class="sig"><div>For SOC: ${M('Signatory name')}, Operations Director</div><div>Accepted: ${esc(s.name)}, date</div></div>`, missing);
}

export function employmentContract(s: StaffRow, allocs: AllocRow[]): string {
  const mtm = s.contract_type === 'month-to-month';
  const missing = ['Signatory name', 'Country annex reviewed date'];
  return shell(`Employment contract ${s.id}`, `
<h1>${mtm ? 'Fixed-Term Employment Contract (Monthly, Auto-Renewing)' : 'Fixed-Term Employment Contract (One Year)'}</h1>
<p>Between Stars Orbit Consultants and Management Development ("SOC") and <b>${esc(s.name)}</b> ("the Employee").</p>
<h2>1. Position and duties</h2><p>The Employee is engaged as ${esc(s.position)} at ${esc(s.duty_station)}, ${esc(s.country)}, reporting to ${esc(s.line_manager ?? M('line manager'))}, and will perform the duties in the attached job description.</p>
<h2>2. Duration</h2><p>${mtm
  ? `This contract starts on ${esc(s.start_date)} for one calendar month and renews automatically month by month unless either party gives 15 days' written notice. It is contingent on continued donor funding. It may not extend beyond six consecutive renewals without written review by the Executive Director.`
  : `This contract starts on ${esc(s.start_date)} and ends on ${esc(s.end_date ?? M('end date'))}. Renewal requires a written amendment. Renewal count to date: see contract register.`}</p>
<h2>3. Probation</h2><p>${s.probation_end ? `The first period of employment until ${esc(s.probation_end)} is probationary (maximum three months). Either party may end the contract during probation with 7 days' written notice.` : 'Not applicable.'}</p>
<h2>4. Hours and location</h2><p>40 hours per week, within the statutory maximum of the place of employment. Field travel as required by the project.</p>
<h2>5. Remuneration</h2><p>Gross monthly salary of ${esc(s.currency)} ${esc(s.salary.toLocaleString('en-GB'))}, paid by bank transfer by the last working day of each month, allocated to ${allocs.map((a) => `${esc(a.project_code)} (${Math.round(a.pct * 100)}%)`).join(', ') || M('allocation')} according to signed timesheets. Statutory social security and income tax are withheld and remitted per the applicable law.</p>
<h2>6. Leave</h2><p>Annual leave accrues monthly per the country annex (${esc(s.country)}); sick leave, maternity leave and public holidays follow the law of the place of employment.</p>
<h2>7. Conduct and safeguarding</h2><p>The Employee has read and signed the SOC Code of Conduct, PSEA declaration and data protection policy, which form part of this contract. Breach may constitute gross misconduct.</p>
<h2>8. Confidentiality and intellectual property</h2><p>All data, reports and materials produced in the course of employment belong to SOC or its client as specified in the relevant agreement. Beneficiary data is handled under Do No Harm and confidentiality principles.</p>
<h2>9. Termination</h2><p>After probation, either party may terminate with ${esc(s.notice_days)} days' written notice. SOC may terminate for documented end of funding, non-performance following a performance improvement plan, misconduct following investigation, or redundancy with a written business case, subject to applicable law. End-of-service entitlements are paid within 7 days of the last working day.</p>
<h2>10. Governing law</h2><p>The labour law of ${esc(s.country)} governs this contract. Country annex reviewed: ${M('Country annex reviewed date')}.</p>
<div class="sig"><div>For SOC: ${M('Signatory name')}, date</div><div>Employee: ${esc(s.name)}, date</div></div>`, missing);
}

export function noticeLetter(s: StaffRow, kind: 'employer' | 'resignation', lastDay: string): string {
  return shell(`Notice ${s.id}`, `
<h1>${kind === 'employer' ? 'Notice of End of Contract' : 'Acknowledgement of Resignation'}</h1>
<p>Date: ${esc(new Date().toISOString().slice(0, 10))}</p><p>Dear ${esc(s.name)},</p>
${kind === 'employer'
  ? `<p>This letter gives ${esc(s.notice_days)} days' written notice that your ${esc(contractLabel(s.contract_type))} contract as ${esc(s.position)} will end on <b>${esc(lastDay)}</b>, in accordance with clause 9 of your contract.</p>`
  : `<p>SOC acknowledges receipt of your resignation. Your notice period of ${esc(s.notice_days)} days applies and your last working day will be <b>${esc(lastDay)}</b>.</p>`}
<p>Before your last day please complete the handover note for approval by your line manager, return all SOC assets, and settle any outstanding advances. Your final settlement, including accrued leave, will be paid within 7 days of your last working day. An experience certificate will be issued on clearance.</p>
<div class="sig"><div>HR Officer, date</div><div>Received: ${esc(s.name)}, date</div></div>`);
}

export function terminationLetter(s: StaffRow, rationale: string, lastDay: string, decidedBy: string | null): string {
  const text: Record<string, string> = {
    'end-of-funding': 'the project funding your position ends and no alternative funded position is available',
    'non-performance': 'the objectives of your performance improvement plan were not met after two documented reviews over a period of at least 30 days',
    'misconduct': 'following an investigation in which you were given the opportunity to respond, the findings constitute misconduct under the SOC Code of Conduct',
    'redundancy': 'your position is redundant following a documented restructure applying consistent selection criteria',
  };
  return shell(`Termination ${s.id}`, `
<h1>Termination of Employment</h1><p>Date: ${esc(new Date().toISOString().slice(0, 10))}</p><p>Dear ${esc(s.name)},</p>
<p>Following the decision of the Executive Director${decidedBy ? ` (${esc(decidedBy)})` : ''}, your employment as ${esc(s.position)} will end on <b>${esc(lastDay)}</b> because ${esc(text[rationale] ?? rationale)}.</p>
<h2>Entitlements</h2><table><tr><th>Item</th><th>Amount</th></tr><tr><td>Salary to last working day</td><td>${M('calculated by FM')}</td></tr><tr><td>Accrued annual leave</td><td>${M('from leave ledger')}</td></tr><tr><td>End-of-service benefit per applicable law</td><td>${M('calculated by FM')}</td></tr><tr><td>Notice pay in lieu (if applicable)</td><td>${M('if applicable')}</td></tr></table>
<p>Payment is made within 7 days of your last working day on completion of clearance. ${rationale === 'misconduct' || rationale === 'non-performance' ? 'You may appeal this decision in writing to the Executive Director within 7 days.' : ''}</p>
<div class="sig"><div>Executive Director, date</div><div>Received: ${esc(s.name)}, date</div></div>`, ['Entitlements amounts']);
}

export function travelAuthorisation(t: Record<string, unknown>): string {
  return shell(`Travel authorisation ${t.id}`, `
<h1>Travel Authorisation ${esc(t.id)}</h1>
<table><tr><th>Traveller</th><td>${esc(t.traveller)}</td></tr><tr><th>Project</th><td>${esc(t.project_code)}</td></tr><tr><th>Destination</th><td>${esc(t.destination)}</td></tr><tr><th>Purpose</th><td>${esc(t.purpose)}</td></tr>
<tr><th>Dates</th><td>${esc(t.depart_date)} to ${esc(t.return_date)}</td></tr><tr><th>International</th><td>${t.international ? 'Yes' : 'No'}</td></tr><tr><th>Visa</th><td>${t.visa_required ? `Required, status: ${esc(t.visa_status)}${t.embassy_appointment ? `, embassy appointment ${esc(t.embassy_appointment)}` : ''}` : 'Not required'}</td></tr>
<tr><th>Passport custody receipt</th><td>${esc(t.passport_custody_ref ?? 'n/a')}</td></tr><tr><th>Advance</th><td>USD ${esc(t.advance_usd)} (released only after visa confirmation; settle within 10 days of return)</td></tr>
<tr><th>Status</th><td>${esc(t.status)}${t.authorised_by ? ` by ${esc(t.authorised_by)}` : ''}</td></tr></table>
<h2>Duty of care checklist</h2><table><tr><td>Security briefing and route clearance</td><td>☐</td></tr><tr><td>Insurance confirmed</td><td>☐</td></tr><tr><td>Emergency contact card issued</td><td>☐</td></tr><tr><td>Check-in schedule agreed (Iraq movements)</td><td>☐</td></tr></table>
<div class="sig"><div>Traveller, date</div><div>Approver (${esc(t.required_role)}), date</div></div>`);
}

export function procurementRequest(p: Record<string, unknown>): string {
  return shell(`Procurement request ${p.id}`, `
<h1>Procurement Request ${esc(p.id)}</h1>
<table><tr><th>Project</th><td>${esc(p.project_code)}</td></tr><tr><th>Budget line</th><td>${esc(p.budget_line_id ?? M('budget line'))}</td></tr><tr><th>Description / specification</th><td>${esc(p.description)}</td></tr>
<tr><th>Estimated value</th><td>USD ${esc(p.est_value_usd)}</td></tr><tr><th>Route</th><td>${esc(p.route)} (approver: ${esc(p.required_role)})</td></tr><tr><th>Quotes received</th><td>${esc(p.quotes_received)}</td></tr>
<tr><th>Requested by</th><td>${esc(p.requested_by)} on ${esc(String(p.created_at).slice(0, 10))}</td></tr><tr><th>Status</th><td>${esc(p.status)}</td></tr></table>
<h2>Quote comparison</h2><table><tr><th>Supplier</th><th>Total (USD)</th><th>Compliant with spec</th><th>Due diligence (reg., tax, sanctions, COI)</th></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr><tr><td>&nbsp;</td><td></td><td></td><td></td></tr></table>
<h2>Committee decision and rationale</h2><p style="min-height:60px;border:1px solid #bbb"></p>
<div class="sig"><div>Finance Manager (funds confirmed), date</div><div>Approver (${esc(p.required_role)}), date</div></div>`);
}

export function visaSupportLetter(t: Record<string, unknown>, s: StaffRow | null): string {
  return shell(`Visa support ${t.id}`, `
<h1>Letter of Introduction and No Objection</h1><p>Date: ${esc(new Date().toISOString().slice(0, 10))}</p><p>To: ${M('Embassy / Consulate')}</p>
<p>Stars Orbit Consultants and Management Development confirms that <b>${esc(t.traveller)}</b>${s ? `, employed as ${esc(s.position)} since ${esc(s.start_date)} under a ${esc(contractLabel(s.contract_type))} contract` : ''}, is travelling to ${esc(t.destination)} from ${esc(t.depart_date)} to ${esc(t.return_date)} for the purpose of: ${esc(t.purpose)}.</p>
<p>SOC covers travel, accommodation and subsistence for this trip under project ${esc(t.project_code)}. The traveller will return to their duty station on completion and remains in SOC employment. SOC has no objection to the issuance of the required visa.</p>
<p>Passport number: ${M('passport number')}. Accommodation: ${M('hotel and address')}.</p>
<div class="sig"><div>Operations Director, signature and stamp</div><div>HR Officer, contact details</div></div>`, ['Embassy', 'Passport number', 'Accommodation']);
}

function contractLabel(t: string): string {
  return ({ 'one-year': 'one-year fixed-term', 'month-to-month': 'month-to-month fixed-term', consultant: 'consultancy', daily: 'daily worker' } as Record<string, string>)[t] ?? t;
}
