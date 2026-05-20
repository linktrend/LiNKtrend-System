-- Preview artifact storage for WebsiteFactory MVO (CONTRACTS_MVO.md §7.4, §11.3, INT-022).
-- Provides persistent backing for LiNKautowork rendered preview bundles.
-- WP-008 implements in-memory storage; this migration adds persistent storage for production use.

CREATE SCHEMA IF NOT EXISTS linkaios;

-- ---------------------------------------------------------------------------
-- Preview artifacts — rendered website bundles from autowork.websitefactory.render
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios.preview_artifacts (
  artifact_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_ref text NOT NULL UNIQUE,  -- canonical handle: "preview:<tenant_id>:<run_id>"
  tenant_id uuid NOT NULL,
  run_id uuid NOT NULL,
  plugin_id text NOT NULL DEFAULT 'websitefactory',

  -- Render spec snapshot (for reproducibility/debugging)
  template_id text,
  render_spec jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Artifact metadata
  content_type text NOT NULL DEFAULT 'text/html',
  content_length int,
  encoding text DEFAULT 'utf-8',

  -- Storage paths/references
  storage_kind text NOT NULL DEFAULT 'inline'  -- 'inline' | 'supabase_storage' | 's3' | 'filesystem'
    CHECK (storage_kind IN ('inline', 'supabase_storage', 's3', 'filesystem')),
  storage_path text,  -- bucket/path for object storage, or filesystem path
  inline_content text,  -- for small MVO previews, store content directly

  -- Lease and workflow refs (audit trail)
  lease_id uuid,
  workflow_run_id uuid,

  -- Lifecycle
  status text NOT NULL DEFAULT 'pending'  -- 'pending' | 'rendering' | 'ready' | 'failed' | 'expired' | 'purged'
    CHECK (status IN ('pending', 'rendering', 'ready', 'failed', 'expired', 'purged')),

  -- Serving metadata
  serve_route text,  -- e.g., "/preview/<tenant>/<run_id>/index.html"
  preview_url text,  -- absolute URL where preview is accessible

  -- TTL and cleanup
  expires_at timestamptz,
  purged_at timestamptz,
  purge_reason text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  rendered_at timestamptz,

  -- Unique constraint: one artifact per (tenant_id, run_id, plugin_id) for idempotency
  UNIQUE (tenant_id, run_id, plugin_id)
);

COMMENT ON TABLE linkaios.preview_artifacts IS
  'Preview artifact storage for WebsiteFactory MVO (§7.4). Stores rendered HTML bundles. WP-008 in-memory cache delegates here for persistence.';

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_tenant ON linkaios.preview_artifacts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_run ON linkaios.preview_artifacts (run_id);
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_status ON linkaios.preview_artifacts (status);
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_expires ON linkaios.preview_artifacts (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_ref ON linkaios.preview_artifacts (artifact_ref);
CREATE INDEX IF NOT EXISTS idx_preview_artifacts_lease ON linkaios.preview_artifacts (lease_id) WHERE lease_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Preview artifact audit trail — lifecycle events for each artifact
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkaios.preview_artifact_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id uuid NOT NULL REFERENCES linkaios.preview_artifacts (artifact_id) ON DELETE CASCADE,
  event_kind text NOT NULL  -- 'created' | 'render_started' | 'render_completed' | 'render_failed' | 'served' | 'expired' | 'purged'
    CHECK (event_kind IN ('created', 'render_started', 'render_completed', 'render_failed', 'served', 'expired', 'purged')),
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_preview_artifact_events_artifact ON linkaios.preview_artifact_events (artifact_id);
CREATE INDEX IF NOT EXISTS idx_preview_artifact_events_kind ON linkaios.preview_artifact_events (event_kind);

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------
ALTER TABLE linkaios.preview_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkaios.preview_artifact_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON linkaios.preview_artifacts FROM anon;
REVOKE ALL ON linkaios.preview_artifact_events FROM anon;

-- service_role can manage artifacts
GRANT SELECT, INSERT, UPDATE, DELETE ON linkaios.preview_artifacts TO service_role;
GRANT SELECT, INSERT ON linkaios.preview_artifact_events TO service_role;

-- authenticated users can view artifacts for their tenant (RLS policy applied by app layer)
GRANT SELECT ON linkaios.preview_artifacts TO authenticated;
GRANT SELECT ON linkaios.preview_artifact_events TO authenticated;

-- ---------------------------------------------------------------------------
-- Helper RPCs for LiNKautowork integration
-- ---------------------------------------------------------------------------

-- Create or update a preview artifact (idempotent per tenant_id + run_id + plugin_id)
CREATE OR REPLACE FUNCTION linkaios.upsert_preview_artifact(
  p_tenant_id uuid,
  p_run_id uuid,
  p_plugin_id text,
  p_artifact_ref text,
  p_template_id text,
  p_render_spec jsonb,
  p_content_type text DEFAULT 'text/html',
  p_storage_kind text DEFAULT 'inline',
  p_storage_path text DEFAULT NULL,
  p_inline_content text DEFAULT NULL,
  p_lease_id uuid DEFAULT NULL,
  p_workflow_run_id uuid DEFAULT NULL,
  p_serve_route text DEFAULT NULL,
  p_preview_url text DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS TABLE (artifact_id uuid, created boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  v_artifact_id uuid;
  v_created boolean := false;
BEGIN
  -- Try to find existing artifact
  SELECT pa.artifact_id INTO v_artifact_id
  FROM linkaios.preview_artifacts pa
  WHERE pa.tenant_id = p_tenant_id
    AND pa.run_id = p_run_id
    AND pa.plugin_id = p_plugin_id;

  IF v_artifact_id IS NOT NULL THEN
    -- Update existing
    UPDATE linkaios.preview_artifacts
    SET artifact_ref = p_artifact_ref,
        template_id = p_template_id,
        render_spec = p_render_spec,
        content_type = p_content_type,
        storage_kind = p_storage_kind,
        storage_path = p_storage_path,
        inline_content = p_inline_content,
        lease_id = p_lease_id,
        workflow_run_id = p_workflow_run_id,
        serve_route = p_serve_route,
        preview_url = p_preview_url,
        expires_at = p_expires_at,
        updated_at = now()
    WHERE artifact_id = v_artifact_id;
    v_created := false;
  ELSE
    -- Insert new
    INSERT INTO linkaios.preview_artifacts (
      tenant_id, run_id, plugin_id, artifact_ref, template_id, render_spec,
      content_type, storage_kind, storage_path, inline_content,
      lease_id, workflow_run_id, serve_route, preview_url, expires_at
    ) VALUES (
      p_tenant_id, p_run_id, p_plugin_id, p_artifact_ref, p_template_id, p_render_spec,
      p_content_type, p_storage_kind, p_storage_path, p_inline_content,
      p_lease_id, p_workflow_run_id, p_serve_route, p_preview_url, p_expires_at
    )
    RETURNING linkaios.preview_artifacts.artifact_id INTO v_artifact_id;
    v_created := true;

    -- Record creation event
    INSERT INTO linkaios.preview_artifact_events (artifact_id, event_kind, event_data)
    VALUES (v_artifact_id, 'created', jsonb_build_object('workflow_run_id', p_workflow_run_id));
  END IF;

  RETURN QUERY SELECT v_artifact_id, v_created;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.upsert_preview_artifact(uuid, uuid, text, text, text, jsonb, text, text, text, text, uuid, uuid, text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.upsert_preview_artifact(uuid, uuid, text, text, text, jsonb, text, text, text, text, uuid, uuid, text, text, timestamptz) TO service_role;

-- Mark artifact as ready (render completed)
CREATE OR REPLACE FUNCTION linkaios.mark_preview_artifact_ready(
  p_artifact_id uuid,
  p_content_length int DEFAULT NULL,
  p_inline_content text DEFAULT NULL,
  p_storage_path text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
BEGIN
  UPDATE linkaios.preview_artifacts
  SET status = 'ready',
      content_length = COALESCE(p_content_length, content_length),
      inline_content = COALESCE(p_inline_content, inline_content),
      storage_path = COALESCE(p_storage_path, storage_path),
      rendered_at = now(),
      updated_at = now()
  WHERE artifact_id = p_artifact_id;

  IF FOUND THEN
    INSERT INTO linkaios.preview_artifact_events (artifact_id, event_kind, event_data)
    VALUES (p_artifact_id, 'render_completed', '{}'::jsonb);
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.mark_preview_artifact_ready(uuid, int, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.mark_preview_artifact_ready(uuid, int, text, text) TO service_role;

-- Get artifact by ref
CREATE OR REPLACE FUNCTION linkaios.get_preview_artifact_by_ref(
  p_artifact_ref text
)
RETURNS TABLE (
  artifact_id uuid,
  tenant_id uuid,
  run_id uuid,
  plugin_id text,
  status text,
  content_type text,
  inline_content text,
  storage_path text,
  serve_route text,
  preview_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
  SELECT
    pa.artifact_id,
    pa.tenant_id,
    pa.run_id,
    pa.plugin_id,
    pa.status,
    pa.content_type,
    pa.inline_content,
    pa.storage_path,
    pa.serve_route,
    pa.preview_url
  FROM linkaios.preview_artifacts pa
  WHERE pa.artifact_ref = p_artifact_ref
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION linkaios.get_preview_artifact_by_ref(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.get_preview_artifact_by_ref(text) TO service_role;
GRANT EXECUTE ON FUNCTION linkaios.get_preview_artifact_by_ref(text) TO authenticated;

-- Expire old artifacts (cleanup job)
CREATE OR REPLACE FUNCTION linkaios.expire_old_preview_artifacts(
  p_max_age_days int DEFAULT 14
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE linkaios.preview_artifacts
  SET status = 'expired',
      updated_at = now()
  WHERE status IN ('pending', 'ready')
    AND created_at < now() - (p_max_age_days || ' days')::interval;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.expire_old_preview_artifacts(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.expire_old_preview_artifacts(int) TO service_role;

-- Record artifact served event
CREATE OR REPLACE FUNCTION linkaios.record_preview_artifact_served(
  p_artifact_id uuid,
  p_serve_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = linkaios, public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO linkaios.preview_artifact_events (artifact_id, event_kind, event_data)
  VALUES (p_artifact_id, 'served', p_serve_data)
  RETURNING linkaios.preview_artifact_events.event_id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

REVOKE ALL ON FUNCTION linkaios.record_preview_artifact_served(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION linkaios.record_preview_artifact_served(uuid, jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
COMMENT ON FUNCTION linkaios.upsert_preview_artifact IS
  'Create or update a preview artifact. Idempotent per (tenant_id, run_id, plugin_id). Returns (artifact_id, created).';
COMMENT ON FUNCTION linkaios.mark_preview_artifact_ready IS
  'Mark a preview artifact as ready after successful render. Records render_completed event.';
COMMENT ON FUNCTION linkaios.get_preview_artifact_by_ref IS
  'Retrieve artifact by canonical artifact_ref. Used by LiNKaios preview serve route.';
COMMENT ON FUNCTION linkaios.expire_old_preview_artifacts IS
  'Background job to expire artifacts older than max_age_days. Default 14 days for MVO.';
COMMENT ON FUNCTION linkaios.record_preview_artifact_served IS
  'Record a serve event for analytics and audit purposes.';
