-- Canonical accounting workflow additions.  Additive and safe to re-run.
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS maker_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS checker_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(200),
  ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_status_check;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_status_check
  CHECK (status IN ('draft','maker_pending','checker_pending','approved','posted','reversed'));
CREATE UNIQUE INDEX IF NOT EXISTS uq_journal_entries_idempotency
  ON journal_entries (company_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS accounting_workflow_audit (
  id BIGSERIAL PRIMARY KEY,
  journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  action VARCHAR(40) NOT NULL,
  actor_id VARCHAR(100),
  correlation_id VARCHAR(100),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_accounting_workflow_audit_entry
  ON accounting_workflow_audit (journal_entry_id, created_at);

CREATE TABLE IF NOT EXISTS accounting_ai_suggestions (
  id BIGSERIAL PRIMARY KEY,
  journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(30) NOT NULL CHECK (suggestion_type IN ('classification','reconciliation')),
  payload JSONB NOT NULL,
  confidence NUMERIC(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
