# LiNKbrain audit envelope

LTS-020 establishes the first canonical LiNKbrain audit and memory write
surface for the MVO path. The implementation lives in:

- `supabase/migrations/001_linkbrain_audit_envelope.sql`

## Audit envelope

All persisted events use the same tenant-scoped envelope:

| Field | Purpose |
| --- | --- |
| `tenant_id` | Required tenant boundary for RLS and trace filtering. |
| `run_id` | One pass through a LiNKaios Project module path. |
| `project_id` | Optional LiNKaios Project reference. |
| `event_type` | Immutable lifecycle type such as `stage.completed`. |
| `actor` | Object with `kind` and `id` for the system, bot, human, or workflow. |
| `target` | Object with `entity_kind` and `entity_id` for the affected thing. |
| `payload` | Compact event details and required lifecycle fields. |
| `refs` | Cross-plane references such as lease, workflow, artifact, or Plane IDs. |
| `integrity_hash` | SHA-256 hash over the envelope inputs. |

Writes go through `linkbrain.write_audit_event(...)`; direct table writes are not
the expected application path.

## Required MVO lifecycle events

The migration accepts and validates the core MVO lifecycle set:

- Run: `run.started`, `run.completed`, `run.failed`
- Stage: `stage.started`, `stage.completed`, `stage.failed`
- LinkSkills lease: `lease.requested`, `lease.granted`, `lease.executed`, `lease.denied`
- LiNKautowork workflow: `workflow.invoked`, `workflow.completed`, `workflow.failed`

Each event type has required payload keys enforced by
`linkbrain.audit_required_payload_keys(event_type)`.

## Memory write surface

Accepted knowledge and run artifact references are stored in
`linkbrain.memory_objects` through `linkbrain.write_memory_object(...)`.

The table requires:

- `tenant_id`
- source `audit_event_id`
- `memory_type` of `accepted_knowledge`, `run_artifact_ref`, `company_lesson`, or
  `world_brain_contribution`
- at least one of `artifact_ref` or `knowledge_ref`
- accepted-only status for MVO (`status = 'accepted'`)

## Proof transaction template

This rollback-safe transaction proves one LinkSites MVO stage can write run,
stage, lease, workflow, and memory records through RPC functions:

```sql
begin;

with constants as (
  select
    gen_random_uuid() as tenant_id,
    gen_random_uuid() as run_id,
    gen_random_uuid() as project_id,
    gen_random_uuid() as lease_id,
    gen_random_uuid() as workflow_run_id
),
run_started as (
  select
    constants.*,
    linkbrain.write_audit_event(
      constants.tenant_id,
      constants.run_id,
      'run.started',
      '{"kind":"system","id":"linkaios"}'::jsonb,
      '{"entity_kind":"project_run","entity_id":"mvo-demo-run"}'::jsonb,
      '{"work_request_type":"linksites_mvo","requested_by":"principal"}'::jsonb,
      '{}'::jsonb,
      constants.project_id
    ) as event_id
  from constants
),
stage_started as (
  select
    run_started.*,
    linkbrain.write_audit_event(
      run_started.tenant_id,
      run_started.run_id,
      'stage.started',
      '{"kind":"workflow","id":"linkautowork"}'::jsonb,
      '{"entity_kind":"linksites_stage","entity_id":"publish"}'::jsonb,
      '{"stage_id":"publish","responsible_plane":"LiNKautowork"}'::jsonb,
      '{}'::jsonb,
      run_started.project_id
    ) as stage_event_id
  from run_started
),
lease_requested as (
  select
    stage_started.*,
    linkbrain.write_audit_event(
      stage_started.tenant_id,
      stage_started.run_id,
      'lease.requested',
      '{"kind":"system","id":"linkaios"}'::jsonb,
      '{"entity_kind":"capability","entity_id":"cap.payload.publish"}'::jsonb,
      jsonb_build_object(
        'capability_id', 'cap.payload.publish',
        'operation', 'publish_temp_site',
        'idempotency_key', 'linksites-demo-publish'
      ),
      jsonb_build_object('stage_event_id', stage_started.stage_event_id),
      stage_started.project_id
    ) as lease_requested_event_id
  from stage_started
),
lease_granted as (
  select
    lease_requested.*,
    linkbrain.write_audit_event(
      lease_requested.tenant_id,
      lease_requested.run_id,
      'lease.granted',
      '{"kind":"system","id":"linkskills"}'::jsonb,
      '{"entity_kind":"capability_lease","entity_id":"publish-temp-site"}'::jsonb,
      jsonb_build_object(
        'lease_id', lease_requested.lease_id,
        'capability_id', 'cap.payload.publish',
        'granted_until', now() + interval '15 minutes'
      ),
      jsonb_build_object('lease_requested_event_id', lease_requested.lease_requested_event_id),
      lease_requested.project_id
    ) as lease_granted_event_id
  from lease_requested
),
workflow_completed as (
  select
    lease_granted.*,
    linkbrain.write_audit_event(
      lease_granted.tenant_id,
      lease_granted.run_id,
      'workflow.invoked',
      '{"kind":"workflow","id":"linkautowork"}'::jsonb,
      '{"entity_kind":"automation","entity_id":"linksites.publish"}'::jsonb,
      '{"workflow_handle":"linksites.publish","idempotency_key":"linksites-demo-publish"}'::jsonb,
      jsonb_build_object('lease_id', lease_granted.lease_id),
      lease_granted.project_id
    ) as workflow_invoked_event_id,
    linkbrain.write_audit_event(
      lease_granted.tenant_id,
      lease_granted.run_id,
      'workflow.completed',
      '{"kind":"workflow","id":"linkautowork"}'::jsonb,
      '{"entity_kind":"automation","entity_id":"linksites.publish"}'::jsonb,
      jsonb_build_object(
        'workflow_run_id', lease_granted.workflow_run_id,
        'outputs_ref', 'artifact://linksites/demo/publish-result.json'
      ),
      jsonb_build_object('lease_id', lease_granted.lease_id),
      lease_granted.project_id
    ) as workflow_completed_event_id
  from lease_granted
),
stage_completed as (
  select
    workflow_completed.*,
    linkbrain.write_audit_event(
      workflow_completed.tenant_id,
      workflow_completed.run_id,
      'lease.executed',
      '{"kind":"workflow","id":"linkautowork"}'::jsonb,
      '{"entity_kind":"capability_lease","entity_id":"publish-temp-site"}'::jsonb,
      jsonb_build_object(
        'lease_id', workflow_completed.lease_id,
        'operation_result_ref', 'artifact://linksites/demo/publish-result.json'
      ),
      jsonb_build_object('workflow_run_id', workflow_completed.workflow_run_id),
      workflow_completed.project_id
    ) as lease_executed_event_id,
    linkbrain.write_audit_event(
      workflow_completed.tenant_id,
      workflow_completed.run_id,
      'stage.completed',
      '{"kind":"workflow","id":"linkautowork"}'::jsonb,
      '{"entity_kind":"linksites_stage","entity_id":"publish"}'::jsonb,
      '{"stage_id":"publish","outputs_ref":"artifact://linksites/demo/publish-result.json"}'::jsonb,
      jsonb_build_object('workflow_run_id', workflow_completed.workflow_run_id),
      workflow_completed.project_id
    ) as stage_completed_event_id
  from workflow_completed
),
memory_written as (
  select
    stage_completed.*,
    linkbrain.write_memory_object(
      stage_completed.tenant_id,
      stage_completed.stage_completed_event_id,
      'run_artifact_ref',
      'Published LinkSites temp URL artifact',
      'artifact://linksites/demo/publish-result.json',
      null,
      '{"temp_url":"businessname.linktrend.media"}'::jsonb,
      jsonb_build_object('source', 'LTS-020 proof transaction')
    ) as memory_object_id
  from stage_completed
)
select
  tenant_id,
  run_id,
  project_id,
  memory_object_id
from memory_written;

rollback;
```
