-- LTS-020: LiNKbrain MVO audit envelope and memory write path.
-- The migration is dependency-light so it can land in the first execution wave;
-- later kernel migrations may add foreign keys once tenant/project tables stabilize.

create extension if not exists pgcrypto;

create schema if not exists linkbrain;

create or replace function linkbrain.jwt_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id'),
    ''
  )::uuid;
$$;

create table if not exists linkbrain.audit_events (
  event_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  event_type text not null,
  event_version text not null default '1.0.0',
  emitted_at timestamptz not null default now(),
  actor_kind text not null check (actor_kind in ('user', 'bot', 'system', 'workflow', 'automation')),
  actor_id text not null,
  actor_role_id text,
  target_kind text not null,
  target_id text not null,
  run_id uuid,
  stage_id text,
  lease_id uuid,
  workflow_run_id text,
  capability_id text,
  project_id text,
  suite_id text,
  module_id text,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  refs jsonb not null default '{}'::jsonb check (jsonb_typeof(refs) = 'object'),
  integrity_hash text not null,
  integrity_algorithm text not null default 'sha256' check (integrity_algorithm = 'sha256'),
  created_at timestamptz not null default now(),
  check (
    event_type = any (array[
      'run.started',
      'run.completed',
      'run.failed',
      'run.cancelled',
      'stage.started',
      'stage.completed',
      'stage.failed',
      'stage.awaiting_approval',
      'lease.requested',
      'lease.granted',
      'lease.executed',
      'lease.denied',
      'lease.expired',
      'workflow.invoked',
      'workflow.completed',
      'workflow.failed',
      'memory.proposed',
      'memory.accepted',
      'memory.rejected'
    ])
  )
);

create index if not exists audit_events_tenant_run_idx
  on linkbrain.audit_events (tenant_id, run_id, emitted_at);

create index if not exists audit_events_tenant_stage_idx
  on linkbrain.audit_events (tenant_id, run_id, stage_id, emitted_at)
  where stage_id is not null;

create index if not exists audit_events_tenant_type_idx
  on linkbrain.audit_events (tenant_id, event_type, emitted_at);

create unique index if not exists audit_events_idempotency_idx
  on linkbrain.audit_events (
    tenant_id,
    event_type,
    coalesce(run_id::text, ''),
    coalesce(payload ->> 'idempotency_key', '')
  )
  where payload ? 'idempotency_key';

create table if not exists linkbrain.memory_objects (
  memory_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  memory_type text not null check (
    memory_type in (
      'linksites_run_artifact',
      'linksites_accepted_knowledge'
    )
  ),
  status text not null default 'accepted' check (status in ('proposed', 'accepted', 'rejected')),
  run_id uuid not null,
  stage_id text,
  source_event_id uuid references linkbrain.audit_events(event_id) on delete set null,
  accepted_event_id uuid references linkbrain.audit_events(event_id) on delete set null,
  artifact_ref text,
  knowledge_ref text,
  summary text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  provenance_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(provenance_refs) = 'array'),
  accepted_by text,
  accepted_at timestamptz,
  integrity_hash text not null,
  integrity_algorithm text not null default 'sha256' check (integrity_algorithm = 'sha256'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (memory_type = 'linksites_run_artifact' and artifact_ref is not null)
    or (memory_type = 'linksites_accepted_knowledge' and knowledge_ref is not null)
  )
);

create index if not exists memory_objects_tenant_run_idx
  on linkbrain.memory_objects (tenant_id, run_id, created_at);

create index if not exists memory_objects_tenant_type_idx
  on linkbrain.memory_objects (tenant_id, memory_type, status, created_at);

create or replace function linkbrain.sha256_text(material text)
returns text
language sql
immutable
as $$
  select encode(digest(coalesce(material, ''), 'sha256'), 'hex');
$$;

create or replace function linkbrain.assert_mvo_audit_event(
  p_event_type text,
  p_run_id uuid,
  p_stage_id text,
  p_lease_id uuid,
  p_workflow_run_id text,
  p_capability_id text,
  p_payload jsonb
)
returns void
language plpgsql
stable
as $$
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a JSON object';
  end if;

  if p_event_type is null or p_event_type = '' then
    raise exception 'event_type is required';
  end if;

  if p_event_type like 'run.%'
    or p_event_type like 'stage.%'
    or p_event_type like 'lease.%'
    or p_event_type like 'workflow.%'
    or p_event_type like 'memory.%'
  then
    if p_run_id is null then
      raise exception 'run_id is required for %', p_event_type;
    end if;
  end if;

  if p_event_type like 'stage.%' and nullif(p_stage_id, '') is null then
    raise exception 'stage_id is required for %', p_event_type;
  end if;

  if p_event_type in ('lease.requested', 'lease.denied') and nullif(p_capability_id, '') is null then
    raise exception 'capability_id is required for %', p_event_type;
  end if;

  if p_event_type in ('lease.granted', 'lease.executed', 'lease.expired') then
    if p_lease_id is null then
      raise exception 'lease_id is required for %', p_event_type;
    end if;
    if nullif(p_capability_id, '') is null then
      raise exception 'capability_id is required for %', p_event_type;
    end if;
  end if;

  if p_event_type like 'workflow.%' and nullif(p_workflow_run_id, '') is null then
    raise exception 'workflow_run_id is required for %', p_event_type;
  end if;

  if p_event_type = 'memory.accepted' then
    if not (p_payload ? 'memory_type') then
      raise exception 'memory.accepted payload requires memory_type';
    end if;
    if not (p_payload ? 'accepted_ref') then
      raise exception 'memory.accepted payload requires accepted_ref';
    end if;
  end if;
end;
$$;

create or replace function linkbrain.record_mvo_audit_event(
  p_tenant_id uuid,
  p_event_type text,
  p_actor_kind text,
  p_actor_id text,
  p_target_kind text,
  p_target_id text,
  p_payload jsonb default '{}'::jsonb,
  p_run_id uuid default null,
  p_stage_id text default null,
  p_lease_id uuid default null,
  p_workflow_run_id text default null,
  p_capability_id text default null,
  p_project_id text default null,
  p_suite_id text default 'linksites',
  p_module_id text default 'websitefactory',
  p_actor_role_id text default null,
  p_emitted_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = linkbrain, public
as $$
declare
  v_event_id uuid;
  v_refs jsonb;
  v_hash text;
begin
  perform linkbrain.assert_mvo_audit_event(
    p_event_type,
    p_run_id,
    p_stage_id,
    p_lease_id,
    p_workflow_run_id,
    p_capability_id,
    coalesce(p_payload, '{}'::jsonb)
  );

  v_refs := jsonb_strip_nulls(jsonb_build_object(
    'run_id', p_run_id,
    'stage_id', nullif(p_stage_id, ''),
    'lease_id', p_lease_id,
    'workflow_run_id', nullif(p_workflow_run_id, ''),
    'capability_id', nullif(p_capability_id, ''),
    'project_id', nullif(p_project_id, ''),
    'suite_id', nullif(p_suite_id, ''),
    'module_id', nullif(p_module_id, '')
  ));

  v_hash := linkbrain.sha256_text(concat_ws(
    ':',
    p_tenant_id::text,
    p_event_type,
    coalesce(p_run_id::text, ''),
    coalesce(p_stage_id, ''),
    coalesce(p_payload, '{}'::jsonb)::text,
    v_refs::text
  ));

  insert into linkbrain.audit_events (
    tenant_id,
    event_type,
    emitted_at,
    actor_kind,
    actor_id,
    actor_role_id,
    target_kind,
    target_id,
    run_id,
    stage_id,
    lease_id,
    workflow_run_id,
    capability_id,
    project_id,
    suite_id,
    module_id,
    payload,
    refs,
    integrity_hash
  )
  values (
    p_tenant_id,
    p_event_type,
    coalesce(p_emitted_at, now()),
    p_actor_kind,
    p_actor_id,
    p_actor_role_id,
    p_target_kind,
    p_target_id,
    p_run_id,
    nullif(p_stage_id, ''),
    p_lease_id,
    nullif(p_workflow_run_id, ''),
    nullif(p_capability_id, ''),
    nullif(p_project_id, ''),
    nullif(p_suite_id, ''),
    nullif(p_module_id, ''),
    coalesce(p_payload, '{}'::jsonb),
    v_refs,
    v_hash
  )
  returning event_id into v_event_id;

  return v_event_id;
end;
$$;

create or replace function linkbrain.record_mvo_memory_object(
  p_tenant_id uuid,
  p_memory_type text,
  p_summary text,
  p_payload jsonb default '{}'::jsonb,
  p_run_id uuid default null,
  p_stage_id text default null,
  p_source_event_id uuid default null,
  p_artifact_ref text default null,
  p_knowledge_ref text default null,
  p_accepted_by text default null,
  p_provenance_refs jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = linkbrain, public
as $$
declare
  v_memory_id uuid := gen_random_uuid();
  v_accepted_ref text;
  v_accepted_event_id uuid;
  v_hash text;
begin
  if p_run_id is null then
    raise exception 'run_id is required for memory writes';
  end if;

  if p_summary is null or p_summary = '' then
    raise exception 'summary is required for memory writes';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a JSON object';
  end if;

  if p_provenance_refs is null or jsonb_typeof(p_provenance_refs) <> 'array' then
    raise exception 'provenance_refs must be a JSON array';
  end if;

  if p_memory_type = 'linksites_run_artifact' then
    if nullif(p_artifact_ref, '') is null then
      raise exception 'artifact_ref is required for linksites_run_artifact';
    end if;
    v_accepted_ref := p_artifact_ref;
  elsif p_memory_type = 'linksites_accepted_knowledge' then
    if nullif(p_knowledge_ref, '') is null then
      raise exception 'knowledge_ref is required for linksites_accepted_knowledge';
    end if;
    v_accepted_ref := p_knowledge_ref;
  else
    raise exception 'unsupported memory_type: %', p_memory_type;
  end if;

  v_accepted_event_id := linkbrain.record_mvo_audit_event(
    p_tenant_id => p_tenant_id,
    p_event_type => 'memory.accepted',
    p_actor_kind => 'system',
    p_actor_id => 'linkbrain.librarian',
    p_target_kind => 'memory_object',
    p_target_id => v_memory_id::text,
    p_payload => jsonb_build_object(
      'memory_type', p_memory_type,
      'accepted_ref', v_accepted_ref,
      'accepted_by', coalesce(p_accepted_by, 'policy:mvo-auto-accept'),
      'provenance_refs', p_provenance_refs,
      'summary', p_summary
    ),
    p_run_id => p_run_id,
    p_stage_id => p_stage_id,
    p_suite_id => 'linksites',
    p_module_id => 'websitefactory'
  );

  v_hash := linkbrain.sha256_text(concat_ws(
    ':',
    p_tenant_id::text,
    p_memory_type,
    p_run_id::text,
    coalesce(p_stage_id, ''),
    coalesce(v_accepted_ref, ''),
    p_payload::text,
    p_provenance_refs::text
  ));

  insert into linkbrain.memory_objects (
    memory_id,
    tenant_id,
    memory_type,
    status,
    run_id,
    stage_id,
    source_event_id,
    accepted_event_id,
    artifact_ref,
    knowledge_ref,
    summary,
    payload,
    provenance_refs,
    accepted_by,
    accepted_at,
    integrity_hash
  )
  values (
    v_memory_id,
    p_tenant_id,
    p_memory_type,
    'accepted',
    p_run_id,
    nullif(p_stage_id, ''),
    p_source_event_id,
    v_accepted_event_id,
    nullif(p_artifact_ref, ''),
    nullif(p_knowledge_ref, ''),
    p_summary,
    p_payload,
    p_provenance_refs,
    coalesce(p_accepted_by, 'policy:mvo-auto-accept'),
    now(),
    v_hash
  );

  return v_memory_id;
end;
$$;

alter table linkbrain.audit_events enable row level security;
alter table linkbrain.memory_objects enable row level security;

drop policy if exists audit_events_tenant_select on linkbrain.audit_events;
create policy audit_events_tenant_select
  on linkbrain.audit_events
  for select
  using (tenant_id = linkbrain.jwt_tenant_id());

drop policy if exists memory_objects_tenant_select on linkbrain.memory_objects;
create policy memory_objects_tenant_select
  on linkbrain.memory_objects
  for select
  using (tenant_id = linkbrain.jwt_tenant_id());

grant usage on schema linkbrain to authenticated, service_role;
grant select on linkbrain.audit_events to authenticated, service_role;
grant select on linkbrain.memory_objects to authenticated, service_role;
grant execute on function linkbrain.record_mvo_audit_event(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz
) to authenticated, service_role;
grant execute on function linkbrain.record_mvo_memory_object(
  uuid,
  text,
  text,
  jsonb,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  jsonb
) to authenticated, service_role;

comment on table linkbrain.audit_events is
  'Tenant-scoped LiNKbrain audit envelopes for run, stage, lease, workflow, and memory lifecycle events.';

comment on table linkbrain.memory_objects is
  'Tenant-scoped accepted LinkSites run artifacts and knowledge objects with audit provenance.';

comment on function linkbrain.record_mvo_audit_event is
  'RPC write path for LTS-020 audit envelopes; callers should not insert audit_events directly.';

comment on function linkbrain.record_mvo_memory_object is
  'RPC write path that records an accepted memory object and its memory.accepted audit event.';
