-- =============================================================================
-- WP-094: LEXOS Core Schema - Identity, Intake, Clients, Matters (Current State)
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- =============================================================================

-- user_profiles: App-specific role and display metadata
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- intake_records: W0 intake workflow records
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- intake_groups: Related prospective clients in the same onboarding group
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- client_candidates: Prospective clients during W0 intake
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- matter_candidates: Candidate matters during W0 intake
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- intake_tasks: W0 subagent/manual tasks scoped to intake records
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- clients: Accepted client records (W1+)
-- tenant_id: LiNKaios tenant isolation column
-- RLS: Enabled with tenant isolation policies

-- matters: Legal matters scoped under clients
-- tenant_id: LiNKaios tenant isolation column
-- client_id: References lexos_clients(id)
-- RLS: Enabled with tenant and client-scoped policies
