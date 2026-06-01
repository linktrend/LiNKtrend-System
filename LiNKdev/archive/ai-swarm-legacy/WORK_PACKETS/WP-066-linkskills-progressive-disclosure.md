# WP-066 - LinkSkills Progressive Disclosure Service

## Objective

Implement run-scoped disclosure token generation and fragment delivery for LinkBot skill usage.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-066-linkskills-progressive-disclosure`
- Base: `development`

## Allowed files

- `packages/linkskills-core/src/disclosure/`
- `packages/linkskills-core/src/tokens/`
- `packages/linkskills-core/src/api/disclosure.ts`
- `packages/linklogic-sdk/src/types/disclosure.ts`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Old repo disclosure implementation (architecture different)
- LinkBot runtime code (SDK/API only)
- Full skill source disclosure (fragments only)

## Required context

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md` §4.7
- PRD_LINKSKILLS_LOGIC_ENGINE §12 (progressive disclosure)
- WP-063 (lease lifecycle)
- WP-065 (Golden Template)

## Steps

1. Define disclosure types in SDK:
   - `DisclosureToken` interface (JWT-like structure)
   - `DisclosureManifest` interface
   - `ExecutionMode` enum (managed, hybrid, client_side)
   - `DisclosureScope` (tenant, capability, run, step)

2. Implement disclosure token structure:
   - `iss` (issuer: linkskills)
   - `sub` (subject: run_id + step_id)
   - `tenant_id`, `capability`, `step_scope`
   - `exp` (expiry, short-lived: 5-30 min)
   - `jti` (unique token id)
   - `mode` (managed/hybrid/client_side)
   - `allowed_tools` (constrained tool list)

3. Implement token signing and validation:
   - Key pair management (rotate periodically)
   - Sign tokens with RS256 or Ed25519
   - Validate token signature, expiry, scope
   - Revocation check (if needed)

4. Implement disclosure issuance endpoint:
   - `POST /v1/disclosures/issue`
   - Requires active lease (WP-063 integration)
   - Returns disclosure token + manifest
   - Log issuance to audit

5. Implement run-scoped manifest generation:
   - Select skill fragments based on current step
   - Include: decision tree, phase instructions, contracts
   - Exclude: full old-patterns, all examples
   - Bound by token scope

6. Implement client execution mode support:
   - Managed: full server-side (no disclosure needed)
   - Hybrid: orchestration central, limited client execution
   - Client-side: minimal disclosure for local execution

7. Implement disclosure logging:
   - Record what was disclosed to whom
   - Audit event: `disclosure.issued`
   - Include fragment scope, not content

## Acceptance criteria

- [ ] Disclosure tokens are signed and time-limited
- [ ] Token scope: tenant + capability + run + step
- [ ] Run-scoped manifest includes minimal required fragments
- [ ] Full skill source never disclosed by default
- [ ] Disclosure issuance requires active lease
- [ ] Audit event `disclosure.issued` logged
- [ ] Token validation works end-to-end

## Proof required

- Token generation and validation test
- Manifest content verification (minimal fragments only)
- Disclosure issuance with lease integration
- Audit event capture

## Blockers

- WP-063 (lease lifecycle) must complete
- WP-065 (Golden Template) for fragment selection
- Signing key infrastructure decision

## Notes

- Old repo disclosure in `services/logic-engine/src/disclosure/` is reference only
- Architecture different: old = centralized service, new = plane in ecosystem
- IP protection is goal, not perfect anti-theft (PRD §12.5)
- Coordinate with LinkBot runtime for disclosure consumption
