-- LTS-021: Librarian knowledge proposals (ingest → inbox → accept → company + world brain).

create table if not exists linkbrain.knowledge_proposals (
  proposal_id text primary key,
  tenant_id uuid not null,
  run_id uuid not null,
  stage_id text not null,
  project_id uuid null,
  title text not null,
  body text not null,
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'edited')),
  brain_file_version_id uuid null,
  knowledge_ref text null,
  world_brain_ref text null,
  proposed_audit_event_id uuid null,
  accepted_audit_event_id uuid null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  reviewed_by text null,
  constraint knowledge_proposals_tenant_run_stage unique (tenant_id, run_id, stage_id)
);

create index if not exists knowledge_proposals_tenant_status
  on linkbrain.knowledge_proposals (tenant_id, status, created_at desc);

create index if not exists knowledge_proposals_run
  on linkbrain.knowledge_proposals (run_id);

alter table linkbrain.knowledge_proposals enable row level security;

grant select on linkbrain.knowledge_proposals to authenticated;
grant select, insert, update on linkbrain.knowledge_proposals to service_role;

create policy knowledge_proposals_select on linkbrain.knowledge_proposals
  for select to authenticated
  using (tenant_id = linkbrain.jwt_tenant_id());

create policy knowledge_proposals_service on linkbrain.knowledge_proposals
  for all to service_role
  using (true)
  with check (true);

-- memory.proposed payload validation (extends LTS-020 assert).
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

  if p_event_type = 'memory.proposed' then
    if not (p_payload ? 'memory_type') then
      raise exception 'memory.proposed payload requires memory_type';
    end if;
    if not (p_payload ? 'proposal_ref') then
      raise exception 'memory.proposed payload requires proposal_ref';
    end if;
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

create or replace function linkbrain.upsert_knowledge_proposal_row(
  p_proposal_id text,
  p_tenant_id uuid,
  p_run_id uuid,
  p_stage_id text,
  p_project_id uuid,
  p_title text,
  p_body text,
  p_sources jsonb,
  p_brain_file_version_id uuid,
  p_proposed_audit_event_id uuid default null
)
returns linkbrain.knowledge_proposals
language plpgsql
security definer
set search_path = linkbrain, public
as $$
declare
  v_row linkbrain.knowledge_proposals;
begin
  insert into linkbrain.knowledge_proposals (
    proposal_id,
    tenant_id,
    run_id,
    stage_id,
    project_id,
    title,
    body,
    sources,
    status,
    brain_file_version_id,
    proposed_audit_event_id
  )
  values (
    p_proposal_id,
    p_tenant_id,
    p_run_id,
    p_stage_id,
    p_project_id,
    p_title,
    p_body,
    coalesce(p_sources, '[]'::jsonb),
    'pending',
    p_brain_file_version_id,
    p_proposed_audit_event_id
  )
  on conflict (proposal_id) do update set
    title = excluded.title,
    body = excluded.body,
    sources = excluded.sources,
    brain_file_version_id = coalesce(excluded.brain_file_version_id, linkbrain.knowledge_proposals.brain_file_version_id),
    proposed_audit_event_id = coalesce(excluded.proposed_audit_event_id, linkbrain.knowledge_proposals.proposed_audit_event_id)
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function linkbrain.finalize_knowledge_proposal(
  p_proposal_id text,
  p_decision text,
  p_reviewed_by text,
  p_edited_body text default null,
  p_knowledge_ref text default null,
  p_world_brain_ref text default null,
  p_accepted_audit_event_id uuid default null,
  p_memory_object_id uuid default null
)
returns linkbrain.knowledge_proposals
language plpgsql
security definer
set search_path = linkbrain, public
as $$
declare
  v_row linkbrain.knowledge_proposals;
  v_status text;
begin
  if p_decision not in ('accept', 'reject', 'edit') then
    raise exception 'unsupported decision: %', p_decision;
  end if;

  v_status := case
    when p_decision = 'reject' then 'rejected'
    when p_decision = 'edit' then 'edited'
    else 'accepted'
  end;

  update linkbrain.knowledge_proposals
  set
    status = v_status,
    reviewed_at = now(),
    reviewed_by = p_reviewed_by,
    body = case
      when p_decision = 'edit' and nullif(trim(p_edited_body), '') is not null then trim(p_edited_body)
      else body
    end,
    knowledge_ref = coalesce(p_knowledge_ref, knowledge_ref),
    world_brain_ref = coalesce(p_world_brain_ref, world_brain_ref),
    accepted_audit_event_id = coalesce(p_accepted_audit_event_id, accepted_audit_event_id)
  where proposal_id = p_proposal_id
  returning * into v_row;

  if v_row.proposal_id is null then
    raise exception 'Unknown knowledge proposal: %', p_proposal_id;
  end if;

  return v_row;
end;
$$;

create or replace function linkbrain.list_runs_pending_librarian_ingest(
  p_tenant_id uuid,
  p_limit int default 20
)
returns table (
  run_id uuid,
  project_id text,
  completed_at timestamptz
)
language sql
security definer
stable
set search_path = linkbrain, public
as $$
  select distinct on (ae.subject ->> 'run_id')
    (ae.subject ->> 'run_id')::uuid as run_id,
    ae.subject ->> 'project_id' as project_id,
    ae.ts as completed_at
  from linkbrain.audit_events ae
  where ae.tenant_id = p_tenant_id
    and ae.action = 'run.completed'
    and ae.subject ? 'run_id'
    and not exists (
      select 1
      from linkbrain.knowledge_proposals kp
      where kp.tenant_id = p_tenant_id
        and kp.run_id = (ae.subject ->> 'run_id')::uuid
        and kp.stage_id = 'linksites.librarian'
    )
  order by ae.subject ->> 'run_id', ae.ts desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

revoke all on function linkbrain.upsert_knowledge_proposal_row(
  text, uuid, uuid, text, uuid, text, text, jsonb, uuid, uuid
) from public;
grant execute on function linkbrain.upsert_knowledge_proposal_row(
  text, uuid, uuid, text, uuid, text, text, jsonb, uuid, uuid
) to service_role;

revoke all on function linkbrain.finalize_knowledge_proposal(
  text, text, text, text, text, text, uuid, uuid
) from public;
grant execute on function linkbrain.finalize_knowledge_proposal(
  text, text, text, text, text, text, uuid, uuid
) to service_role;

revoke all on function linkbrain.list_runs_pending_librarian_ingest(uuid, int) from public;
grant execute on function linkbrain.list_runs_pending_librarian_ingest(uuid, int) to service_role;

comment on table linkbrain.knowledge_proposals is
  'LTS-021 Librarian MVO: pending and reviewed knowledge from LinkSites runs + Zulip refs.';
