-- Persistence for the financial dispute lifecycle.
-- Disputes reference canonical order/claim/escrow/subsidy/ERP records; they do
-- not create a second ledger or balance table.
CREATE TABLE IF NOT EXISTS financial_disputes (
  id UUID PRIMARY KEY,
  dispute_number VARCHAR(40) NOT NULL UNIQUE,
  opened_by VARCHAR(100) NOT NULL,
  respondent_id VARCHAR(100),
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('order','procurement','escrow','claim','subsidy','erp')),
  source_id VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  reason TEXT NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('open','on_hold','evidence_requested','under_review','mediation','resolution_pending','resolved','appealed','settled','closed','rejected')),
  sla_due_at TIMESTAMPTZ NOT NULL,
  reviewer_id VARCHAR(100),
  mediator_id VARCHAR(100),
  resolution JSONB,
  ai_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_financial_disputes_idempotency
  ON financial_disputes (opened_by, (ai_metadata->>'idempotency_key'))
  WHERE ai_metadata ? 'idempotency_key';
CREATE INDEX IF NOT EXISTS idx_financial_disputes_sla ON financial_disputes (status, sla_due_at);
CREATE INDEX IF NOT EXISTS idx_financial_disputes_source ON financial_disputes (source_type, source_id);

CREATE TABLE IF NOT EXISTS financial_dispute_evidence (
  id UUID PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES financial_disputes(id) ON DELETE CASCADE,
  submitted_by VARCHAR(100) NOT NULL,
  kind VARCHAR(40) NOT NULL,
  uri TEXT NOT NULL,
  sha256 CHAR(64),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS financial_dispute_events (
  id BIGSERIAL PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES financial_disputes(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30),
  actor_id VARCHAR(100) NOT NULL,
  correlation_id VARCHAR(200),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS financial_dispute_notifications (
  id BIGSERIAL PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES financial_disputes(id) ON DELETE CASCADE,
  recipient_id VARCHAR(100) NOT NULL,
  event VARCHAR(50) NOT NULL,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dispute_id, recipient_id, event)
);
CREATE TABLE IF NOT EXISTS financial_dispute_financial_actions (
  id UUID PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES financial_disputes(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('adjustment','reversal','clawback')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  ledger_transaction_id VARCHAR(36),
  accounting_entry_id UUID,
  idempotency_key VARCHAR(200) NOT NULL,
  actor_id VARCHAR(100) NOT NULL,
  correlation_id VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dispute_id, idempotency_key)
);
