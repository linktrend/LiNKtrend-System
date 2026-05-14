-- LiNKbrain audit RPC wrapper (CONTRACTS_MVO.md §6.3, WP-010 preflight)
--
-- Context: Supabase/PostgREST may not expose the private `linkbrain` schema directly
-- to the service client via `.schema("linkbrain").rpc()`. This wrapper provides a
-- safe path through the exposed `linkaios_kernel` schema that delegates to the
-- private `linkbrain.write_audit_event` SECURITY DEFINER function.
--
-- Security: This wrapper maintains the same validation and PII guards as the
-- private function. It does NOT expose `linkbrain.audit_events` directly.

-- Wrapper function in linkaios_kernel schema
CREATE OR REPLACE FUNCTION linkaios_kernel.write_brain_audit_event(
  p_event_id uuid,
  p_ts timestamptz,
  p_tenant_id uuid,
  p_plane text,
  p_actor_kind text,
  p_actor_id text,
  p_action text,
  p_subject jsonb,
  p_refs jsonb,
  p_payload jsonb,
  p_schema_version text
)
RETURNS TABLE (event_id uuid, persisted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, linkbrain, public
AS $$
BEGIN
  -- Delegate to the private linkbrain function
  -- This maintains SECURITY DEFINER context and all validation
  RETURN QUERY
    SELECT * FROM linkbrain.write_audit_event(
      p_event_id, p_ts, p_tenant_id, p_plane, p_actor_kind, p_actor_id,
      p_action, p_subject, p_refs, p_payload, p_schema_version
    );
END;
$$;

-- Grants: service_role only
REVOKE ALL ON FUNCTION linkaios_kernel.write_brain_audit_event(uuid, timestamptz, uuid, text, text, text, text, jsonb, jsonb, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.write_brain_audit_event(uuid, timestamptz, uuid, text, text, text, text, jsonb, jsonb, jsonb, text) TO service_role;

COMMENT ON FUNCTION linkaios_kernel.write_brain_audit_event IS
  'Safe wrapper for linkbrain.write_audit_event. Used when direct .schema("linkbrain").rpc() is not callable. Maintains SECURITY DEFINER delegation to private schema.';

-- ---------------------------------------------------------------------------
-- RPC preflight test helper
-- This function helps verify which path works (direct vs wrapper).
-- Uses canonical audit actions per CONTRACTS_MVO.md §6.3.1.
-- Safe to call repeatedly: uses deterministic UUIDs with idempotent writes.
-- Does not leave non-canonical rows in linkbrain.audit_events.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION linkaios_kernel.test_brain_rpc_path()
RETURNS TABLE (
  path_name text,
  is_callable boolean,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios_kernel, linkbrain, public
AS $$
DECLARE
  -- Deterministic test UUIDs (RFC 4122 variant)
  v_test_event_id uuid := '00000000-0000-4000-8000-00000000dead';
  v_test_tenant_id uuid := '00000000-0000-4000-8000-00000000beef';
  v_test_run_id uuid := '00000000-0000-4000-8000-00000000cafe';
  v_result RECORD;
  v_direct_callable boolean := false;
  v_wrapper_callable boolean := false;
BEGIN
  -- Pre-clean any stale test row (in case prior run left it)
  DELETE FROM linkbrain.audit_events
  WHERE event_id = v_test_event_id
    AND plane = 'linkaios'
    AND action = 'run.started'
    AND subject ->> 'run_id' = v_test_run_id::text;

  -- Test 1: Direct path (via linkbrain schema)
  BEGIN
    SELECT * INTO v_result
    FROM linkbrain.write_audit_event(
      v_test_event_id,
      now(),
      v_test_tenant_id,
      'linkaios',           -- canonical plane per §1.2
      'kernel',             -- canonical actor_kind per §6.3
      'linkaios.preflight', -- actor_id scoped to preflight
      'run.started',        -- canonical action per §6.3.1
      jsonb_build_object('run_id', v_test_run_id::text), -- subject with run_id
      '{}'::jsonb,          -- refs
      jsonb_build_object('_preflight', true, '_purpose', 'LiNKbrain RPC path test'), -- marked payload
      '1'                   -- schema_version per §6.3
    );
    v_direct_callable := true;
    RETURN QUERY SELECT 'linkbrain.write_audit_event (direct)'::text, true, null::text;
  EXCEPTION WHEN OTHERS THEN
    v_direct_callable := false;
    RETURN QUERY SELECT 'linkbrain.write_audit_event (direct)'::text, false, SQLERRM::text;
  END;

  -- Clean up test row if written
  DELETE FROM linkbrain.audit_events
  WHERE event_id = v_test_event_id
    AND plane = 'linkaios'
    AND action = 'run.started'
    AND subject ->> 'run_id' = v_test_run_id::text;

  -- Test 2: Wrapper path (via linkaios_kernel schema)
  BEGIN
    SELECT * INTO v_result
    FROM linkaios_kernel.write_brain_audit_event(
      v_test_event_id,
      now(),
      v_test_tenant_id,
      'linkaios',           -- canonical plane
      'kernel',             -- canonical actor_kind
      'linkaios.preflight', -- actor_id scoped to preflight
      'run.started',        -- canonical action per §6.3.1
      jsonb_build_object('run_id', v_test_run_id::text), -- subject with run_id
      '{}'::jsonb,          -- refs
      jsonb_build_object('_preflight', true, '_purpose', 'LiNKbrain RPC path test'), -- marked payload
      '1'                   -- schema_version
    );
    v_wrapper_callable := true;
    RETURN QUERY SELECT 'linkaios_kernel.write_brain_audit_event (wrapper)'::text, true, null::text;
  EXCEPTION WHEN OTHERS THEN
    v_wrapper_callable := false;
    RETURN QUERY SELECT 'linkaios_kernel.write_brain_audit_event (wrapper)'::text, false, SQLERRM::text;
  END;

  -- Final cleanup (safe even if no row exists)
  DELETE FROM linkbrain.audit_events
  WHERE event_id = v_test_event_id
    AND plane = 'linkaios'
    AND action = 'run.started'
    AND subject ->> 'run_id' = v_test_run_id::text;

  -- Final result: if both failed, include actionable guidance without recursively calling this function.
  IF NOT v_direct_callable AND NOT v_wrapper_callable THEN
    RETURN QUERY SELECT
      'diagnosis'::text,
      false,
      'Both RPC paths failed. Check: (1) migrations 023 and 026 applied, (2) service_role has EXECUTE grant on both functions, (3) linkbrain schema exists with write_audit_event function.'::text;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION linkaios_kernel.test_brain_rpc_path() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios_kernel.test_brain_rpc_path() TO service_role;

COMMENT ON FUNCTION linkaios_kernel.test_brain_rpc_path IS
  'Preflight test for LiNKbrain RPC path. Tests both direct linkbrain schema access and the linkaios_kernel wrapper. Uses canonical run.started action per §6.3.1. Safe to call repeatedly (idempotent on deterministic event_id). Cleans up test rows after each run.';
