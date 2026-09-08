-- Stars Orbit operations PoC schema (D1 / SQLite)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ED','OD','FM','PM','ME','HR','STAFF')),
  staff_id TEXT
);
CREATE TABLE projects (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  donor TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  flexibility_pct REAL NOT NULL DEFAULT 0.10,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  grade TEXT,
  duty_station TEXT,
  country TEXT,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('one-year','month-to-month','consultant','daily')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  probation_end TEXT,
  renewal_count INTEGER NOT NULL DEFAULT 0,
  line_manager TEXT,
  salary REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  notice_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE TABLE staff_allocations (
  staff_id TEXT NOT NULL REFERENCES staff(id),
  project_code TEXT NOT NULL REFERENCES projects(code),
  pct REAL NOT NULL,
  PRIMARY KEY (staff_id, project_code)
);
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('employment','consultant','supplier','venue','donor')),
  party TEXT NOT NULL,
  project_code TEXT REFERENCES projects(code),
  value_usd REAL NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  notice_days INTEGER NOT NULL DEFAULT 30,
  renewal_count INTEGER NOT NULL DEFAULT 0,
  signatory TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  staff_id TEXT
);
CREATE TABLE indicators (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL REFERENCES projects(code),
  level TEXT NOT NULL,
  definition TEXT NOT NULL,
  unit TEXT NOT NULL,
  disaggregation TEXT,
  baseline REAL NOT NULL DEFAULT 0,
  target REAL NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'quarterly',
  source TEXT,
  responsible TEXT
);
CREATE TABLE indicator_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator_id TEXT NOT NULL REFERENCES indicators(id),
  period TEXT NOT NULL,
  value REAL NOT NULL,
  verified_by TEXT,
  verified_at TEXT,
  note TEXT,
  UNIQUE (indicator_id, period)
);
CREATE TABLE translations (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL REFERENCES projects(code),
  source_ref TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  english_text TEXT,
  translator TEXT,
  reviewer TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','translated','reviewed','final')),
  qa_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE glossary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arabic TEXT NOT NULL,
  transliteration TEXT,
  english TEXT NOT NULL,
  do_not_use TEXT,
  note TEXT,
  domain TEXT
);
CREATE TABLE budget_lines (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL REFERENCES projects(code),
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  approved_usd REAL NOT NULL
);
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL REFERENCES projects(code),
  budget_line_id TEXT REFERENCES budget_lines(id),
  claimant TEXT NOT NULL,
  description TEXT NOT NULL,
  expense_date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  fx_rate REAL NOT NULL DEFAULT 1,
  usd_amount REAL NOT NULL,
  receipt_ref TEXT,
  required_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','paid')),
  approver TEXT,
  decision_note TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT
);
CREATE TABLE procurements (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL REFERENCES projects(code),
  budget_line_id TEXT REFERENCES budget_lines(id),
  description TEXT NOT NULL,
  est_value_usd REAL NOT NULL,
  route TEXT NOT NULL,
  required_role TEXT NOT NULL,
  quotes_received INTEGER NOT NULL DEFAULT 0,
  supplier TEXT,
  po_number TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','quoting','approved','ordered','received','paid','rejected')),
  requested_by TEXT NOT NULL,
  approver TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  project_code TEXT NOT NULL REFERENCES projects(code),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  scores_json TEXT NOT NULL,
  weighted_score REAL NOT NULL,
  quoted_usd REAL NOT NULL,
  participants INTEGER NOT NULL DEFAULT 0,
  site_visit TEXT,
  recommended INTEGER NOT NULL DEFAULT 0,
  approved_by TEXT
);
CREATE TABLE travel (
  id TEXT PRIMARY KEY,
  traveller TEXT NOT NULL,
  project_code TEXT NOT NULL REFERENCES projects(code),
  destination TEXT NOT NULL,
  purpose TEXT NOT NULL,
  depart_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  international INTEGER NOT NULL DEFAULT 0,
  visa_required INTEGER NOT NULL DEFAULT 0,
  visa_status TEXT NOT NULL DEFAULT 'n/a',
  embassy_appointment TEXT,
  passport_custody_ref TEXT,
  advance_usd REAL NOT NULL DEFAULT 0,
  settled_at TEXT,
  required_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','authorised','rejected','completed')),
  authorised_by TEXT
);
CREATE TABLE leave_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id TEXT NOT NULL REFERENCES staff(id),
  entry_date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('accrual','annual','sick','public','unpaid','other')),
  days REAL NOT NULL,
  approved_by TEXT
);
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  vacancy_ref TEXT NOT NULL,
  candidate_ref TEXT NOT NULL,
  cv_text TEXT NOT NULL,
  screen_json TEXT,
  rubric_json TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','longlisted','rejected','shortlisted','offered','hired')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE vacancies (
  ref TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_code TEXT REFERENCES projects(code),
  duty_station TEXT,
  essential_criteria_json TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  closes_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);
CREATE TABLE terminations (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id),
  rationale TEXT NOT NULL CHECK (rationale IN ('end-of-funding','non-performance','misconduct','redundancy')),
  evidence_json TEXT NOT NULL,
  proposed_last_day TEXT NOT NULL,
  proposed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected')),
  decided_by TEXT,
  decided_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  detail TEXT
);
CREATE TABLE ai_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  actor TEXT NOT NULL,
  task TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  prompt_version TEXT NOT NULL,
  input_chars INTEGER,
  ok INTEGER NOT NULL
);
CREATE INDEX idx_expenses_project ON expenses(project_code, status);
CREATE INDEX idx_values_indicator ON indicator_values(indicator_id);
CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);
