-- Governed AI decision envelopes are retained with every proposal.
ALTER TABLE ai_proposals
  ADD COLUMN IF NOT EXISTS decision_envelope JSONB,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_ai_proposals_correlation
  ON ai_proposals (correlation_id);
