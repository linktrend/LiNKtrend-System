-- Collective memory tags are set at item creation (licensee side), not during anonymisation.
ALTER TABLE linkaios.brain_virtual_files
  ADD COLUMN IF NOT EXISTS memory_tags jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN linkaios.brain_virtual_files.memory_tags IS
  'Industry / pattern / use-case tags assigned when the virtual file is first created (human, LiNKbot, or automation). Validated on write; anonymisation only scrubs body text.';
