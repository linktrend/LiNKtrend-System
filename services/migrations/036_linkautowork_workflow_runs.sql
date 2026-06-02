-- Mirror of supabase/migrations/20260602140000_linkautowork_workflow_runs.sql

create schema if not exists linkautowork;

create table if not exists linkautowork.workflow_runs (
  workflow_run_id uuid primary key,
  workflow_handle text not null,
  status text not null check (status in ('pending', 'running', 'succeeded', 'failed', 'compensated')),
  tenant_id uuid not null,
  run_id text not null,
  stage_id text not null default '',
  lease_id text,
  idempotency_key text not null,
  invoked_at timestamptz not null default now(),
  completed_at timestamptz,
  audit_event_ids jsonb not null default '[]'::jsonb,
  failure_message text,
  outputs jsonb,
  constraint workflow_runs_idempotency_key_unique unique (idempotency_key)
);

create index if not exists workflow_runs_tenant_invoked_idx
  on linkautowork.workflow_runs (tenant_id, invoked_at desc);

create index if not exists workflow_runs_run_idx
  on linkautowork.workflow_runs (tenant_id, run_id);

alter table linkautowork.workflow_runs enable row level security;
