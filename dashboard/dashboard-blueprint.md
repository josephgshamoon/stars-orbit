# Operations Dashboard Blueprint

Two implementations share one data model: the live dashboard inside the PoC app (`/#/dashboard`, served by the Worker from D1) and a Power BI or Google Sheets build fed by the same tables exported as CSV. Design rules follow one principle: one axis per chart, colour carries one meaning, every number traceable to a register row.

## Audience and questions

| Viewer | Question the dashboard must answer in under a minute |
|---|---|
| Executive Director | Which grants are at risk of overspend or under-delivery, and what needs my decision this week? |
| Operations Director | What is overdue (contracts, approvals, advances, visas) and who owns it? |
| Finance Manager | Burn vs time per line, cash runway, pending approvals by threshold, unsettled advances |
| Project Manager | Indicator RAG for my project, translation backlog, procurement status for upcoming events |
| M&E Officer | Data completeness, unverified values, translation pipeline stages |
| HR Officer | Contract end dates, probation reviews, renewal counts, leave balances, recruitment funnel |

## Data sources (D1 tables → CSV exports for external BI)

| Dataset | Table | Key fields | Refresh |
|---|---|---|---|
| Budget vs actual | `budget_lines`, `expenses` (status in approved, paid = actual; submitted = committed) | project_code, code, approved_usd, usd_amount, status, expense_date | Live / daily export |
| Indicators | `indicators`, `indicator_values` | id, target, period, value, verified_by | Monthly (10th) |
| Contracts and staff | `contracts`, `staff`, `staff_allocations` | end_date, notice_days, renewal_count, probation_end, contract_type | Live |
| Leave | `leave_ledger` | staff_id, type, days | Monthly |
| Translation pipeline | `translations` | status, qa_json | Live |
| Procurement | `procurements` | est_value_usd, route, quotes_received, status, created_at | Live |
| Travel and embassy | `travel` | visa_required, visa_status, depart_date, advance_usd, settled_at | Live |
| Alerts | computed by `GET /api/dashboard/alerts` (rules in `src/lib/rules.ts`) | severity, domain, owner, rule, next_step | On load |

## Page layout

**Row 1: four stat tiles** (the only place a hero number appears). High-severity alerts; portfolio burn percent with USD spent of approved; indicators on track out of total; expense claims awaiting approval with USD value. Each tile carries a one-line delta or context under the number, never a second axis.

**Row 2 left: alert table.** Severity pill, domain pill, item, rule that fired, owner, next step. Sorted high to low. This is the action list; everything below explains it.

**Row 2 right: budget burn by project.** Horizontal progress bars, one per project, actual plus committed as a share of approved, with time-elapsed percent printed beside. Bars turn to the second categorical hue (orange) only when burn exceeds time elapsed by more than the grant's flexibility limit. Below it, monthly approved spend as one line per project (max four projects on one chart; beyond that, small multiples).

**Row 3 left: indicator progress.** Horizontal bars, cumulative vs target, coloured by RAG (blue on track, yellow amber, red off track). Direct label: cumulative / target unit. Hover shows definition, project, verification status.

**Row 3 right: pipelines table.** Translation stages, expense statuses with USD, procurement statuses, staff by contract type. Tables, not charts, because the reader needs the exact count.

## Chart and colour rules (from the data-viz method used in the app)

- Categorical hues in fixed order: blue, orange, aqua, yellow, magenta, green, violet, red. Assigned to entities (projects) and never re-ordered when a filter removes one.
- Status colours (good green, warning yellow, critical red) are reserved for RAG and severity and always paired with a text label or pill, never colour alone.
- Sequential magnitude uses one blue ramp. Diverging (variance vs plan) uses blue to red with a neutral grey midpoint.
- Thin marks, 2px lines, 4px rounded bar ends, recessive gridlines, direct labels on at most four series, tooltips on every mark, table view available for every chart.
- Never two y-axes. Burn percent and USD live in separate charts or in the tile subtext.

## Power BI build notes

1. Connect to the CSV exports in `06-Dashboard/` (or the D1 HTTP API via a scheduled export) and load the eight datasets above.
2. Measures: `Actual = SUM(expenses[usd_amount]) filtered to approved, paid`; `Committed = ... submitted`; `Burn % = (Actual + Committed) / Approved`; `Expected % = DATEDIFF(start, TODAY(), DAY) / DATEDIFF(start, end, DAY)`; `Variance = Burn % - Expected %`; `Flag = IF(ABS(Variance) > Flexibility, "Review", "OK")`; `Cumulative = IF(unit = "%", LASTNONBLANK value, SUM value)`; `RAG = SWITCH(TRUE(), pct >= 0.9, "G", pct >= 0.6, "A", "R")`.
3. Visuals: card visuals for the four tiles; table with conditional formatting icons for alerts; clustered bar (single measure) for burn; line chart for monthly spend with legend limited to four; bar chart for indicators with RAG colour from a measure; matrix for pipelines.
4. Row-level security: HR and payroll tables restricted to HR, FM, OD, ED roles. Beneficiary data never enters the model, only counts.
5. Refresh: daily for finance and registers, monthly for indicators. Put the as-of date on the page header.

## Google Sheets or Excel build notes

Use `templates/finance/operations-registers.xlsx` and `templates/finance/budget-worksheet.xlsx` as the source tabs. Add a Dashboard tab with COUNTIFS/SUMIFS over the register tabs for the tiles, and sparkline or bar charts bound to the ITT and Budget tabs. Keep charts to one measure each.

## Sample visuals

The PoC dashboard renders the sample visuals from seeded data: open the app and view `/#/dashboard`. A screenshot from the seeded demo is at `dashboard/sample-dashboard.png`.
