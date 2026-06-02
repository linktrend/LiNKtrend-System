-- LTS-020 compat: MVO audit/memory RPCs on canonical linkbrain tables (023/031).
-- Live LiNKtrend-AdminDB already has linkbrain.audit_events (plane/action/subject)
-- and linkbrain.memory_objects (id/type/scope_jsonb). The original LTS-020 migration
-- assumed a greenfield column layout; this migration only adds adapter functions.

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

create or replace function linkbrain.sha256_text(material text)
returns text
language sql
immutable
set search_path = linkbrain, public, extensions
as $$
  select encode(
    digest(convert_to(coalesce(material, ''), 'UTF8'), 'sha256'::text),
    'hex'
  );
$$;

create or replace function linkbrain.normalize_mvo_actor_kind(p_actor_kind text)
returns text
language plpgsql
stable
as $$
declare
  v_kind text := lower(trim(coalesce(p_actor_kind, '')));
begin
  v_kind := case v_kind
    when 'workflow' then 'system'
    when 'automation' then 'plugin'
    else v_kind
  end;

  if v_kind not in ('kernel', 'plugin', 'bot', 'user', 'system') then
    raise exception 'unsupported actor_kind for canonical audit envelope: %', p_actor_kind;
  end if;

  return v_kind;
end;
$$;

create or replace function linkbrain.infer_mvo_plane(p_event_type text)
returns text
language plpgsql
stable
as $$
begin
  if p_event_type like 'lease.%' then
    return 'linkskills';
  elsif p_event_type like 'workflow.%' then
    return 'linkautowork';
  elsif p_event_type like 'memory.%' then
    return 'linkbrain';
  elsif p_event_type like 'run.%' or p_event_type like 'stage.%' then
    return 'linkaios';
  end if;

  return 'linkbrain';
end;
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
  p_emitted_at timestamptz default now(),
  p_plane text default null
)
returns uuid
language plpgsql
security definer
set search_path = linkbrain, public
as $$
declare
  v_event_id uuid := gen_random_uuid();
  v_subject jsonb;
  v_refs jsonb;
  v_payload jsonb;
  v_hash text;
  v_plane text;
  v_actor_kind text;
  v_row record;
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

  v_actor_kind := linkbrain.normalize_mvo_actor_kind(p_actor_kind);
  v_plane := coalesce(nullif(trim(p_plane), ''), linkbrain.infer_mvo_plane(p_event_type));

  v_subject := jsonb_strip_nulls(jsonb_build_object(
    'run_id', p_run_id::text,
    'stage_id', nullif(p_stage_id, ''),
    'lease_id', p_lease_id::text,
    'workflow_run_id', nullif(p_workflow_run_id, ''),
    'capability_id', nullif(p_capability_id, ''),
    'project_id', nullif(p_project_id, ''),
    'target_kind', p_target_kind,
    'target_id', p_target_id
  ));

  v_refs := jsonb_strip_nulls(jsonb_build_object(
    'run_id', p_run_id,
    'stage_id', nullif(p_stage_id, ''),
    'lease_id', p_lease_id,
    'workflow_run_id', nullif(p_workflow_run_id, ''),
    'capability_id', nullif(p_capability_id, ''),
    'project_id', nullif(p_project_id, ''),
    'suite_id', nullif(p_suite_id, ''),
    'module_id', nullif(p_module_id, ''),
    'actor_role_id', nullif(p_actor_role_id, '')
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

  v_payload := coalesce(p_payload, '{}'::jsonb) || jsonb_build_object(
    'mvo', jsonb_build_object(
      'event_version', '1.0.0',
      'integrity_hash', v_hash,
      'integrity_algorithm', 'sha256'
    )
  );

  select *
  into v_row
  from linkbrain.write_audit_event(
    p_event_id => v_event_id,
    p_ts => coalesce(p_emitted_at, now()),
    p_tenant_id => p_tenant_id,
    p_plane => v_plane,
    p_actor_kind => v_actor_kind,
    p_actor_id => p_actor_id,
    p_action => p_event_type,
    p_subject => v_subject,
    p_refs => v_refs || jsonb_build_object('mvo_integrity_hash', v_hash),
    p_payload => v_payload,
    p_schema_version => '1'
  );

  return coalesce(v_row.event_id, v_event_id);
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
  p_provenance_refs jsonb default '[]'::jsonb,
  p_suite_id text default 'linksites',
  p_module_id text default 'websitefactory'
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
  v_scope jsonb;
  v_payload jsonb;
  v_provenance uuid[];
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
    p_suite_id => p_suite_id,
    p_module_id => p_module_id,
    p_plane => 'linkbrain'
  );

  v_scope := jsonb_strip_nulls(jsonb_build_object(
    'stage_id', nullif(p_stage_id, ''),
    'artifact_ref', nullif(p_artifact_ref, ''),
    'knowledge_ref', nullif(p_knowledge_ref, ''),
    'accepted_ref', v_accepted_ref,
    'accepted_by', coalesce(p_accepted_by, 'policy:mvo-auto-accept'),
    'suite_id', nullif(p_suite_id, ''),
    'module_id', nullif(p_module_id, ''),
    'provenance_refs', p_provenance_refs
  ));

  v_payload := coalesce(p_payload, '{}'::jsonb) || jsonb_build_object(
    'summary', p_summary,
    'memory_type', p_memory_type
  );

  v_provenance := array_remove(
    array[p_source_event_id, v_accepted_event_id]::uuid[],
    null::uuid
  );

  -- Predetermined id so memory.accepted target_id matches the persisted row.
  insert into linkbrain.memory_objects (
    id,
    tenant_id,
    type,
    scope_jsonb,
    provenance_event_ids,
    payload_jsonb,
    state,
    confidence,
    source_plane,
    run_id,
    plugin_id,
    role_id
  )
  values (
    v_memory_id,
    p_tenant_id,
    p_memory_type,
    v_scope,
    v_provenance,
    v_payload,
    'active',
    1.00,
    'linkbrain',
    p_run_id,
    nullif(p_suite_id, ''),
    nullif(p_module_id, '')
  );

  return v_memory_id;
end;
$$;

revoke all on function linkbrain.record_mvo_audit_event(
  uuid, text, text, text, text, text, jsonb, uuid, text, uuid, text, text, text, text, text, text, timestamptz, text
) from public;
grant execute on function linkbrain.record_mvo_audit_event(
  uuid, text, text, text, text, text, jsonb, uuid, text, uuid, text, text, text, text, text, text, timestamptz, text
) to service_role;

revoke all on function linkbrain.record_mvo_memory_object(
  uuid, text, text, jsonb, uuid, text, uuid, text, text, text, jsonb, text, text
) from public;
grant execute on function linkbrain.record_mvo_memory_object(
  uuid, text, text, jsonb, uuid, text, uuid, text, text, text, jsonb, text, text
) to service_role;

comment on function linkbrain.record_mvo_audit_event is
  'LTS-020 MVO adapter: validates LinkSites lifecycle events and persists via linkbrain.write_audit_event (§6.3 envelope).';

comment on function linkbrain.record_mvo_memory_object is
  'LTS-020 MVO adapter: records memory.accepted audit event then inserts canonical linkbrain.memory_objects row.';
