-- Per-LiNKbot programmable policy (models, fallbacks, spend caps, behaviour flags).
ALTER TABLE linkaios.agents
  ADD COLUMN IF NOT EXISTS runtime_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN linkaios.agents.runtime_settings IS
  'JSON policy: models.primary, models.fallbackOnline, models.fallbackLocal, cloudSpend token thresholds, behaviour toggles. Parsed by linkaios-web.';
