# Stars Orbit Operations (PoC)

An online operations system for Stars Orbit Consultants and Management Development (SOC): M&E, HR and recruitment, contracts, finance and grants, logistics and procurement, with an AI assistant that drafts and checks but never approves. Built as a proof of concept on Cloudflare: one Worker serves the API and the static single-page app, D1 holds the data, Workers AI (or the Anthropic API) powers the assistant, and Cloudflare Access provides identity.

The playbook the system enforces is in [`playbook/stars-orbit-operations-playbook.md`](playbook/stars-orbit-operations-playbook.md). The assistant's prompt is in [`prompts/ai-operations-assistant-prompt.md`](prompts/ai-operations-assistant-prompt.md). The dashboard design is in [`dashboard/dashboard-blueprint.md`](dashboard/dashboard-blueprint.md). Editable Excel templates are in [`templates/`](templates/).

## What it does

| Domain | Enforced server-side |
|---|---|
| Finance | Expense approver derived from USD amount (PM ≤1k, FM ≤5k, OD ≤25k, ED above). Claimant never approves own claim; approver never releases payment. Line overspend needs ED. Budget vs actual with burn rate, forecast to completion and flexibility flags. |
| Procurement | Route and quote minimum from value (single quote, three quotes, RFQ + committee, tender). Approval blocked until the quote minimum is met. Requester never approves. |
| HR | Notice period by contract type. Month-to-month capped at 6 months without ED review. Termination proposals blocked unless the evidence set for the rationale is complete; ED decides; letters only after approval. Rubric scoring with panel divergence flag. |
| M&E | Indicator tracking with RAG. Verified values need a correction note to change. Four-step translation workflow with role gates and a glossary. |
| Logistics | Weighted venue scoring, site visit required above 30 participants or USD 3,000. Travel abroad needs OD. Visa and passport custody tracking, advance settlement alerts. |
| Documents | Offer letter, employment contract, notice, termination letter, travel authorisation, visa support letter, procurement request generated from live records as print-ready HTML. |
| AI | Translation QA (flags only), CV essential-criteria pre-screen (pass/fail, no ranking, identity attributes ignored), quarterly report narrative draft (every number cites an indicator), expense triage. Every call logged with actor, provider, model and prompt version. |
| Audit | Every write is logged with the acting user. |

## Architecture

```
Browser (public/: vanilla JS SPA, inline SVG charts)
   │  /api/*  (JSON)                 /  (static assets, SPA fallback)
   ▼
Cloudflare Worker (src/index.ts, Hono)
   ├─ identity: Cf-Access-Authenticated-User-Email header set by Cloudflare Access
   ├─ rules:    src/lib/rules.ts (pure, unit-tested)
   ├─ D1:       migrations/0001_init.sql, seed/seed.sql
   ├─ AI:       Workers AI (default) | Anthropic API (ANTHROPIC_API_KEY) | mock (local)
   └─ docs:     src/lib/documents.ts (HTML letters and forms)
```

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars        # AI_PROVIDER=mock, DEV_USER_EMAIL=od@starsorbit.org
npm run db:migrate:local
npm run db:seed:local
npm run dev                           # http://localhost:8787
```

Switch the acting user with the selector in the header (works only while `DEV_USER_EMAIL` is set). Seeded users: ed@, od@, fm@, pm@, me@, hr@, field@ at starsorbit.org. `npm test` runs the rules tests; `npm run typecheck` runs TypeScript.

To use the real Anthropic API locally, set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...` in `.dev.vars`. Workers AI cannot run offline: `wrangler dev --local` disables that binding, so leave `AI_PROVIDER=mock` unless you have an Anthropic key.

## Deploy to Cloudflare

1. Create the database and put its id in `wrangler.jsonc`:
   ```bash
   npx wrangler d1 create soc_ops
   ```
2. Apply the schema and, for a demo, the seed:
   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote          # demo data only; skip for a clean instance
   ```
3. Deploy:
   ```bash
   npx wrangler deploy
   ```
4. Protect it with Cloudflare Access (Zero Trust → Access → Applications): add a self-hosted application for the Worker's hostname, allow the SOC email domain or a named group, and keep `DEV_USER_EMAIL` empty in production so an unauthenticated request is rejected. The Worker reads the `Cf-Access-Authenticated-User-Email` header that Access sets after validating its JWT; map emails to roles in the `users` table.
5. Optional: use Claude instead of Workers AI.
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   # then set AI_PROVIDER to "anthropic" in wrangler.jsonc vars
   ```

GitHub Actions (`.github/workflows/deploy.yml`) runs typecheck and tests on every push and PR, and deploys from `main` when the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. Without the secrets the deploy job fails and the check job still passes.

## Known limits of the PoC

- No file storage: receipts and CVs are referenced by ID or pasted as text. R2 is the natural next step.
- Documents are HTML (print to PDF from the browser). Word templates can be generated from the same data if required.
- Identity relies on Cloudflare Access at the edge; there is no in-app login. For a demo without Access, `DEV_USER_EMAIL` plus the header switch stands in.
- The Excel templates in `templates/` are generated by `scripts/build_xlsx_templates.py`. Formula results are computed when the file is opened in Excel or Google Sheets (the build environment had no working LibreOffice to pre-calculate them).
- Labour-law figures (notice, probation, leave, social security rates) are placeholders marked "verify" in the playbook. Confirm with counsel per duty station before relying on them.

## Repository layout

```
playbook/   operating playbook (markdown)
prompts/    AI assistant system prompt and task prompts
templates/  editable Excel templates (M&E, HR, finance, logistics)
dashboard/  dashboard blueprint
src/        Worker: index.ts, lib/ (auth, rules, ai, documents), routes/
public/     SPA (index.html, app.js, styles.css, _headers)
migrations/ D1 schema      seed/ demo data      tests/ rules tests
scripts/    template generator
```
