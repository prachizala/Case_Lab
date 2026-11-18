-- ==============================================================================
-- SBS CaseLab: Migration 00013 - Institutional Token Usage Tracking
-- ==============================================================================
-- Tracks token usage across all Groq API calls (prompt, completion, total)
-- Supports monthly institutional budget counting and departmental breakdowns.

CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  feature VARCHAR(64) NOT NULL DEFAULT 'case_generation',
  model VARCHAR(128) NOT NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0
);

-- Indices for rapid monthly aggregation and breakdown queries
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_model_feature ON token_usage(model, feature);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id) WHERE user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Admins and faculty can view aggregated usage; students can only view their own
CREATE POLICY "Admins full access on token_usage"
  ON token_usage FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert usage logs"
  ON token_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE token_usage IS 'Audited institutional token consumption logs for Groq LLM operations';
