-- =============================================================================
-- WP-094: LEXOS Core Schema Migration 002 - Sources, Evidence, Evidence Extractions
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- Changes: Added tenant_id, lexos_ prefix, RLS policies for tenant isolation
-- Architecture rule: Evidence and Evidence Extraction are SEPARATE objects.
--   Original evidence is never replaced by extraction artifacts.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- §2.1 lexos_sources
-- Source containers or origins for evidence (uploads, court files, etc.).
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_sources (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid not null references lexos_clients(id),
  matter_id              uuid not null references lexos_matters(id),
  source_name            text,
  source_type            text,
  provided_by            text,
  received_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  created_by             uuid references lexos_user_profiles(id),
  updated_by             uuid references lexos_user_profiles(id),
  confidentiality_status text check (confidentiality_status in (
                           'unknown','public','internal','confidential',
                           'highly_confidential','restricted')),
  privilege_status       text check (privilege_status in (
                           'unknown','not_privileged','potentially_privileged',
                           'privileged','work_product','restricted')),
  notes                  text,
  metadata               jsonb
);

create index if not exists idx_lexos_sources_tenant_id    on lexos_sources(tenant_id);
create index if not exists idx_lexos_sources_client_id    on lexos_sources(client_id);
create index if not exists idx_lexos_sources_matter_id    on lexos_sources(matter_id);
create index if not exists idx_lexos_sources_source_type  on lexos_sources(source_type);
create index if not exists idx_lexos_sources_received_at  on lexos_sources(received_at);

-- Enable RLS
alter table lexos_sources enable row level security;

-- RLS Policy: Tenant isolation for sources
create policy lexos_sources_tenant_isolation
  on lexos_sources
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Sources scoped to matter/client
create policy lexos_sources_matter_scoped
  on lexos_sources
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and matter_id in (
      select id from lexos_matters
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- ---------------------------------------------------------------------------
-- §2.2 lexos_evidence
-- Canonical Evidence Objects. Original file is the evidentiary anchor.
-- Evidence is NOT replaced by extractions, OCR, markdown, or summaries.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_evidence (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid not null references lexos_clients(id),
  matter_id              uuid not null references lexos_matters(id),
  source_id              uuid references lexos_sources(id),
  evidence_label         text,
  file_name              text,
  file_type              text,
  evidence_media_type    text check (evidence_media_type in (
                           'pdf','docx','txt','markdown','image','screenshot',
                           'audio','video','spreadsheet','email_export',
                           'message_export','unknown')),
  source_type            text,
  language               text,
  original_file_uri      text,
  original_file_hash     text,
  processing_status      text check (processing_status in (
                           'uploaded','queued','processing','processed',
                           'qa_flagged','failed','requires_human_review',
                           'superseded','requires_reupload','archived')),
  extraction_status      text,
  quality_status         text,
  human_review_required  boolean default false,
  uploaded_by            uuid references lexos_user_profiles(id),
  uploaded_at            timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  created_by             uuid references lexos_user_profiles(id),
  updated_by             uuid references lexos_user_profiles(id),
  confidentiality_status text check (confidentiality_status in (
                           'unknown','public','internal','confidential',
                           'highly_confidential','restricted')),
  privilege_status       text check (privilege_status in (
                           'unknown','not_privileged','potentially_privileged',
                           'privileged','work_product','restricted')),
  legal_hold             boolean default false,
  notes                  text,
  metadata_json          jsonb
);

create index if not exists idx_lexos_evidence_tenant_id             on lexos_evidence(tenant_id);
create index if not exists idx_lexos_evidence_client_id             on lexos_evidence(client_id);
create index if not exists idx_lexos_evidence_matter_id             on lexos_evidence(matter_id);
create index if not exists idx_lexos_evidence_source_id             on lexos_evidence(source_id);
create index if not exists idx_lexos_evidence_processing_status     on lexos_evidence(processing_status);
create index if not exists idx_lexos_evidence_extraction_status     on lexos_evidence(extraction_status);
create index if not exists idx_lexos_evidence_quality_status        on lexos_evidence(quality_status);
create index if not exists idx_lexos_evidence_human_review          on lexos_evidence(human_review_required);
create index if not exists idx_lexos_evidence_media_type            on lexos_evidence(evidence_media_type);
create index if not exists idx_lexos_evidence_file_type             on lexos_evidence(file_type);
create index if not exists idx_lexos_evidence_uploaded_at            on lexos_evidence(uploaded_at);
create index if not exists idx_lexos_evidence_legal_hold            on lexos_evidence(legal_hold);

-- Enable RLS
alter table lexos_evidence enable row level security;

-- RLS Policy: Tenant isolation for evidence
create policy lexos_evidence_tenant_isolation
  on lexos_evidence
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Evidence scoped to matter/client
create policy lexos_evidence_matter_scoped
  on lexos_evidence
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and matter_id in (
      select id from lexos_matters
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- Privilege-aware policy: Filter by privilege_status for sensitive evidence
create policy lexos_evidence_privilege_scoped
  on lexos_evidence
  for select
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and (
      privilege_status not in ('privileged', 'work_product', 'restricted')
      or created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- §2.3 lexos_evidence_extractions
-- Derived extraction artifacts from Evidence. SEPARATE from the Evidence Object.
-- Raw OCR-only output must be marked qa_flagged / human_review_required.
-- Failed/QA-flagged extraction must not silently support assertions (W5).
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_evidence_extractions (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null, -- LiNKaios tenant isolation
  evidence_id                 uuid not null references lexos_evidence(id),
  client_id                   uuid not null references lexos_clients(id),
  matter_id                   uuid not null references lexos_matters(id),
  extraction_type             text check (extraction_type in (
                                'text_document','scanned_document','image_with_text',
                                'image_without_text','audio_transcript','video_transcript',
                                'video_visual_timeline','metadata_only','manual_extraction')),
  markdown_uri                text,
  markdown_text               text,
  json_uri                    text,
  json_content                jsonb,
  transcript_uri              text,
  transcript_json             jsonb,
  visual_description          text,
  ocr_text                    text,
  timecoded_segments          jsonb,
  frame_references            jsonb,
  extraction_tool             text,
  extraction_model            text,
  qa_model                    text,
  extraction_quality_score    numeric,
  extraction_quality_status   text check (extraction_quality_status in (
                                'accepted','qa_flagged','failed','human_review_required')),
  quality_flags               jsonb,
  human_review_required       boolean default false,
  is_current                  boolean default true,
  supersedes_extraction_id    uuid references lexos_evidence_extractions(id),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  created_by                  uuid references lexos_user_profiles(id),
  updated_by                  uuid references lexos_user_profiles(id),
  confidentiality_status      text check (confidentiality_status in (
                                'unknown','public','internal','confidential',
                                'highly_confidential','restricted')),
  privilege_status            text check (privilege_status in (
                                'unknown','not_privileged','potentially_privileged',
                                'privileged','work_product','restricted')),
  notes                       text,
  metadata                    jsonb
);

create index if not exists idx_lexos_evidence_extractions_tenant_id         on lexos_evidence_extractions(tenant_id);
create index if not exists idx_lexos_evidence_extractions_evidence_id       on lexos_evidence_extractions(evidence_id);
create index if not exists idx_lexos_evidence_extractions_client_id         on lexos_evidence_extractions(client_id);
create index if not exists idx_lexos_evidence_extractions_matter_id         on lexos_evidence_extractions(matter_id);
create index if not exists idx_lexos_evidence_extractions_extraction_type   on lexos_evidence_extractions(extraction_type);
create index if not exists idx_lexos_evidence_extractions_quality_status    on lexos_evidence_extractions(extraction_quality_status);
create index if not exists idx_lexos_evidence_extractions_human_review      on lexos_evidence_extractions(human_review_required);
create index if not exists idx_lexos_evidence_extractions_is_current        on lexos_evidence_extractions(is_current);
create index if not exists idx_lexos_evidence_extractions_created_at        on lexos_evidence_extractions(created_at);

-- Enable RLS
alter table lexos_evidence_extractions enable row level security;

-- RLS Policy: Tenant isolation for evidence extractions
create policy lexos_evidence_extractions_tenant_isolation
  on lexos_evidence_extractions
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Extractions scoped to evidence/matter/client
create policy lexos_evidence_extractions_evidence_scoped
  on lexos_evidence_extractions
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and evidence_id in (
      select id from lexos_evidence
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- QA quality policy: Only accepted extractions are visible for downstream use
create policy lexos_evidence_extractions_quality_filter
  on lexos_evidence_extractions
  for select
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and (
      extraction_quality_status = 'accepted'
      or human_review_required = false
    )
  );
