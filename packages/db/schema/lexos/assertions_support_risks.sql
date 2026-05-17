-- =============================================================================
-- WP-094: LEXOS Core Schema - Case Stories, Assertions, Support Matrix, Risks (Current State)
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- =============================================================================

-- case_stories: W2 Case Story artifacts — structured narrative, not a chat transcript
-- tenant_id: LiNKaios tenant isolation column
-- client_id, matter_id: Business scope references
-- RLS: Enabled with tenant and matter-scoped policies

-- assertions: Atomic factual/legal assertions. Must have truth_state and support_state.
-- tenant_id: LiNKaios tenant isolation column
-- client_id, matter_id: Business scope references
-- case_story_id: References lexos_case_stories(id)
-- RLS: Enabled with tenant and matter-scoped policies
-- NOTE: Client narrative assertions are not verified facts

-- support_matrix_items: Links assertions to evidence and support reasoning (W5 core table)
-- tenant_id: LiNKaios tenant isolation column
-- assertion_id: References lexos_assertions(id) - NOT NULL
-- evidence_id: References lexos_evidence(id)
-- extraction_id: References lexos_evidence_extractions(id)
-- RLS: Enabled with tenant, matter-scoped, and quality-aware policies
-- NOTE: QA-flagged or failed extraction must not be treated as reliable support

-- risks: Legal, factual, evidentiary, workflow, security, and operational risks
-- tenant_id: LiNKaios tenant isolation column
-- client_id, matter_id: Business scope references (nullable for global risks)
-- RLS: Enabled with tenant and matter-scoped policies
