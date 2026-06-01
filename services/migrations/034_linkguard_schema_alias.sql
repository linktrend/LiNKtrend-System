-- Wave 4: LiNKguard schema alias over legacy prism schema.
-- Safe additive migration: does NOT rename prism objects or move data.
-- Expose linkguard in PostgREST "Exposed schemas" alongside prism during transition.

BEGIN;

CREATE SCHEMA IF NOT EXISTS linkguard;

COMMENT ON SCHEMA prism IS
  'Legacy internal name for LiNKguard worker security/cleanup telemetry. Canonical alias: linkguard schema (Wave 4).';
COMMENT ON SCHEMA linkguard IS
  'LiNKguard alias surface over legacy prism schema. Views delegate to prism tables.';

CREATE OR REPLACE VIEW linkguard.cleanup_events AS
SELECT * FROM prism.cleanup_events;

CREATE OR REPLACE VIEW linkguard.swept_sessions AS
SELECT * FROM prism.swept_sessions;

COMMENT ON VIEW linkguard.cleanup_events IS
  'LiNKguard cleanup events (alias over prism.cleanup_events).';
COMMENT ON VIEW linkguard.swept_sessions IS
  'LiNKguard swept worker sessions (alias over prism.swept_sessions).';

GRANT USAGE ON SCHEMA linkguard TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkguard.cleanup_events TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkguard.swept_sessions TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkguard
  GRANT ALL ON TABLES TO anon, authenticated, service_role;

COMMIT;
