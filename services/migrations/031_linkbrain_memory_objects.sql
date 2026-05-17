-- LiNKbrain Memory Object persistence (WP-087, CONTRACTS_MVO.md §6.3, LINKBRAIN_COMPLETION_PLAN.md §2.2)
--
-- Derived memory objects (LeadMemory, ResearchBundle, EpisodeSummary) are promoted
-- from audit events and persisted with full provenance links. This enables:
-- - Context assembly for LinkBot reasoning
-- - Scoped retrieval with tenant isolation
-- - Learning loops and benchmarks
--
-- Reuse note: follows the structural pattern from linkbrain.audit_events
-- (tenant_id, jsonb payload, RLS, SECURITY DEFINER writer).

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS linkbrain;

-- Memory object state enum values as CHECK constraint for clarity
CREATE TABLE IF NOT EXISTS linkbrain.memory_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,

  -- Memory object classification
  type text NOT NULL,
  scope_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Provenance: links back to audit events that produced this memory
  provenance_event_ids uuid[] NOT NULL DEFAULT '{}',

  -- The actual memory payload (LeadMemory, ResearchBundle, EpisodeSummary, etc.)
  payload_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- State machine for memory lifecycle
  state text NOT NULL DEFAULT 'active',

  -- Confidence score (0.0 to 1.0) for extracted/derived memories
  confidence decimal(3,2) NOT NULL DEFAULT 1.00,

  -- Temporal tracking
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- §1.2 Plane union for source tracking (which plane created this memory)
  source_plane text NOT NULL,

  -- Optional reference to the run that produced this memory
  run_id uuid,

  -- Optional reference to the plugin that owns this memory context
  plugin_id text,

  -- Optional reference to a role within a plugin (for LinkBot attribution)
  role_id text,

  -- CONSTRAINTS
  -- Type must be non-empty
  CONSTRAINT memory_objects_type_nonempty CHECK (length(trim(type)) > 0),

  -- State must be one of the canonical values
  CONSTRAINT memory_objects_state_check CHECK (
    state IN ('active', 'archived', 'superseded', 'expired', 'pending_validation')
  ),

  -- Source plane must be valid
  CONSTRAINT memory_objects_plane_check CHECK (
    source_plane IN ('linkaios', 'linkbot', 'linkskills', 'linkautowork', 'linkbrain')
  ),

  -- Confidence must be between 0.00 and 1.00
  CONSTRAINT memory_objects_confidence_range CHECK (
    confidence >= 0.00 AND confidence <= 1.00
  ),

  -- PII guard: payload must not carry raw contact fields
  CONSTRAINT memory_objects_payload_no_pii CHECK (
    NOT (payload_jsonb ? 'email')
    AND NOT (payload_jsonb ? 'phone')
    AND NOT (payload_jsonb ? 'contact_email')
    AND NOT (payload_jsonb ? 'contact_phone')
    AND NOT (payload_jsonb ? 'contact')
  )
);

COMMENT ON TABLE linkbrain.memory_objects IS
  'Derived memory objects (LeadMemory, ResearchBundle, EpisodeSummary) promoted from audit events. Enables context assembly and learning loops.';

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS memory_objects_tenant_type
  ON linkbrain.memory_objects (tenant_id, type, updated_at DESC);

CREATE INDEX IF NOT EXISTS memory_objects_tenant_state
  ON linkbrain.memory_objects (tenant_id, state, updated_at DESC);

CREATE INDEX IF NOT EXISTS memory_objects_provenance
  ON linkbrain.memory_objects USING GIN (provenance_event_ids);

CREATE INDEX IF NOT EXISTS memory_objects_run_id
  ON linkbrain.memory_objects (run_id)
  WHERE run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS memory_objects_scope
  ON linkbrain.memory_objects USING GIN (scope_jsonb);

-- For temporal queries (recent memories, expiring memories)
CREATE INDEX IF NOT EXISTS memory_objects_created_at
  ON linkbrain.memory_objects (created_at DESC);

-- Enable RLS for tenant isolation
ALTER TABLE linkbrain.memory_objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure clean state
DROP POLICY IF EXISTS memory_objects_select_tenant ON linkbrain.memory_objects;
DROP POLICY IF EXISTS memory_objects_insert_service ON linkbrain.memory_objects;
DROP POLICY IF EXISTS memory_objects_update_service ON linkbrain.memory_objects;

-- SELECT: service_role can read all (app-layer tenant scoping for MVO)
-- Future: auth.uid()-aware policies for tenant-isolated reads
CREATE POLICY memory_objects_select_tenant ON linkbrain.memory_objects
  FOR SELECT
  TO service_role
  USING (true);

-- INSERT: service_role can insert
CREATE POLICY memory_objects_insert_service ON linkbrain.memory_objects
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE: service_role can update (for state transitions, confidence updates)
CREATE POLICY memory_objects_update_service ON linkbrain.memory_objects
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No DELETE policy - memory objects are append-only with state transitions

-- Grants: service_role only
GRANT USAGE ON SCHEMA linkbrain TO service_role;
GRANT SELECT, INSERT, UPDATE ON linkbrain.memory_objects TO service_role;
REVOKE DELETE, TRUNCATE ON linkbrain.memory_objects FROM PUBLIC, anon, authenticated, service_role;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION linkbrain.memory_objects_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS memory_objects_updated_at ON linkbrain.memory_objects;
CREATE TRIGGER memory_objects_updated_at
  BEFORE UPDATE ON linkbrain.memory_objects
  FOR EACH ROW
  EXECUTE FUNCTION linkbrain.memory_objects_update_timestamp();

-- SECURITY DEFINER writer function for memory objects
-- Validates envelope and writes with full provenance tracking
CREATE OR REPLACE FUNCTION linkbrain.write_memory_object(
  p_tenant_id uuid,
  p_type text,
  p_scope_jsonb jsonb,
  p_provenance_event_ids uuid[],
  p_payload_jsonb jsonb,
  p_state text DEFAULT 'active',
  p_confidence decimal(3,2) DEFAULT 1.00,
  p_source_plane text DEFAULT 'linkbrain',
  p_run_id uuid DEFAULT NULL,
  p_plugin_id text DEFAULT NULL,
  p_role_id text DEFAULT NULL
)
RETURNS TABLE (id uuid, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkbrain, public
AS $$
DECLARE
  v_scope jsonb := coalesce(p_scope_jsonb, '{}'::jsonb);
  v_payload jsonb := coalesce(p_payload_jsonb, '{}'::jsonb);
  v_provenance uuid[] := coalesce(p_provenance_event_ids, '{}');
  v_new_id uuid;
  v_created_at timestamptz;
BEGIN
  -- Validation
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: tenant_id is required';
  END IF;
  IF p_type IS NULL OR length(trim(p_type)) = 0 THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: type is required';
  END IF;
  IF p_state NOT IN ('active', 'archived', 'superseded', 'expired', 'pending_validation') THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: state must be one of active, archived, superseded, expired, pending_validation';
  END IF;
  IF p_source_plane NOT IN ('linkaios', 'linkbot', 'linkskills', 'linkautowork', 'linkbrain') THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: source_plane must be a valid plane';
  END IF;
  IF p_confidence < 0 OR p_confidence > 1 THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: confidence must be between 0.00 and 1.00';
  END IF;

  -- PII guard (belt-and-suspenders with table CHECK)
  IF v_payload ? 'email' OR v_payload ? 'phone'
     OR v_payload ? 'contact_email' OR v_payload ? 'contact_phone'
     OR v_payload ? 'contact' THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_PII_FORBIDDEN: payload must not include raw contact fields';
  END IF;

  -- Insert the memory object
  INSERT INTO linkbrain.memory_objects (
    tenant_id, type, scope_jsonb, provenance_event_ids, payload_jsonb,
    state, confidence, source_plane, run_id, plugin_id, role_id
  ) VALUES (
    p_tenant_id, trim(p_type), v_scope, v_provenance, v_payload,
    p_state, p_confidence, p_source_plane, p_run_id, p_plugin_id, p_role_id
  )
  RETURNING memory_objects.id, memory_objects.created_at
  INTO v_new_id, v_created_at;

  RETURN QUERY SELECT v_new_id, v_created_at;
END;
$$;

REVOKE ALL ON FUNCTION linkbrain.write_memory_object(uuid, text, jsonb, uuid[], jsonb, text, decimal, text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkbrain.write_memory_object(uuid, text, jsonb, uuid[], jsonb, text, decimal, text, uuid, text, text) TO service_role;

COMMENT ON FUNCTION linkbrain.write_memory_object IS
  'Write a memory object with full provenance tracking. Validates PII guards and state constraints.';

-- Update function for state transitions (e.g., active -> superseded)
CREATE OR REPLACE FUNCTION linkbrain.update_memory_object_state(
  p_id uuid,
  p_tenant_id uuid,
  p_new_state text,
  p_new_confidence decimal(3,2) DEFAULT NULL
)
RETURNS TABLE (id uuid, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkbrain, public
AS $$
DECLARE
  v_updated_at timestamptz;
BEGIN
  IF p_new_state NOT IN ('active', 'archived', 'superseded', 'expired', 'pending_validation') THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_INVALID: state must be one of active, archived, superseded, expired, pending_validation';
  END IF;

  UPDATE linkbrain.memory_objects mo
  SET state = p_new_state,
      confidence = coalesce(p_new_confidence, mo.confidence)
  WHERE mo.id = p_id AND mo.tenant_id = p_tenant_id
  RETURNING mo.updated_at INTO v_updated_at;

  IF v_updated_at IS NULL THEN
    RAISE EXCEPTION 'MEMORY_OBJECT_NOT_FOUND: no memory object found for id % and tenant %', p_id, p_tenant_id;
  END IF;

  RETURN QUERY SELECT p_id, v_updated_at;
END;
$$;

REVOKE ALL ON FUNCTION linkbrain.update_memory_object_state(uuid, uuid, text, decimal) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkbrain.update_memory_object_state(uuid, uuid, text, decimal) TO service_role;

COMMENT ON FUNCTION linkbrain.update_memory_object_state IS
  'Update the state (and optionally confidence) of a memory object. Tenant-scoped for safety.';

-- Query helper: Get memories by run_id with type filter
CREATE OR REPLACE FUNCTION linkbrain.get_memories_by_run(
  p_run_id uuid,
  p_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  type text,
  state text,
  confidence decimal,
  created_at timestamptz,
  payload_jsonb jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkbrain, public
AS $$
BEGIN
  IF p_type IS NOT NULL THEN
    RETURN QUERY
    SELECT mo.id, mo.tenant_id, mo.type, mo.state, mo.confidence, mo.created_at, mo.payload_jsonb
    FROM linkbrain.memory_objects mo
    WHERE mo.run_id = p_run_id AND mo.type = p_type
    ORDER BY mo.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT mo.id, mo.tenant_id, mo.type, mo.state, mo.confidence, mo.created_at, mo.payload_jsonb
    FROM linkbrain.memory_objects mo
    WHERE mo.run_id = p_run_id
    ORDER BY mo.created_at DESC;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION linkbrain.get_memories_by_run(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkbrain.get_memories_by_run(uuid, text) TO service_role;

COMMENT ON FUNCTION linkbrain.get_memories_by_run IS
  'Retrieve memory objects associated with a specific run, optionally filtered by type.';
