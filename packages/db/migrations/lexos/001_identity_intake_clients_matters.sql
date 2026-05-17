-- =============================================================================
-- WP-094: LEXOS Core Schema Migration 001 - Identity, Intake, Clients, Matters
-- Adapted from LiNKtrend-LEXOS for LiNKaios Vertical Plugin
-- Changes: Added tenant_id, lexos_ prefix, RLS policies for tenant isolation
-- =============================================================================

-- ---------------------------------------------------------------------------
-- §1.1 lexos_user_profiles
-- Stores app-specific role and display metadata; auth is in auth.users.
-- ADAPTED: Added tenant_id for multi-tenancy, prefixed with lexos_
-- ---------------------------------------------------------------------------
create table if not exists lexos_user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  tenant_id       uuid not null, -- LiNKaios tenant isolation
  email           text,
  display_name    text,
  role            text check (role in ('admin','operator','reviewer','read_only','system_agent')),
  status          text check (status in ('active','inactive','suspended')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_lexos_user_profiles_tenant_id on lexos_user_profiles(tenant_id);
create index if not exists idx_lexos_user_profiles_role       on lexos_user_profiles(role);
create index if not exists idx_lexos_user_profiles_status     on lexos_user_profiles(status);
create index if not exists idx_lexos_user_profiles_email       on lexos_user_profiles(email);

-- Enable RLS
alter table lexos_user_profiles enable row level security;

-- RLS Policy: Users can only see profiles in their tenant
create policy lexos_user_profiles_tenant_isolation
  on lexos_user_profiles
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.2 lexos_intake_records
-- W0 intake workflow records. Not persistent W1 client memory until accepted.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_intake_records (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null, -- LiNKaios tenant isolation
  intake_type                 text,
  intake_status               text check (intake_status in (
                                'new','in_progress','waiting_for_information',
                                'conflict_check_pending','kyc_pending',
                                'engagement_pending','lead_attorney_review',
                                'accepted','rejected','abandoned','archived')),
  source                      text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  created_by                  uuid references lexos_user_profiles(id),
  updated_by                  uuid references lexos_user_profiles(id),
  assigned_operator           uuid references lexos_user_profiles(id),
  urgency_level               text,
  conflict_status             text check (conflict_status in (
                                'unknown','pending','clear','potential_conflict',
                                'conflict_identified','waiver_required','blocked')),
  kyc_status                  text check (kyc_status in (
                                'unknown','not_required','pending','in_progress',
                                'passed','failed','requires_review')),
  engagement_status           text check (engagement_status in (
                                'not_started','pending','sent','signed',
                                'declined','not_required','blocked')),
  lead_attorney_review_status text,
  handoff_status              text,
  accepted_at                 timestamptz,
  rejected_at                 timestamptz,
  abandoned_at                timestamptz,
  notes                       text,
  metadata                    jsonb
);

create index if not exists idx_lexos_intake_records_tenant_id       on lexos_intake_records(tenant_id);
create index if not exists idx_lexos_intake_records_intake_status   on lexos_intake_records(intake_status);
create index if not exists idx_lexos_intake_records_conflict_status on lexos_intake_records(conflict_status);
create index if not exists idx_lexos_intake_records_kyc_status      on lexos_intake_records(kyc_status);
create index if not exists idx_lexos_intake_records_engagement      on lexos_intake_records(engagement_status);
create index if not exists idx_lexos_intake_records_assigned        on lexos_intake_records(assigned_operator);
create index if not exists idx_lexos_intake_records_created_at      on lexos_intake_records(created_at);

-- Enable RLS
alter table lexos_intake_records enable row level security;

-- RLS Policy: Tenant isolation for intake records
create policy lexos_intake_records_tenant_isolation
  on lexos_intake_records
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.3 lexos_intake_groups
-- Related prospective clients in the same onboarding group.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_intake_groups (
  id                              uuid primary key default gen_random_uuid(),
  tenant_id                       uuid not null, -- LiNKaios tenant isolation
  intake_id                       uuid references lexos_intake_records(id),
  relationship_type               text,
  shared_matter_candidate_id      uuid, -- FK added after lexos_matter_candidates is created
  joint_representation_flag       boolean default false,
  potential_internal_conflict_flag boolean default false,
  group_conflict_status           text,
  group_consent_status            text,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  created_by                      uuid references lexos_user_profiles(id),
  updated_by                      uuid references lexos_user_profiles(id),
  notes                           text,
  metadata                        jsonb
);

create index if not exists idx_lexos_intake_groups_tenant_id        on lexos_intake_groups(tenant_id);
create index if not exists idx_lexos_intake_groups_intake_id        on lexos_intake_groups(intake_id);
create index if not exists idx_lexos_intake_groups_joint_rep        on lexos_intake_groups(joint_representation_flag);
create index if not exists idx_lexos_intake_groups_internal_conflict on lexos_intake_groups(potential_internal_conflict_flag);
create index if not exists idx_lexos_intake_groups_conflict_status  on lexos_intake_groups(group_conflict_status);

-- Enable RLS
alter table lexos_intake_groups enable row level security;

-- RLS Policy: Tenant isolation for intake groups
create policy lexos_intake_groups_tenant_isolation
  on lexos_intake_groups
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.4 lexos_client_candidates
-- Prospective clients during W0 intake (not accepted W1 clients).
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_client_candidates (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null, -- LiNKaios tenant isolation
  intake_id             uuid references lexos_intake_records(id),
  intake_group_id       uuid references lexos_intake_groups(id),
  name                  text,
  client_type           text,
  contact_details       jsonb,
  identity_status       text,
  kyc_status            text check (kyc_status in (
                          'unknown','not_required','pending','in_progress',
                          'passed','failed','requires_review')),
  conflict_status       text check (conflict_status in (
                          'unknown','pending','clear','potential_conflict',
                          'conflict_identified','waiver_required','blocked')),
  authority_status      text,
  representative_status text,
  engagement_status     text check (engagement_status in (
                          'not_started','pending','sent','signed',
                          'declined','not_required','blocked')),
  consent_status        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references lexos_user_profiles(id),
  updated_by            uuid references lexos_user_profiles(id),
  notes                 text,
  metadata              jsonb
);

create index if not exists idx_lexos_client_candidates_tenant_id       on lexos_client_candidates(tenant_id);
create index if not exists idx_lexos_client_candidates_intake_id       on lexos_client_candidates(intake_id);
create index if not exists idx_lexos_client_candidates_intake_group_id on lexos_client_candidates(intake_group_id);
create index if not exists idx_lexos_client_candidates_name            on lexos_client_candidates(name);
create index if not exists idx_lexos_client_candidates_client_type     on lexos_client_candidates(client_type);
create index if not exists idx_lexos_client_candidates_kyc_status      on lexos_client_candidates(kyc_status);
create index if not exists idx_lexos_client_candidates_conflict_status on lexos_client_candidates(conflict_status);
create index if not exists idx_lexos_client_candidates_engagement      on lexos_client_candidates(engagement_status);

-- Enable RLS
alter table lexos_client_candidates enable row level security;

-- RLS Policy: Tenant isolation for client candidates
create policy lexos_client_candidates_tenant_isolation
  on lexos_client_candidates
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.5 lexos_matter_candidates
-- Candidate matters during W0 intake.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_matter_candidates (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null, -- LiNKaios tenant isolation
  intake_id             uuid references lexos_intake_records(id),
  intake_group_id       uuid references lexos_intake_groups(id),
  proposed_matter_name  text,
  matter_type           text,
  posture               text check (posture in (
                          'plaintiff','defence','defense','regulatory',
                          'criminal_defence','commercial_dispute','advisory','internal','unknown')),
  jurisdiction          text,
  adverse_parties       jsonb,
  related_parties       jsonb,
  deadline_flags        jsonb,
  urgency_level         text,
  engagement_status     text check (engagement_status in (
                          'not_started','pending','sent','signed',
                          'declined','not_required','blocked')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  created_by            uuid references lexos_user_profiles(id),
  updated_by            uuid references lexos_user_profiles(id),
  notes                 text,
  metadata              jsonb
);

create index if not exists idx_lexos_matter_candidates_tenant_id       on lexos_matter_candidates(tenant_id);
create index if not exists idx_lexos_matter_candidates_intake_id       on lexos_matter_candidates(intake_id);
create index if not exists idx_lexos_matter_candidates_intake_group_id on lexos_matter_candidates(intake_group_id);
create index if not exists idx_lexos_matter_candidates_posture         on lexos_matter_candidates(posture);
create index if not exists idx_lexos_matter_candidates_jurisdiction    on lexos_matter_candidates(jurisdiction);
create index if not exists idx_lexos_matter_candidates_urgency         on lexos_matter_candidates(urgency_level);
create index if not exists idx_lexos_matter_candidates_engagement      on lexos_matter_candidates(engagement_status);

-- Enable RLS
alter table lexos_matter_candidates enable row level security;

-- RLS Policy: Tenant isolation for matter candidates
create policy lexos_matter_candidates_tenant_isolation
  on lexos_matter_candidates
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- shared_matter_candidate_id self-FK: added after table creation to avoid forward-reference
alter table lexos_intake_groups
  add constraint fk_lexos_intake_groups_shared_matter_candidate
  foreign key (shared_matter_candidate_id)
  references lexos_matter_candidates(id);

-- ---------------------------------------------------------------------------
-- §1.6 lexos_intake_tasks
-- W0 subagent/manual tasks scoped to intake records.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- NOTE: risk_id FK deferred to migration 003 (risks table)
-- ---------------------------------------------------------------------------
create table if not exists lexos_intake_tasks (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null, -- LiNKaios tenant isolation
  intake_id             uuid references lexos_intake_records(id),
  intake_group_id       uuid references lexos_intake_groups(id),
  client_candidate_id   uuid references lexos_client_candidates(id),
  matter_candidate_id   uuid references lexos_matter_candidates(id),
  assigned_agent        text,
  assigned_user_id      uuid references lexos_user_profiles(id),
  task_type             text,
  status                text check (status in (
                          'queued','running','completed','failed','cancelled','needs_review')),
  result_summary        text,
  risk_id               uuid, -- FK to lexos_risks added in migration 003
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  due_at                timestamptz,
  completed_at          timestamptz,
  metadata              jsonb
);

create index if not exists idx_lexos_intake_tasks_tenant_id            on lexos_intake_tasks(tenant_id);
create index if not exists idx_lexos_intake_tasks_intake_id            on lexos_intake_tasks(intake_id);
create index if not exists idx_lexos_intake_tasks_intake_group_id      on lexos_intake_tasks(intake_group_id);
create index if not exists idx_lexos_intake_tasks_client_candidate_id on lexos_intake_tasks(client_candidate_id);
create index if not exists idx_lexos_intake_tasks_matter_candidate_id on lexos_intake_tasks(matter_candidate_id);
create index if not exists idx_lexos_intake_tasks_assigned_agent       on lexos_intake_tasks(assigned_agent);
create index if not exists idx_lexos_intake_tasks_assigned_user_id     on lexos_intake_tasks(assigned_user_id);
create index if not exists idx_lexos_intake_tasks_task_type            on lexos_intake_tasks(task_type);
create index if not exists idx_lexos_intake_tasks_status               on lexos_intake_tasks(status);
create index if not exists idx_lexos_intake_tasks_due_at               on lexos_intake_tasks(due_at);

-- Enable RLS
alter table lexos_intake_tasks enable row level security;

-- RLS Policy: Tenant isolation for intake tasks
create policy lexos_intake_tasks_tenant_isolation
  on lexos_intake_tasks
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.7 lexos_clients
-- Accepted client records. Created only after intake acceptance.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_clients (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null, -- LiNKaios tenant isolation
  client_name             text not null,
  client_type             text,
  primary_contact         jsonb,
  jurisdiction            text,
  status                  text check (status in ('active','inactive','archived','blocked')),
  client_master_story     text,
  created_from_intake_id  uuid references lexos_intake_records(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  created_by              uuid references lexos_user_profiles(id),
  updated_by              uuid references lexos_user_profiles(id),
  confidentiality_status  text check (confidentiality_status in (
                            'unknown','public','internal','confidential',
                            'highly_confidential','restricted')),
  privilege_status        text check (privilege_status in (
                            'unknown','not_privileged','potentially_privileged',
                            'privileged','work_product','restricted')),
  notes                   text,
  metadata                jsonb
);

create index if not exists idx_lexos_clients_tenant_id         on lexos_clients(tenant_id);
create index if not exists idx_lexos_clients_client_name       on lexos_clients(client_name);
create index if not exists idx_lexos_clients_client_type       on lexos_clients(client_type);
create index if not exists idx_lexos_clients_status            on lexos_clients(status);
create index if not exists idx_lexos_clients_created_from_intake on lexos_clients(created_from_intake_id);

-- Enable RLS
alter table lexos_clients enable row level security;

-- RLS Policy: Tenant isolation for clients
create policy lexos_clients_tenant_isolation
  on lexos_clients
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- ---------------------------------------------------------------------------
-- §1.8 lexos_matters
-- Legal matters scoped under clients.
-- Matter scope controls retrieval, workflow, agents, evidence, and artifacts.
-- ADAPTED: Added tenant_id, prefixed with lexos_, FK references updated
-- ---------------------------------------------------------------------------
create table if not exists lexos_matters (
  id                              uuid primary key default gen_random_uuid(),
  tenant_id                       uuid not null, -- LiNKaios tenant isolation
  client_id                       uuid not null references lexos_clients(id),
  matter_name                     text not null,
  matter_type                     text,
  posture                         text check (posture in (
                                    'plaintiff','defence','defense','regulatory',
                                    'criminal_defence','commercial_dispute','advisory','internal','unknown')),
  jurisdiction                    text,
  status                          text check (status in (
                                    'draft','active','paused','blocked',
                                    'under_review','closed','archived')),
  current_workflow                text check (current_workflow in (
                                    'W0','W1','W2','W3','W4','W5','W6',
                                    'W7','W8','W9','W10','W11')),
  created_from_intake_id          uuid references lexos_intake_records(id),
  created_from_matter_candidate_id uuid references lexos_matter_candidates(id),
  opened_at                       timestamptz,
  closed_at                       timestamptz,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),
  created_by                      uuid references lexos_user_profiles(id),
  updated_by                      uuid references lexos_user_profiles(id),
  confidentiality_status          text check (confidentiality_status in (
                                    'unknown','public','internal','confidential',
                                    'highly_confidential','restricted')),
  privilege_status                text check (privilege_status in (
                                    'unknown','not_privileged','potentially_privileged',
                                    'privileged','work_product','restricted')),
  notes                           text,
  metadata                        jsonb
);

create index if not exists idx_lexos_matters_tenant_id              on lexos_matters(tenant_id);
create index if not exists idx_lexos_matters_client_id            on lexos_matters(client_id);
create index if not exists idx_lexos_matters_matter_name          on lexos_matters(matter_name);
create index if not exists idx_lexos_matters_posture               on lexos_matters(posture);
create index if not exists idx_lexos_matters_jurisdiction          on lexos_matters(jurisdiction);
create index if not exists idx_lexos_matters_status                on lexos_matters(status);
create index if not exists idx_lexos_matters_current_workflow     on lexos_matters(current_workflow);
create index if not exists idx_lexos_matters_created_from_intake   on lexos_matters(created_from_intake_id);

-- Enable RLS
alter table lexos_matters enable row level security;

-- RLS Policy: Tenant isolation for matters
create policy lexos_matters_tenant_isolation
  on lexos_matters
  for all
  using (tenant_id = (select current_setting('app.current_tenant_id', true)::uuid));

-- Composite policy: Matters are also scoped to their client
-- This provides additional security layer for matter-level data access
create policy lexos_matters_client_scoped
  on lexos_matters
  for all
  using (
    tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    and client_id in (
      select id from lexos_clients
      where tenant_id = (select current_setting('app.current_tenant_id', true)::uuid)
    )
  );
