-- Durable claim workflow records. Product-specific underwriting remains owned by
-- the existing insurance services; these tables own workflow state and evidence.
CREATE TABLE IF NOT EXISTS insurance_workflow_policies (
  id TEXT PRIMARY KEY,
  policy_class VARCHAR(64) NOT NULL,
  holder_id TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  coverage_limit NUMERIC(14, 2) NOT NULL CHECK (coverage_limit >= 0),
  workflow_status VARCHAR(32) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS insurance_workflow_claims (
  id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL REFERENCES insurance_workflow_policies(id),
  holder_id TEXT NOT NULL,
  policy_class VARCHAR(64) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  state VARCHAR(32) NOT NULL,
  idempotency_key VARCHAR(200) NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_insurance_workflow_claims_policy
  ON insurance_workflow_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_workflow_claims_state
  ON insurance_workflow_claims(state);

CREATE TABLE IF NOT EXISTS insurance_workflow_events (
  id TEXT PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  claim_id TEXT,
  actor_id TEXT,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_insurance_workflow_events_claim
  ON insurance_workflow_events(claim_id, occurred_at);
