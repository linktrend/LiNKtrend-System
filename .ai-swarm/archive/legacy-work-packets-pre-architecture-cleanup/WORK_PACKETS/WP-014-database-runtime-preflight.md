# WP-014 — Database runtime preflight for E2E demo

## Objective

Unblock `WP-013` by providing a reachable database runtime for the WebsiteFactory MVO E2E demo. The prior WP-013 run failed before application execution because the configured remote Supabase database host was unresolvable and Docker was not available for local Supabase.

## Required context

- `.ai-swarm/AGENT_REPORTS/integration-agent.md` WP-013 update
- `.ai-swarm/CONTRACTS_MVO.md` §§5.4, 6.3, 8, 10
- `.ai-swarm/DECISIONS.md` D-05
- `.ai-swarm/WORK_PACKETS/WP-013-e2e-demo-and-audit-harness.md`
- `package.json`
- `.env.example`
- `services/migrations/run.mjs`
- `services/migrations/*.sql`

## Allowed files

- `.env.example`
- documentation under `.ai-swarm/**`
- database setup scripts if needed under `services/migrations/**`
- package scripts only if required to add a safe preflight command
- `.ai-swarm/AGENT_REPORTS/integration-agent.md`

## Prohibited files

- Real `.env` secret values
- Application feature code
- Real customer data
- In-memory SQL mocks as a substitute for the E2E proof
- Any change that bypasses LiNKbrain audit, LinkSkills leases, RLS, or database RPCs

## Tasks

1. Determine why the configured Supabase database host is unreachable:
   - DNS / network issue
   - invalid or deleted Supabase project ref
   - stale `.env` values
2. Verify whether Docker/local Supabase is available. If not, document the required user action clearly.
3. Choose one valid database path for E2E:
   - Preferred: reachable remote Supabase matching D-05.
   - Acceptable fallback: local Supabase/Postgres that can apply migrations and run RPCs.
4. Run or document a database preflight that proves:
   - database connection succeeds
   - migrations can apply
   - `linkbrain.write_audit_event` or the safe wrapper is callable
   - the kernel can persist a minimal run/audit event
5. Update `.ai-swarm/AGENT_REPORTS/integration-agent.md` with proof and the exact command/environment path for rerunning WP-013.

## Acceptance criteria

- E2E has a reachable database path that executes real migrations/RPCs.
- No in-memory database mock is used for final proof.
- Secrets remain out of committed files and reports.
- WP-013 can be rerun with a clear command sequence.

## Required proof

- DNS/connectivity proof or corrected environment proof.
- Migration or preflight command output.
- Audit RPC preflight result.
- Clear next instruction for WP-013 retry.

## Out of scope

Implementing product features, bypassing persistence, replacing Supabase with a new service, or making production deployment changes.
