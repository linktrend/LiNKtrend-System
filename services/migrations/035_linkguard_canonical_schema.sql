-- Promote linkguard to canonical schema; retire exposed prism schema.
-- Requires linkguard in PostgREST "Exposed schemas". Remove prism from exposed schemas after apply.

BEGIN;

-- Drop alias views from 034 so tables can move into linkguard.
DROP VIEW IF EXISTS linkguard.cleanup_events;
DROP VIEW IF EXISTS linkguard.swept_sessions;

-- Move canonical tables out of legacy prism schema.
DO $$
BEGIN
  IF to_regclass('prism.cleanup_events') IS NOT NULL THEN
    ALTER TABLE prism.cleanup_events SET SCHEMA linkguard;
  END IF;
  IF to_regclass('prism.swept_sessions') IS NOT NULL THEN
    ALTER TABLE prism.swept_sessions SET SCHEMA linkguard;
  END IF;
END $$;

DROP SCHEMA IF EXISTS prism;

-- Rename legacy index names (indexes move with tables).
DO $$
BEGIN
  IF to_regclass('linkguard.idx_prism_cleanup_session') IS NOT NULL
     AND to_regclass('linkguard.idx_linkguard_cleanup_session') IS NULL THEN
    ALTER INDEX linkguard.idx_prism_cleanup_session RENAME TO idx_linkguard_cleanup_session;
  END IF;
  IF to_regclass('linkguard.idx_prism_cleanup_action_created') IS NOT NULL
     AND to_regclass('linkguard.idx_linkguard_cleanup_action_created') IS NULL THEN
    ALTER INDEX linkguard.idx_prism_cleanup_action_created RENAME TO idx_linkguard_cleanup_action_created;
  END IF;
  IF to_regclass('linkguard.idx_prism_swept_at') IS NOT NULL
     AND to_regclass('linkguard.idx_linkguard_swept_at') IS NULL THEN
    ALTER INDEX linkguard.idx_prism_swept_at RENAME TO idx_linkguard_swept_at;
  END IF;
END $$;

COMMENT ON SCHEMA linkguard IS
  'LiNKguard worker security and cleanup telemetry (formerly prism schema).';
COMMENT ON TABLE linkguard.cleanup_events IS
  'LiNKguard cleanup and containment events (heartbeats, residue sweep, session end).';
COMMENT ON TABLE linkguard.swept_sessions IS
  'LiNKguard acknowledged closed worker sessions (residue sweep bookkeeping).';

-- RLS policies (rename prism_* → linkguard_* on moved tables).
ALTER TABLE linkguard.cleanup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkguard.swept_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prism_cleanup_authenticated ON linkguard.cleanup_events;
DROP POLICY IF EXISTS prism_cleanup_select ON linkguard.cleanup_events;
DROP POLICY IF EXISTS prism_cleanup_insert ON linkguard.cleanup_events;
DROP POLICY IF EXISTS prism_cleanup_update ON linkguard.cleanup_events;
DROP POLICY IF EXISTS prism_cleanup_delete ON linkguard.cleanup_events;

CREATE POLICY linkguard_cleanup_select ON linkguard.cleanup_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY linkguard_cleanup_insert ON linkguard.cleanup_events
  FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkguard_cleanup_update ON linkguard.cleanup_events
  FOR UPDATE TO authenticated
  USING (linkaios.command_centre_write_allowed())
  WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkguard_cleanup_delete ON linkguard.cleanup_events
  FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

DROP POLICY IF EXISTS prism_swept_authenticated ON linkguard.swept_sessions;
DROP POLICY IF EXISTS prism_swept_select ON linkguard.swept_sessions;
DROP POLICY IF EXISTS prism_swept_insert ON linkguard.swept_sessions;
DROP POLICY IF EXISTS prism_swept_update ON linkguard.swept_sessions;
DROP POLICY IF EXISTS prism_swept_delete ON linkguard.swept_sessions;

CREATE POLICY linkguard_swept_select ON linkguard.swept_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY linkguard_swept_insert ON linkguard.swept_sessions
  FOR INSERT TO authenticated WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkguard_swept_update ON linkguard.swept_sessions
  FOR UPDATE TO authenticated
  USING (linkaios.command_centre_write_allowed())
  WITH CHECK (linkaios.command_centre_write_allowed());
CREATE POLICY linkguard_swept_delete ON linkguard.swept_sessions
  FOR DELETE TO authenticated USING (linkaios.command_centre_write_allowed());

GRANT USAGE ON SCHEMA linkguard TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkguard.cleanup_events TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON linkguard.swept_sessions TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA linkguard
  GRANT ALL ON TABLES TO anon, authenticated, service_role;

COMMIT;
