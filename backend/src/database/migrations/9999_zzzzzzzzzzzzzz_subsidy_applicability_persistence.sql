-- Durable subsidy applicability workflow.
-- Eligibility is immutable; application status changes are append-audited.
CREATE TABLE IF NOT EXISTS subsidy_eligibility (
  id TEXT PRIMARY KEY,
  applicant_type VARCHAR(16) NOT NULL CHECK (applicant_type IN ('farmer', 'fpo')),
  applicant_id TEXT NOT NULL,
  inputs JSONB NOT NULL,
  eligible BOOLEAN NOT NULL,
  schemes JSONB NOT NULL,
  ai_recommendation JSONB,
  evaluated_at TIMESTAMPTZ NOT NULL
);

-- 9508_m025_land_parcels_a.sql owns subsidy_applications in lexical order.
-- Reconcile that legacy shape before adding foreign keys that target the
-- durable workflow's `id` column.
ALTER TABLE subsidy_applications
  ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE subsidy_applications
  ADD COLUMN IF NOT EXISTS eligibility_id TEXT,
  ADD COLUMN IF NOT EXISTS applicant_id TEXT,
  ADD COLUMN IF NOT EXISTS scheme_code VARCHAR(64),
  ADD COLUMN IF NOT EXISTS documents JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(32),
  ADD COLUMN IF NOT EXISTS government_reference TEXT,
  ADD COLUMN IF NOT EXISTS disbursement_reference TEXT,
  ADD COLUMN IF NOT EXISTS status_history JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE subsidy_applications
SET id = COALESCE(id, application_id::TEXT),
    applicant_id = COALESCE(applicant_id, farmer_id::TEXT),
    scheme_code = COALESCE(scheme_code, scheme_id::TEXT),
    documents = COALESCE(documents, documents_submitted, '[]'::jsonb),
    status = COALESCE(status, CASE application_status
      WHEN 'approved' THEN 'approved'
      WHEN 'submitted' THEN 'submitted'
      WHEN 'disbursed' THEN 'disbursed'
      ELSE 'pending_human_approval'
    END),
    status_history = COALESCE(status_history, '[]'::jsonb),
    updated_at = COALESCE(updated_at, NOW());
ALTER TABLE subsidy_applications
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN eligibility_id SET NOT NULL,
  ALTER COLUMN applicant_id SET NOT NULL,
  ALTER COLUMN scheme_code SET NOT NULL,
  ALTER COLUMN documents SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status_history SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_subsidy_applications_id
  ON subsidy_applications (id);

CREATE TABLE IF NOT EXISTS subsidy_applications (
  id TEXT PRIMARY KEY,
  eligibility_id TEXT NOT NULL REFERENCES subsidy_eligibility(id),
  applicant_id TEXT NOT NULL,
  scheme_code VARCHAR(64) NOT NULL,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL CHECK (status IN (
    'pending_human_approval', 'approved', 'submitted', 'disbursed'
  )),
  government_reference TEXT,
  disbursement_reference TEXT,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subsidy_idempotency_keys (
  actor_id TEXT NOT NULL,
  idempotency_key VARCHAR(200) NOT NULL,
  application_id TEXT NOT NULL REFERENCES subsidy_applications(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (actor_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS subsidy_audit_events (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(64) NOT NULL,
  actor_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subsidy_eligibility_applicant
  ON subsidy_eligibility (applicant_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_subsidy_applications_applicant
  ON subsidy_applications (applicant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subsidy_applications_status
  ON subsidy_applications (status);
CREATE INDEX IF NOT EXISTS idx_subsidy_audit_resource
  ON subsidy_audit_events (resource_id, created_at DESC);
