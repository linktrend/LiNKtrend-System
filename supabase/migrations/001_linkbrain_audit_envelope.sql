-- LTS-020: canonical LiNKbrain audit envelope and MVO memory proof surface.
-- Supabase-compatible Postgres migration. Side-effecting writes are exposed
-- through RPC functions so callers do not write tenant audit tables directly.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists linkbrain;

create or replace function linkbrain.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'tenant_id', '')::uuid
$$;

create or replace function linkbrain.audit_payload_has_keys(
  p_payload jsonb,
  p_required_keys text[]
)
returns boolean
language sql
immutable
as $$
  select coalesce(
    (
      select bool_and(coalesce(p_payload, '{}'::jsonb) ? required_key)
      from unnest(p_required_keys) as required_key
    ),
    true
  )
$$;

create or replace function linkbrain.audit_required_payload_keys(
  p_event_type text
)
returns text[]
language sql
immutable
as $$
  select case p_event_type
    when 'run.started' then array['work_request_type', 'requested_by']
    when 'run.completed' then array['stage_count', 'audit_event_count']
    when 'run.failed' then array['failure']
    when 'stage.started' then array['stage_id', 'responsible_plane']
    when 'stage.completed' then array['stage_id', 'outputs_ref']
    when 'stage.failed' then array['stage_id', 'failure']
    when 'lease.requested' then array['capability_id', 'operation', 'idempotency_key']
    when 'lease.granted' then array['lease_id', 'capability_id', 'granted_until']
    when 'lease.executed' then array['lease_id', 'operation_result_ref']
    when 'lease.denied' then array['capability_id', 'denial_reason']
    when 'workflow.invoked' then array['workflow_handle', 'idempotency_key']
    when 'workflow.completed' then array['workflow_run_id', 'outputs_ref']
    when 'workflow.failed' then array['workflow_run_id', 'failure']
    else null
  end
$$;

create or replace function linkbrain.assert_audit_event_shape(
  p_event_type text,
  p_actor jsonb,
  p_target jsonb,
  p_payload jsonb
)
returns void
language plpgsql
immutable
as $$
declare
  v_required_keys text[];
begin
  v_required_keys := linkbrain.audit_required_payload_keys(p_event_type);

  if v_required_keys is null then
    raise exception 'Unsupported LiNKbrain audit event type: %', p_event_type
      using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_actor, 'null'::jsonb)) <> 'object'
    or not (p_actor ? 'kind')
    or not (p_actor ? 'id') then
    raise exception 'Audit actor must be an object with kind and id'
      using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_target, 'null'::jsonb)) <> 'object'
    or not (p_target ? 'entity_kind')
    or not (p_target ? 'entity_id') then
    raise exception 'Audit target must be an object with entity_kind and entity_id'
      using errcode = '22023';
  end if;

  if not linkbrain.audit_payload_has_keys(p_payload, v_required_keys) then
    raise exception 'Audit event % missing required payload keys: %',
      p_event_type,
      array_to_string(v_required_keys, ', ')
      using errcode = '22023';
  end if;
end;
$$;

create table if not exists linkbrain.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  run_id uuid not null,
  project_id uuid,
  stage_id text generated always as (payload ->> 'stage_id') stored,
  event_type text not null,
  event_version text not null default '1.0',
  emitted_at timestamptz not null default now(),
  actor jsonb not null,
  target jsonb not null,
  payload jsonb not null default '{}'::jsonb,
  refs jsonb not null default '{}'::jsonb,
  integrity_hash text not null,
  created_at timestamptz not null default now(),
  constraint audit_events_supported_type check (
    linkbrain.audit_required_payload_keys(event_type) is not null
  ),
  constraint audit_events_actor_object check (
    jsonb_typeof(actor) = 'object' and actor ? 'kind' and actor ? 'id'
  ),
  constraint audit_events_target_object check (
    jsonb_typeof(target) = 'object'
      and target ? 'entity_kind'
      and target ? 'entity_id'
  ),
  constraint audit_events_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint audit_events_refs_object check (jsonb_typeof(refs) = 'object')
);

create index if not exists audit_events_tenant_run_emitted_idx
  on linkbrain.audit_events (tenant_id, run_id, emitted_at, id);

create index if not exists audit_events_tenant_type_idx
  on linkbrain.audit_events (tenant_id, event_type, emitted_at desc);

create index if not exists audit_events_stage_idx
  on linkbrain.audit_events (tenant_id, run_id, stage_id)
  where stage_id is not null;

create index if not exists audit_events_payload_gin_idx
  on linkbrain.audit_events using gin (payload jsonb_path_ops);

create table if not exists linkbrain.memory_objects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  run_id uuid not null,
  source_event_id uuid not null references linkbrain.audit_events(id) on delete restrict,
  memory_type text not null,
  status text not null default 'accepted',
  title text not null,
  artifact_ref text,
  knowledge_ref text,
  content jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint memory_objects_type_check check (
    memory_type in (
      'accepted_knowledge',
      'run_artifact_ref',
      'company_lesson',
      'world_brain_contribution'
    )
  ),
  constraint memory_objects_status_check check (status = 'accepted'),
  constraint memory_objects_ref_check check (
    artifact_ref is not null or knowledge_ref is not null
  ),
  constraint memory_objects_content_object check (jsonb_typeof(content) = 'object'),
  constraint memory_objects_provenance_object check (jsonb_typeof(provenance) = 'object')
);

create index if not exists memory_objects_tenant_run_idx
  on linkbrain.memory_objects (tenant_id, run_id, accepted_at desc);

create index if not exists memory_objects_source_event_idx
  on linkbrain.memory_objects (source_event_id);

create index if not exists memory_objects_content_gin_idx
  on linkbrain.memory_objects using gin (content jsonb_path_ops);

alter table linkbrain.audit_events enable row level security;
alter table linkbrain.memory_objects enable row level security;

drop policy if exists audit_events_service_role_all on linkbrain.audit_events;
create policy audit_events_service_role_all
  on linkbrain.audit_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists audit_events_tenant_select on linkbrain.audit_events;
create policy audit_events_tenant_select
  on linkbrain.audit_events
  for select
  using (tenant_id = linkbrain.current_tenant_id());

drop policy if exists memory_objects_service_role_all on linkbrain.memory_objects;
create policy memory_objects_service_role_all
  on linkbrain.memory_objects
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists memory_objects_tenant_select on linkbrain.memory_objects;
create policy memory_objects_tenant_select
  on linkbrain.memory_objects
  for select
  using (tenant_id = linkbrain.current_tenant_id());

create or replace function linkbrain.write_audit_event(
  p_tenant_id uuid,
  p_run_id uuid,
  p_event_type text,
  p_actor jsonb,
  p_target jsonb,
  p_payload jsonb default '{}'::jsonb,
  p_refs jsonb default '{}'::jsonb,
  p_project_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = linkbrain, public, extensions
as $$
declare
  v_event_id uuid := gen_random_uuid();
  v_integrity_hash text;
begin
  perform linkbrain.assert_audit_event_shape(
    p_event_type,
    p_actor,
    p_target,
    coalesce(p_payload, '{}'::jsonb)
  );

  v_integrity_hash := encode(
    extensions.digest(
      concat_ws(
        '|',
        p_tenant_id::text,
        p_run_id::text,
        coalesce(p_project_id::text, ''),
        p_event_type,
        coalesce(p_actor, '{}'::jsonb)::text,
        coalesce(p_target, '{}'::jsonb)::text,
        coalesce(p_payload, '{}'::jsonb)::text,
        coalesce(p_refs, '{}'::jsonb)::text
      ),
      'sha256'
    ),
    'hex'
  );

  insert into linkbrain.audit_events (
    id,
    tenant_id,
    run_id,
    project_id,
    event_type,
    actor,
    target,
    payload,
    refs,
    integrity_hash
  )
  values (
    v_event_id,
    p_tenant_id,
    p_run_id,
    p_project_id,
    p_event_type,
    p_actor,
    p_target,
    coalesce(p_payload, '{}'::jsonb),
    coalesce(p_refs, '{}'::jsonb),
    v_integrity_hash
  );

  return v_event_id;
end;
$$;

create or replace function linkbrain.write_memory_object(
  p_tenant_id uuid,
  p_source_event_id uuid,
  p_memory_type text,
  p_title text,
  p_artifact_ref text default null,
  p_knowledge_ref text default null,
  p_content jsonb default '{}'::jsonb,
  p_provenance jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = linkbrain, public, extensions
as $$
declare
  v_memory_id uuid := gen_random_uuid();
  v_run_id uuid;
begin
  select audit_events.run_id
    into v_run_id
  from linkbrain.audit_events
  where audit_events.id = p_source_event_id
    and audit_events.tenant_id = p_tenant_id;

  if v_run_id is null then
    raise exception 'Source audit event % not found for tenant %',
      p_source_event_id,
      p_tenant_id
      using errcode = '23503';
  end if;

  insert into linkbrain.memory_objects (
    id,
    tenant_id,
    run_id,
    source_event_id,
    memory_type,
    title,
    artifact_ref,
    knowledge_ref,
    content,
    provenance
  )
  values (
    v_memory_id,
    p_tenant_id,
    v_run_id,
    p_source_event_id,
    p_memory_type,
    p_title,
    p_artifact_ref,
    p_knowledge_ref,
    coalesce(p_content, '{}'::jsonb),
    coalesce(p_provenance, '{}'::jsonb)
  );

  return v_memory_id;
end;
$$;

create or replace view linkbrain.mvo_run_trace as
select
  audit_events.tenant_id,
  audit_events.run_id,
  audit_events.project_id,
  audit_events.stage_id,
  audit_events.event_type,
  audit_events.emitted_at,
  audit_events.actor,
  audit_events.target,
  audit_events.payload,
  audit_events.refs,
  audit_events.integrity_hash,
  memory_objects.id as memory_object_id,
  memory_objects.memory_type,
  memory_objects.artifact_ref,
  memory_objects.knowledge_ref
from linkbrain.audit_events
left join linkbrain.memory_objects
  on memory_objects.source_event_id = audit_events.id;

grant usage on schema linkbrain to authenticated, service_role;
grant select on linkbrain.audit_events to authenticated, service_role;
grant select on linkbrain.memory_objects to authenticated, service_role;
grant select on linkbrain.mvo_run_trace to authenticated, service_role;
grant execute on function linkbrain.write_audit_event(
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  uuid
) to service_role;
grant execute on function linkbrain.write_memory_object(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb
) to service_role;
