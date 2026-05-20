-- =============================================================================
-- WP-094: LEXOS Core Schema - Sources, Evidence, Evidence Extractions (Current State)
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- Architecture rule: Evidence and Evidence Extraction are SEPARATE objects.
--   Original evidence is never replaced by extraction artifacts.
-- =============================================================================

-- sources: Source containers or origins for evidence (uploads, court files, etc.)
-- tenant_id: LiNKaios tenant isolation column
-- client_id, matter_id: Business scope references
-- RLS: Enabled with tenant and matter-scoped policies

-- evidence: Canonical Evidence Objects. Original file is the evidentiary anchor.
-- tenant_id: LiNKaios tenant isolation column
-- client_id, matter_id: Business scope references
-- source_id: References lexos_sources(id)
-- RLS: Enabled with tenant, matter-scoped, and privilege-aware policies

-- evidence_extractions: Derived extraction artifacts from Evidence.
-- tenant_id: LiNKaios tenant isolation column
-- evidence_id: References lexos_evidence(id) - NOT NULL
-- client_id, matter_id: Business scope references
-- RLS: Enabled with tenant, evidence-scoped, and quality-filter policies
-- NOTE: Raw OCR-only output must be marked qa_flagged / human_review_required
-- NOTE: Failed/QA-flagged extraction must not silently support assertions (W5)
