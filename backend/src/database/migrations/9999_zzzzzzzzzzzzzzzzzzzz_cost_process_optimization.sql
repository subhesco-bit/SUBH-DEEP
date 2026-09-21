-- Cost and process optimization evidence, recommendations, and review state.
-- Recommendations never mutate ledgers or operational workflows without review.
CREATE TABLE IF NOT EXISTS optimization_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  process_key TEXT NOT NULL,
  process_metrics JSONB NOT NULL,
  cost_plan JSONB NOT NULL,
  decision JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  correlation_id UUID NOT NULL,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_optimization_assessments_org_status
  ON optimization_assessments (organization_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_optimization_assessments_correlation
  ON optimization_assessments (correlation_id);
