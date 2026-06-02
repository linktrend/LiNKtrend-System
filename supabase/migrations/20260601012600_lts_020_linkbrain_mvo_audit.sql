-- LTS-020 (superseded layout): original migration targeted a greenfield audit_events
-- column model incompatible with live linkbrain.audit_events (migration 023 envelope).
-- Canonical apply path for LiNKtrend-AdminDB: 20260602120000_lts_020_linkbrain_mvo_audit_compat.sql
-- This file is intentionally a no-op so Supabase history stays ordered without DDL conflicts.

select 1;
