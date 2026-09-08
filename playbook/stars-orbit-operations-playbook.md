# Stars Orbit Operations Playbook

**Organisation:** Stars Orbit Consultants and Management Development (SOC), HQ Amman, Iraq country operations
**Scope:** M&E, HR and recruitment, contracts, finance and grants, logistics and procurement
**Version:** 1.0 (September 2026) | **Owner:** Operations Director | **Review:** every 6 months or on donor policy change

> How to use this document. Section 1 tells each function what it must deliver. Section 2 tells them how, step by step, with approvers and timelines. Section 3 lists the templates (all editable copies live in `templates/`). Section 4 covers data, automation, and controls. Confidence tags: **[known]** standard NGO practice SOC already runs; **[per docs]** correct per published law or donor rules, verify locally; **[verify]** genuinely uncertain, confirm before relying on it.

---

## 1. Objective and scope

### 1.1 Purpose

SOC delivers operational and technical support to UN agencies and international NGOs (UNHCR, UNDP, UNICEF, WFP, IOM, World Bank, EU, FCDO among others). Every workstream in this playbook exists to make three things true at all times: donor money is traceable to a result, every person on payroll has a valid contract and a clean file, and every number reported upward can be evidenced within one working day.

### 1.2 Goals and deliverables by domain

| Domain | Goal (what "good" looks like) | Primary deliverables |
|---|---|---|
| **M&E** | Every project has an approved logframe, indicators are collected on schedule, Arabic field data reaches English reporting without loss of meaning, and donors receive reports on time with no data-quality queries. | Indicator tracking table, monthly data-quality log, quarterly M&E report, bilingual glossary, donor-format narrative reports, evaluation TOR and reports. |
| **HR and recruitment** | Vacancies filled within 30 days, every hire scored against a written rubric, every staff member on a signed contract that matches donor budget lines, zero unpaid leave balances at exit. | Vacancy announcement, candidate evaluation rubric, offer letter, one-year and month-to-month contracts, onboarding/offboarding checklists, payroll and leave tracker, termination and notice letters, embassy/visa support pack. |
| **Contracts** | Right contract type for the funding certainty, notice periods that match local law, termination always documented with a defensible rationale. | Contract register, contract templates, amendment template, termination decision memo. |
| **Finance and grants** | Actuals vs budget visible weekly, no expense paid without pre-approval at the correct threshold, donor reports reconcile to the ledger to the dollar, budgets above USD 100k carry a burn-rate forecast. | Budget worksheet, expense claim form, monthly budget-vs-actual (BvA), grant financial report, cash forecast, fund allocation matrix. |
| **Logistics and procurement** | Venues and suppliers selected on documented criteria, three quotes above threshold, travel authorised before booking, assets tagged. | Venue evaluation checklist, procurement request form, quote comparison sheet, purchase order, travel authorisation, asset register. |

### 1.3 Out of scope

Programme technical design, safeguarding investigations, and legal disputes are governed by separate SOC policies. This playbook references them at the control points where they intersect.

### 1.4 Roles and approval authority

| Role | Approves |
|---|---|
| Executive Director (ED) | Contracts above USD 25k, terminations, budgets, new donor agreements, exceptions to this playbook |
| Operations Director (OD) | Procurement USD 5k-25k, hires at or below manager grade, travel abroad, venue selection, payroll run |
| Finance Manager (FM) | Expenses up to USD 5k, expense claims, payroll calculation, fund allocation, donor financial reports |
| Project Manager (PM) | Expenses up to USD 1k within own budget, field data sign-off, local travel, procurement requests |
| M&E Officer | Indicator data validation, translation QA, M&E report drafting |
| HR Officer | Screening longlist, onboarding, leave records, contract drafting (not signing) |

Segregation rule **[known]**: the person who requests a payment never approves it, and the person who approves it never releases it. Minimum two signatures on every bank transfer.

---

## 2. Process architecture

### 2.1 Monitoring and evaluation

**2.1.1 Data collection**

1. At project start (week 1-2) the M&E Officer converts the donor logframe into the Indicator Tracking Table (ITT): one row per indicator with definition, unit, disaggregation (sex, age, governorate, displacement status), baseline, target, frequency, source, and responsible collector.
2. Every data collection tool (survey, attendance sheet, KII guide, FGD guide) is built bilingual Arabic/English from the outset, with the English version as the master and the Arabic as the field version. Tools are numbered and version-controlled (`TOOL-<project>-<nn>-v<x>`).
3. Digital collection by default (KoboToolbox or ODK on Android; paper only where connectivity or consent requires it). Paper forms are scanned within 48 hours and stored under the project folder.
4. Each collection round follows the sequence: enumerator briefing (informed consent script, Do No Harm, referral pathway) → collection → daily upload → same-day spot check of 10% of records by the M&E Officer → data cleaning log entry → locked dataset.
5. Personal data is minimised. Names and phone numbers live in a separate, access-restricted sheet linked by ID only. **[known]**

**2.1.2 Translation workflow (Arabic to English)**

| Step | Who | Timeline | Output |
|---|---|---|---|
| Raw Arabic text captured (open-ended survey answers, FGD notes, case stories) | Enumerator / field officer | Same day | Arabic source file |
| First-pass translation | Bilingual field officer or contracted translator | 2 working days per 5,000 words | Draft English, side by side with Arabic |
| Glossary check | Translator | Same pass | Terms match `templates/me/translation-glossary.xlsx` |
| Meaning review (not grammar) | M&E Officer, bilingual | 1 working day | Flags where English drifts from source |
| Sensitive content check | PM | Same day | Confirms no identifying detail, no unverified allegations, correct referral language |
| Final English, locked | M&E Officer | | Version stored alongside Arabic; both cited in the report |

Rules: translate meaning not words, keep the speaker's register (a beneficiary quote should not read like a policy paper), never merge two respondents into one quote, mark untranslatable terms in transliteration with a gloss on first use, and keep Arabic source text in the file forever so any English claim can be checked.

**2.1.3 Reporting format and cadence**

| Report | Frequency | Author → Reviewer → Approver | Due |
|---|---|---|---|
| Data-quality log | Continuous, summarised monthly | M&E Officer → PM | 5th of month |
| Monthly indicator update | Monthly | M&E Officer → PM → OD | 10th of month |
| Quarterly M&E report | Quarterly | M&E Officer → PM → OD → ED | 20 days after quarter end |
| Donor narrative report | Per agreement (usually quarterly or semi-annual) | PM (narrative) + M&E (data) + FM (finance annex) → OD → ED | 5 working days before donor deadline |
| Baseline / midline / endline | Per project | External or M&E Officer → PM → OD | Per agreement |
| Lessons-learned review | End of project | PM → OD | 30 days after close |

Review cadence: a 30-minute weekly M&E stand-up per active project (PM, M&E Officer, field lead) covering collection status, data-quality issues, and translation backlog. A monthly portfolio review (OD, all PMs, FM) reads the ITT against the BvA so under-spend and under-delivery are seen together.

**2.1.4 Risk controls**

Double entry or automated validation on all numeric fields. Photo evidence for distributions and trainings with GPS and date stamp. Random back-check of 5% of beneficiaries by phone by someone outside the collection team. Any indicator changed after lock requires a written correction note. **[known]**

### 2.2 HR and recruitment

**2.2.1 Recruitment pipeline (target: 30 calendar days from approved request to signed offer)**

| Step | Who | Days | Required document |
|---|---|---|---|
| Recruitment request with funded budget line and grade | PM → FM (budget check) → OD approval | 0-2 | Recruitment request form |
| Vacancy announcement, bilingual, minimum 10 days open | HR Officer | 2-3 | Job description, announcement |
| CV screening against essential criteria (pass/fail only) | HR Officer | 13-15 | Longlist sheet |
| Shortlisting with rubric scores, minimum 3 candidates, panel of at least 2 | HR Officer + PM + one independent panellist | 15-18 | Candidate evaluation rubric |
| Written test (where role requires) and structured interview, same questions to every candidate | Panel | 18-24 | Interview scoring sheet |
| Reference checks (2 professional), ID and qualification verification, sanctions screening | HR Officer | 24-27 | Reference check record, screening log |
| Offer letter, salary within grade band | HR Officer drafts, OD signs (ED for manager and above) | 27-28 | Offer letter |
| Contract signed before first working day | HR Officer, employee, signatory | 28-30 | Contract, ID copy, bank details, emergency contact, signed code of conduct and PSEA declaration |

Shortlisting criteria are weighted: relevant experience 30, technical skills 25, language (Arabic and English as required by role) 15, context knowledge (Iraq, humanitarian principles) 15, interview and written test 15. Score sheets are retained for 3 years. Any panellist with a personal relationship to a candidate declares and withdraws. Sanctions screening against UN Consolidated List and donor lists is mandatory before offer for every hire and consultant. **[known]**

**2.2.2 Contract types**

| Type | Use when | Notice period | Notes |
|---|---|---|---|
| Fixed-term, one year | Funded for 12 months or more under a signed grant | 30 days either side after probation; 7 days during probation | Renewable by written amendment. Iraq Labour Law No. 37 of 2015 treats repeated renewals as potentially indefinite, so track renewal count. **[per docs, verify with Iraqi counsel]** |
| Month-to-month (fixed term, one month, auto-renewing) | Funding confirmed in tranches, bridging periods, project extension pending | 15 days either side (SOC policy; law minimum applies if longer) | Never used for more than 6 consecutive months without ED review. Employee receives the same statutory benefits pro rata. |
| Consultancy / service contract | Deliverable-based, no line management, own tools | Per contract, typically 7-14 days | Not an employee. Paid on accepted deliverables. Include IP and confidentiality clauses. |
| Daily worker / enumerator | Short data collection assignments | None beyond the assignment | Attendance sheet and daily rate agreement, paid via signed payment list. |

Probation: up to 3 months for all employment contracts **[per docs: Iraq Labour Law No. 37/2015; Jordan Labour Law allows 3 months, verify current text]**. Working week: 8 hours a day, 40 hours (SOC policy, within the 48-hour statutory maximum in Iraq). Annual leave: 21 working days per year accrued monthly in Iraq **[per docs, verify]**; Jordan HQ staff 14 days rising to 21 after 5 years **[per docs, verify]**. Sick leave, maternity leave, and public holidays follow the law of the place of employment; the HR Officer keeps a one-page country annex per duty station reviewed annually with local counsel.

**2.2.3 Termination**

Termination is a decision of the ED on the OD's recommendation, never of a line manager alone. Every termination has one of four documented rationales:

1. **End of funding or project closure.** Written notice at the contractual period plus end-of-service entitlements. Donor notified if the position is a named key personnel.
2. **Non-performance.** Requires a documented performance improvement plan of at least 30 days with two written reviews before termination is considered.
3. **Misconduct.** Investigation with written findings and the employee's right to respond. Summary dismissal only for gross misconduct as defined in the code of conduct and local law.
4. **Redundancy or restructure.** Written business case, selection criteria applied consistently, consultation where required by law.

Termination pack: decision memo (rationale, evidence, entitlements calculation), termination letter, final settlement statement, clearance form, experience certificate. Final pay within 7 days of last working day. All access revoked on the last day. **[known]**

**2.2.4 Onboarding and offboarding**

Onboarding (first 5 working days): contract and file complete on day 1, IT accounts and email on day 1, code of conduct, PSEA, safeguarding, data protection, security briefing by day 2, finance and procurement induction day 3, M&E systems day 4, 30-60-90 day objectives agreed with line manager by day 5, probation review scheduled.

Offboarding: notice acknowledged in writing, handover note approved by line manager, asset return, leave balance and final pay calculated by FM and verified by HR, exit interview, access removal, file archived. The offboarding checklist is signed by HR, FM, IT, and line manager before final payment.

**2.2.5 Payroll, holidays, and salary tracking**

Monthly cycle: timesheets due 25th → HR updates leave and attendance → FM calculates payroll by 27th, allocating each salary across donor budget lines per the timesheet percentages → OD approves payroll register → two-signatory transfer by last working day. Payslips issued to every employee. Social security and income tax withheld and remitted per country **[per docs: Iraq employer 12% and employee 5% under the 2023 social security law; Jordan employer 14.25% and employee 7.5%; verify current rates before first run]**. Leave balances are visible to every employee monthly. Salary changes require a signed amendment and appear in the tracker the same month.

**2.2.6 Embassy and travel handling**

Applies to staff and consultants travelling for SOC business, including to Amman HQ, regional workshops, and donor meetings.

1. Travel authorisation approved (local: PM; abroad: OD) at least 21 days before departure for visa-requiring travel.
2. HR issues the visa support pack: invitation or no-objection letter on letterhead, employment confirmation, travel itinerary, proof of accommodation, return commitment letter, and a letter of introduction to the embassy where accepted.
3. HR tracks the embassy appointment, submission, and passport custody in the travel register. Passports never sit with SOC overnight without a signed custody receipt.
4. Finance issues per diem and advances after visa confirmation, not before. Advances are cleared within 10 days of return with receipts.
5. Duty of care: security briefing, insurance confirmation, emergency contact card, check-in schedule for travel inside Iraq.

### 2.3 Finance and grants

**2.3.1 Expense approval workflow**

| Amount (USD) | Requester | Approver | Evidence required |
|---|---|---|---|
| Up to 1,000 | Any staff | PM (own budget) | Receipt, budget code |
| 1,001-5,000 | PM | FM | Receipt, budget code, purchase request |
| 5,001-25,000 | PM | OD, with FM budget confirmation | Three quotes or sole-source justification, purchase order |
| Above 25,000 | OD | ED | Tender file, committee minutes, contract |

Every expense carries a project code, donor budget line, and cost category. No payment without a signed expense claim or approved purchase order. Cash payments capped at USD 500 per transaction; everything else by bank transfer.

**2.3.2 Fund allocation and budget tracking (budgets above USD 100k)**

1. On award, FM loads the donor budget into the budget worksheet by line, month, and currency, and locks the "approved" column.
2. Shared costs (rent, ED and FM time, audit) are allocated by a written cost-allocation methodology reviewed annually.
3. Weekly: FM posts actuals and commitments; the worksheet computes burn rate and forecast to completion.
4. Monthly BvA meeting (FM, PM, OD): any line more than 10% off plan gets a written explanation and, if needed, a realignment request to the donor within the agreement's flexibility limits (commonly 10-15% between lines without prior approval; check each agreement).
5. Cash forecast for 90 days maintained for every active grant. Tranche requests are submitted 30 days before cash need.
6. No line is ever overspent against the approved total without ED decision and a documented plan for covering the difference.

**2.3.3 Reporting cadence**

Weekly cash position (FM → OD). Monthly BvA and payroll allocation (FM → OD, PMs). Quarterly grant financial report reconciled to ledger and bank (FM → OD → ED → donor). Annual audit and annual donor-specific reports per agreement. Retain all financial records for 7 years or the donor's requirement if longer.

**2.3.4 Risk controls**

Bank reconciliation monthly signed by someone other than the preparer. Petty cash counted weekly with surprise counts quarterly. Supplier bank details changed only on written request verified by phone call. Exchange rates recorded per transaction with source. Ineligible cost list per donor kept in the budget worksheet notes. Fraud reporting line communicated to all staff and partners.

### 2.4 Logistics and procurement

**2.4.1 Procurement workflow**

Procurement request (PM, with budget code) → FM confirms funds → threshold routing: under USD 1,000 one quote and receipt; USD 1,000-5,000 three written quotes and quote comparison sheet; above USD 5,000 request for quotation to at least three suppliers, evaluation committee of three, minutes, purchase order; above USD 25,000 formal tender with published criteria and ED approval. Supplier due diligence (registration, tax, sanctions screening, conflict of interest declaration) for any supplier above USD 5,000 cumulative per year. Goods received note signed on delivery. Assets above USD 500 tagged and registered.

**2.4.2 Venue selection (hotels and training venues)**

Venues are scored on the venue evaluation checklist: security and access (25), suitability of room and equipment (20), cost against benchmark (20), accessibility for participants with disabilities and separate facilities where culturally required (15), catering and hygiene (10), cancellation terms and past performance (10). Site visit required for any event above 30 participants or USD 3,000. Contract signed before the event with cancellation terms captured. Preferred venue list maintained per governorate and refreshed every 12 months.

**2.4.3 Salary administration and cash delivery logistics**

Where SOC delivers cash or salaries on behalf of a partner (a core SOC service), the payment list is generated from the verified beneficiary or staff list, approved by the partner focal point and the FM, distributed under two-person control, signed or biometrically acknowledged by each recipient, reconciled the same day, and reported to the partner with the signed list within 3 working days. Undelivered amounts are returned to the bank within 5 working days.

**2.4.4 Travel logistics**

Travel authorisation → security clearance for the route (Iraq) → booking through preferred agents → per diem calculation on the SOC rate table → advance → trip → expense settlement within 10 days. Vehicle movements logged with driver, passengers, route, and check-in times.

### 2.5 Cross-cutting: timelines, documents, and risk controls at a glance

| Process | Trigger to completion | Minimum document set | Key control |
|---|---|---|---|
| M&E quarterly report | 20 days after quarter end | ITT, data-quality log, locked datasets, glossary | Data traceable to source, translation dual-stored |
| Recruitment | 30 days | Request, announcement, rubric, references, screening, contract | Panel scoring, sanctions screening |
| Termination | 7-30 days depending on rationale | Decision memo, letter, settlement, clearance | ED decision, documented rationale |
| Payroll | Monthly, last working day | Timesheets, register, allocation, payslips | Two-signatory transfer |
| Expense | 1-5 working days by threshold | Claim or PO, receipts, budget code | Segregated request/approve/pay |
| Procurement above 5k | 10-15 working days | RFQ, three quotes, committee minutes, PO, GRN | Committee, due diligence |
| Venue | 5-10 working days | Checklist, site visit note, contract | Scored selection |
| Travel abroad | 21+ days | Authorisation, visa pack, insurance, security briefing | Advance only after visa |

---

## 3. Output formats and templates

All templates are in `templates/` as editable Word and Excel files. This section describes their structure.

### 3.1 M&E report structure (`templates/me/me-quarterly-report-template.docx`)

1. Cover: project, donor, reporting period, version, author, approvals.
2. Executive summary (half page): three headline results, two headline issues, one decision requested.
3. Progress against indicators: table with indicator, baseline, target, this period, cumulative, percent of target, disaggregation, data source, RAG status.
4. Activity progress by output: planned vs done, variance explanation.
5. Data quality and methodology: tools used, sample sizes, response rates, cleaning actions, limitations.
6. Beneficiary voice: 3-5 translated quotes with Arabic source reference IDs and consent noted.
7. Challenges, risks, and mitigation.
8. Lessons learned and adaptation.
9. Next period plan.
10. Annexes: ITT extract, translation log, photo log, evaluation TORs.

Sample outline (one page): headline metrics tile row (reach, percent of target, data completeness, translation backlog), then one paragraph per output, then the indicator table.

### 3.2 Translation notes and glossary (`templates/me/translation-glossary.xlsx`)

Columns: Arabic term, transliteration, preferred English, do-not-use alternatives, context note, domain (M&E, HR, finance, protection), source, last reviewed. Seeded with about 60 core humanitarian, M&E, HR, and finance terms and standard phrasing for Iraq-specific administrative terms (governorate, district, sub-district, mukhtar, PDS card, civil status ID, residency card, and so on). Preferred phrasing rules: "internally displaced person" not "refugee" for Iraqis displaced within Iraq; "returnee" for those returned to area of origin; "host community" not "locals"; "person with disability" not "disabled"; "beneficiary" in donor reports, "participant" in training contexts; keep "governorate" not "province" for Iraq.

### 3.3 HR templates (`templates/hr/`)

- **Candidate evaluation rubric (xlsx):** weighted criteria, 1-5 scoring with descriptors, panellist columns, auto-calculated total, ranking, and a conflict-of-interest declaration row.
- **Offer letter (docx):** position, grade, salary, currency, contract type and duration, location, start date, conditions precedent (references, screening, medical where required), acceptance deadline.
- **One-year employment contract (docx):** parties, position and duties, duration and renewal, probation, hours and location, remuneration and allocation to donor funding, leave, social security and tax, confidentiality and data protection, code of conduct and PSEA, IP, termination and notice, governing law, signatures.
- **Month-to-month contract (docx):** same structure with auto-renewal clause, 15-day notice, and a funding-contingency clause.
- **Notice period letter (docx):** for both employer-initiated end of contract and acknowledgement of resignation, with dates and handover requirements.
- **Termination letter (docx):** four variants by rationale, entitlements table, right of appeal where applicable.
- **Onboarding and offboarding checklist (xlsx):** owner, due day, signature per item.
- **Payroll and leave tracker (xlsx):** staff register, monthly payroll register with donor allocation percentages, leave ledger with automatic balance.
- **Embassy and visa support pack (docx):** invitation letter, no-objection letter, employment confirmation, passport custody receipt.

### 3.4 Finance templates (`templates/finance/`)

- **Budgeting worksheet (xlsx):** budget lines by category, unit cost, quantity, frequency, donor share and cost share, monthly phasing, actuals, commitments, burn rate, forecast to completion, variance flags at 10%.
- **Expense claim form (xlsx):** claimant, project code, line items with date, description, budget line, currency, exchange rate, USD amount, receipt reference, approval chain by threshold.
- **Grant financial report (docx):** period, budget vs actual by line, variance narrative, cash received and balance, exchange rate note, ineligible cost declaration, certification.

### 3.5 Logistics templates (`templates/logistics/`)

- **Venue evaluation checklist (xlsx):** weighted criteria with scoring, site visit fields, comparison of up to three venues, recommendation.
- **Procurement request form (docx):** requester, project and budget code, specification, estimated value, threshold route, quotes summary, committee decision, approvals.
- **Travel authorisation (docx):** traveller, purpose, itinerary, security clearance, visa status, per diem and advance, approvals.

---

## 4. Implementation guidance and automation prerequisites

### 4.1 Repository and data architecture

One shared drive (SharePoint or Google Drive) with a fixed top-level structure; no project files on personal drives or in email only.

```
SOC-Operations/
  01-Projects/<donor>-<project-code>/
      Agreement/  Budget/  ME/  Reports/  Procurement/  HR-allocations/
  02-HR/  Staff-files (restricted)/  Recruitment/  Payroll (restricted)/  Policies/
  03-Finance/  Ledger-exports/  Bank/  Audits/  Templates/
  04-Logistics/  Suppliers/  Venues/  Assets/  Travel/
  05-Registers/  (contracts, procurement, travel, assets, translation log: one xlsx each)
  06-Dashboard/  (data extracts feeding Power BI or Google Sheets)
```

Naming: `YYYY-MM-DD_<project>_<doctype>_v<n>`. Restricted folders (staff files, payroll, beneficiary personal data) limited to HR, FM, OD, ED. Every register has a single owner and a "last updated" cell.

### 4.2 Core data fields and flows

| Dataset | Key fields | Source of truth | Flows to |
|---|---|---|---|
| Staff register | Staff ID, name, position, grade, contract type, start, end, duty station, line manager, donor allocation % | HR tracker | Payroll, budget worksheet, dashboard |
| Contract register | Contract ID, party, type, value, start, end, notice days, renewal count, signatory | Registers | HR, finance, dashboard alerts |
| ITT | Indicator ID, project, definition, baseline, target, period value, disaggregation, source, status | ME folder per project | Quarterly report, donor report, dashboard |
| Translation log | Item ID, source file, translator, date, reviewer, status, glossary flags | ME folder | M&E report annex, dashboard backlog |
| Budget and actuals | Project, donor line, category, approved, actual, committed, month | Budget worksheet and ledger export | BvA, donor report, dashboard |
| Expense claims | Claim ID, staff, project, amount, currency, USD, status, approver, date | Finance | Ledger, dashboard |
| Procurement | PR ID, project, value, threshold route, quotes, supplier, PO, GRN date | Procurement register | Finance, dashboard |
| Travel | Trip ID, traveller, destination, dates, visa status, advance, settlement date | Travel register | HR, finance, dashboard |

Flow principle: data is entered once at the point it originates (timesheet, Kobo form, claim form) and everything downstream reads from it. Where a system cannot link, a monthly export into `06-Dashboard/` replaces re-keying.

### 4.3 AI-enabled automation (where it pays back)

| Use case | What it does | Guardrail |
|---|---|---|
| Translation quality check | LLM compares Arabic source and English draft, flags omissions, added claims, register shifts, and glossary violations; outputs a review table | Never replaces the human meaning review. Model output is a flag list, not a final translation. No personal data leaves approved tools. |
| CV parsing and pre-scoring | Extracts experience, qualifications, languages into the rubric's essential-criteria columns and proposes a pass/fail longlist | Humans make every shortlist decision. Prompts must not score on name, sex, age, nationality, or religion; log the prompt version used. |
| Contract templating | Fills contract templates from the staff register, applies country annex, produces a diff against the last signed version | Signatory reviews the full document. Legal clauses are edited only by HR and reviewed by counsel annually. |
| Reminder automation | Rule-based alerts: contract end minus 45 days, probation end minus 14 days, leave balance above 15 days, report due minus 10 days, advance unsettled at 10 days, budget line above 90% burn | Alerts go to owner and their manager. No automated action, only notification. |
| Report drafting | LLM drafts the narrative sections of the quarterly report from the ITT, data-quality log, and activity table, in the donor's format | M&E Officer and PM edit and sign. Every number in the draft must trace to an ITT cell; the prompt is required to cite the cell. |
| Expense triage | Classifies receipts to budget lines and flags duplicates, weekend dates, round numbers, split invoices near thresholds | FM approves; flags are advisory. |
| Venue and supplier comparison | Summarises quotes into the comparison sheet and highlights missing items | Committee decides. |

The structured prompt for an AI operations assistant is in `prompts/ai-operations-assistant-prompt.md`. It encodes the approval matrix, thresholds, and guardrails above so the assistant refuses to "approve" anything and always names the human approver.

Prerequisites before any automation: registers exist and are populated (nothing to automate over blank sheets); a data classification (public, internal, restricted) applied to every folder; an approved AI tool list with data-residency confirmed; a prompt and output log kept for audit; and a named owner for each automation.

### 4.4 Key risks, compliance, and control points

| Risk | Control point | Owner |
|---|---|---|
| Donor ineligible costs (VAT, unapproved travel, missing three quotes) | Threshold table enforced at PO stage, ineligible list in budget worksheet, quarterly self-audit of 20 transactions | FM |
| Labour law non-compliance (contract renewals becoming indefinite, notice periods, social security remittance) | Country annex reviewed with counsel annually; contract register renewal count alert; monthly remittance reconciliation | HR Officer, FM |
| Data protection and Do No Harm (beneficiary PII in reports, quotes traceable to individuals) | PII separated by ID; consent recorded; sensitive content check before any report leaves SOC | M&E Officer, PM |
| Fraud and collusion in procurement or cash delivery | Segregation, committee, supplier due diligence, two-person cash control, surprise counts, whistleblowing line | OD |
| Sanctions and counter-terrorism financing | Screening of every hire, consultant, supplier above USD 5k, and partner before contracting; screening log retained | HR Officer, FM |
| Safeguarding and PSEA | Declaration at hire, training within 5 days, reporting pathway on every contract, referral pathway in every data collection briefing | OD |
| Key-person dependency (single FM or M&E Officer) | Documented processes in this playbook, deputies named per register, quarterly cross-training | OD |
| Security of staff travel in Iraq | Route clearance, movement log, check-in schedule, insurance | OD |
| Reporting slippage | Internal deadline 5 working days before donor deadline; dashboard due-date tile | PM |
| Currency exposure (IQD, JOD, USD) | Record rate per transaction; hold donor currency where allowed; monthly gain/loss review | FM |

Donor-specific notes **[per docs, verify per agreement]**: UN agency partnership agreements (UNICEF PCA, UNHCR PPA, UNDP RPA, WFP FLA) each define budget flexibility, reporting templates, audit rights, and asset disposal rules; EU-funded actions follow PRAG procurement thresholds and require a separate cost-eligibility check; FCDO requires due diligence assessment and downstream partner flow-down clauses. Map each new agreement into the budget worksheet notes tab on award day.

### 4.5 Rollout plan (90 days, roughly 20 person-days of effort)

Weeks 1-2: adopt templates, build the five registers, set folder structure and permissions. Weeks 3-4: migrate live contracts and budgets into registers; train PMs and HR on thresholds and rubric. Weeks 5-8: connect registers to the dashboard (see `dashboard/dashboard-blueprint.md`), run first monthly BvA and portfolio review off the dashboard. Weeks 9-12: pilot translation QA and CV pre-scoring on one project; review results; write the AI usage note into the policy set. Day 90: OD signs off, playbook moves to version 1.1 with lessons.
