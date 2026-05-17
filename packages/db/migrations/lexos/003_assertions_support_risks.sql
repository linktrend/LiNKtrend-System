-- =============================================================================
-- WP-094: LEXOS Core Schema Migration 003 - Case Stories, Assertions, Support Matrix, Risks
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- Changes: Added tenant_id, lexos_ prefix, RLS policies for tenant isolation
-- =============================================================================

-- ---------------------------------------------------------------------------
-- §3.1 lexos_case_stories
-- W2 Case Story artifacts — structured narrative, not a chat transcript.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_case_stories (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid not null references lexos_clients(id),
  matter_id              uuid not null references lexos_matters(id),
  title                  text,
  content_markdown       text,
  version                integer default 1,
  status                 text check (status in (
                           'draft','under_review','approved_internal',
                           'final_internal','superseded','archived')),
  workflow_origin        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  created_by             uuid references lexos_user_profiles(id),
  updated_by             uuid references lexos_user_profiles(id),
  model_used             text,
  prompt_version         text,
  confidentiality_status text check (confidentiality_status in (
                           'unknown','public','internal','confidential',
                           'highly_confidential','restricted')),
  privilege_status       text check (privilege_status in (
                           'unknown','not_privileged','potentially_privileged',
                           'privileged','work_product','restricted')),
  notes                  text,
  metadata               jsonb
);

create index if not exists idx_lexos_case_stories_tenant_id        on lexos_case_stories(tenant_id);
create index if not exists idx_lexos_case_stories_client_id        on lexos_case_stories(client_id);
create index if not exists idx_lexos_case_stories_matter_id        on lexos_case_stories(matter_id);
create index if not exists idx_lexos_case_stories_status            on lexos_case_stories(status);
create index if not exists idx_lexos_case_stories_version          on lexos_case_stories(version);
create index if not exists idx_lexos_case_stories_workflow_origin   on lexos_case_stories(workflow_origin);
create index if not exists idx_lexos_case_stories_created_at        on lexos_case_stories(created_at);

-- Enable RLS
alter table lexos_case_stories enable row level security;

-- RLS Policy: Tenant isolation for case stories
create policy lexos_case_stories_tenant_isolation
  on lexos_case_stories
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Case stories scoped to matter/client
create policy lexos_case_stories_matter_scoped
  on lexos_case_stories
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and matter_id in (
      select id from lexos_matters
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- ---------------------------------------------------------------------------
-- §3.2 lexos_assertions
-- Atomic factual/legal assertions. Must have truth_state and support_state.
-- Client narrative assertions are not verified facts.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_assertions (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid not null references lexos_clients(id),
  matter_id              uuid not null references lexos_matters(id),
  case_story_id          uuid references lexos_case_stories(id),
  assertion_text         text not null,
  assertion_type         text,
  truth_state            text check (truth_state in (
                           'verified','client_confirmed','opposing_party_alleged',
                           'partially_supported','pending_verification',
                           'unsupported','contradicted','rejected','superseded')),
  support_state          text check (support_state in (
                           'supported','partially_supported','unsupported',
                           'contradicted','pending')),
  use_status             text check (use_status in (
                           'usable','use_with_caution','do_not_use',
                           'pending_review','superseded')),
  contradiction_flag     boolean default false,
  confidence             numeric,
  source_ids             jsonb,
  evidence_ids           jsonb,
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

create index if not exists idx_lexos_assertions_tenant_id         on lexos_assertions(tenant_id);
create index if not exists idx_lexos_assertions_client_id         on lexos_assertions(client_id);
create index if not exists idx_lexos_assertions_matter_id         on lexos_assertions(matter_id);
create index if not exists idx_lexos_assertions_case_story_id     on lexos_assertions(case_story_id);
create index if not exists idx_lexos_assertions_truth_state       on lexos_assertions(truth_state);
create index if not exists idx_lexos_assertions_support_state     on lexos_assertions(support_state);
create index if not exists idx_lexos_assertions_use_status        on lexos_assertions(use_status);
create index if not exists idx_lexos_assertions_contradiction     on lexos_assertions(contradiction_flag);
create index if not exists idx_lexos_assertions_created_at        on lexos_assertions(created_at);

-- Enable RLS
alter table lexos_assertions enable row level security;

-- RLS Policy: Tenant isolation for assertions
create policy lexos_assertions_tenant_isolation
  on lexos_assertions
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Assertions scoped to matter/client
create policy lexos_assertions_matter_scoped
  on lexos_assertions
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and matter_id in (
      select id from lexos_matters
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- ---------------------------------------------------------------------------
-- §3.3 lexos_support_matrix_items
-- Links assertions to evidence and support reasoning (W5 core table).
-- QA-flagged or failed extraction must not be treated as reliable support
-- without a visible caveat.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_support_matrix_items (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid not null references lexos_clients(id),
  matter_id              uuid not null references lexos_matters(id),
  assertion_id           uuid not null references lexos_assertions(id),
  evidence_id            uuid references lexos_evidence(id),
  extraction_id          uuid references lexos_evidence_extractions(id),
  support_state          text check (support_state in (
                           'supported','partially_supported','unsupported',
                           'contradicted','pending')),
  support_explanation    text,
  evidence_excerpt       text,
  page_reference         text,
  timecode_reference     text,
  frame_reference        text,
  risk_level             text check (risk_level in ('low','moderate','high','critical')),
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

create index if not exists idx_lexos_support_matrix_tenant_id     on lexos_support_matrix_items(tenant_id);
create index if not exists idx_lexos_support_matrix_client_id     on lexos_support_matrix_items(client_id);
create index if not exists idx_lexos_support_matrix_matter_id     on lexos_support_matrix_items(matter_id);
create index if not exists idx_lexos_support_matrix_assertion_id  on lexos_support_matrix_items(assertion_id);
create index if not exists idx_lexos_support_matrix_evidence_id   on lexos_support_matrix_items(evidence_id);
create index if not exists idx_lexos_support_matrix_extraction_id on lexos_support_matrix_items(extraction_id);
create index if not exists idx_lexos_support_matrix_support_state on lexos_support_matrix_items(support_state);
create index if not exists idx_lexos_support_matrix_risk_level    on lexos_support_matrix_items(risk_level);

-- Enable RLS
alter table lexos_support_matrix_items enable row level security;

-- RLS Policy: Tenant isolation for support matrix items
create policy lexos_support_matrix_items_tenant_isolation
  on lexos_support_matrix_items
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Support matrix scoped to matter/client/assertion
create policy lexos_support_matrix_items_matter_scoped
  on lexos_support_matrix_items
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and matter_id in (
      select id from lexos_matters
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );

-- Quality-aware policy: Flag items linked to QA-flagged extractions
create policy lexos_support_matrix_items_quality_aware
  on lexos_support_matrix_items
  for select
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and (
      extraction_id is null
      or extraction_id in (
        select id from lexos_evidence_extractions
        where extraction_quality_status = 'accepted'
        or human_review_required = false
      )
    )
  );

-- ---------------------------------------------------------------------------
-- §3.4 lexos_risks
-- Legal, factual, evidentiary, workflow, security, and operational risks.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_risks (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null, -- LiNKaios tenant isolation
  client_id              uuid references lexos_clients(id),
  matter_id              uuid references lexos_matters(id),
  risk_title             text,
  risk_type              text,
  severity               text check (severity in ('low','moderate','high','critical')),
  status                 text check (status in (
                           'open','mitigated','accepted','closed','superseded')),
  linked_object_type     text,
  linked_object_id       uuid,
  description            text,
  mitigation             text,
  owner_user_id          uuid references lexos_user_profiles(id),
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

create index if not exists idx_lexos_risks_tenant_id           on lexos_risks(tenant_id);
create index if not exists idx_lexos_risks_client_id           on lexos_risks(client_id);
create index if not exists idx_lexos_risks_matter_id           on lexos_risks(matter_id);
create index if not exists idx_lexos_risks_severity            on lexos_risks(severity);
create index if not exists idx_lexos_risks_status              on lexos_risks(status);
create index if not exists idx_lexos_risks_risk_type           on lexos_risks(risk_type);
create index if not exists idx_lexos_risks_linked_object_type  on lexos_risks(linked_object_type);
create index if not exists idx_lexos_risks_linked_object_id    on lexos_risks(linked_object_id);
create index if not exists idx_lexos_risks_owner_user_id       on lexos_risks(owner_user_id);
create index if not exists idx_lexos_risks_created_at          on lexos_risks(created_at);

-- Enable RLS
alter table lexos_risks enable row level security;

-- RLS Policy: Tenant isolation for risks
create policy lexos_risks_tenant_isolation
  on lexos_risks
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Risks scoped to matter/client when linked
create policy lexos_risks_matter_scoped
  on lexos_risks
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and (
      matter_id is null
      or matter_id in (
        select id from lexos_matters
        where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
      )
    )
  );

-- ---------------------------------------------------------------------------
-- §3.5 Deferred FK from migration 001: lexos_intake_tasks.risk_id
-- ADAPTED: Added after lexos_risks table creation
-- ---------------------------------------------------------------------------
alter table lexos_intake_tasks
  add constraint fk_lexos_intake_tasks_risk_id
  foreign key (risk_id)
  references lexos_risks(id);
