# LEXOS LinkBot role contracts

**Status:** Specification / declaration artifacts for MVO scaffolding
**Canon:** `packages/linklogic-sdk/src/lexos-contracts.ts` defines `LexosRoleIdSchema` and workflow stages `W0`–`W11`. Contract YAML lives under `plugins/vertical/lexos/roles/contracts/`.

## Boundary model

| Plane | Responsibility in LEXOS judgments |
| --- | --- |
| LinkBot runtime | Bounded reasoning tied to tenant-scoped LEXOS payloads; emits structured intents and narratives; never owns canonical memory or integration secrets |
| LiNKbrain | Canonical events, narratives, embeddings, citations, contradiction registers, retrieval assembly |
| LinkSkills | Capability catalog, approvals, leases, lease ledger artifacts, connector mode enforcement |
| LiNKautowork | Deterministic ingestion, extraction, QA, rendering, deterministic CRM/Plane mocks |
| LiNKaios | Orchestrates approvals, queues work requests, maps roles to packets, emits trace/state |

Lease pattern: capability plugins expose operations; roles request side effects indirectly through leases recorded on each run bundle. Roles must refuse to escalate connector modes locally.

### MVO prohibition set

Across all LEXOS LinkBot contracts:

- `mvo_live_side_effect_authority.live_court_filing`: **false**
- `mvo_live_side_effect_authority.live_provider_legal_research_write`: **false**
- `mvo_live_side_effect_authority.external_correspondence_or_filing_send`: **false**

Human-only or separate workflow filings remain outside LinkBot autonomy.

## Role-to-stage matrix

| Workflow stage | Display name (`LEXOS_STAGE_DISPLAY_NAMES`) | Primary Lexos roles (`LexosRoleIdSchema`) | Deterministic adjuncts |
| --- | --- | --- | --- |
| `W0` | Client Onboarding | `lexos_intake_agent` | Optional CRM mocks via `cap.crm.mock` leases |
| `W1` | Client Master Record | `lexos_custodian_agent` | LiNKautowork CRM sync stubs when routed |
| `W2` | Case-Client Story | `lexos_story_architect` | — |
| `W3` | Opposing File Reconciliation | *No canonical `LexosRoleIdSchema` yet* — reserve for LiNKaios routing backlog or interim human LinkBot persona per conversion plan §2 revision | LiNKbrain reconciliation logs |
| `W4` | Evidence Intake | `lexos_evidence_archivist` | Strong expectation of `autowork.lexos.evidence_ingest` / `autowork.lexos.extraction_run` |
| `W5` | Support Matrix | `lexos_analyst` | `autowork.lexos.assertion_sync` alignment |
| `W6` | Strategy | `lexos_strategist` | Optional leased research scaffolding |
| `W7` | Legal Research | `lexos_librarian` | Leased connectors only (`cap.research.*`) |
| `W8` | Argument Drafting | `lexos_advocate` | — |
| `W9` | Adversarial Review | `lexos_adversary` | — |
| `W10` | Visual Exhibits | *Delegated primarily to automation per conversion plan — no dedicated schema role yet* | `autowork.lexos.artifact_generate`, governed asset storage |
| `W11` | Output Refinement | `lexos_rhetorician` | Rendering via LiNKautowork under orchestration |

> **Coverage note.** `LexosRoleIdSchema` enumerates exactly ten identifiers. Until `LexosRoleIdSchema` expands, `W3` and `W10` remain coordinated through orchestration stubs (LiNKautowork-first) alongside human review—not through additional LinkBot role IDs declared here.

## File map

Contract files mirror `LexosRoleIdSchema`:

- `contracts/lexos_intake_agent.contract.yaml`
- `contracts/lexos_custodian_agent.contract.yaml`
- `contracts/lexos_story_architect.contract.yaml`
- `contracts/lexos_evidence_archivist.contract.yaml`
- `contracts/lexos_analyst.contract.yaml`
- `contracts/lexos_strategist.contract.yaml`
- `contracts/lexos_librarian.contract.yaml`
- `contracts/lexos_advocate.contract.yaml`
- `contracts/lexos_adversary.contract.yaml`
- `contracts/lexos_rhetorician.contract.yaml`

## Verification commands

```
find plugins/vertical/lexos/roles/contracts -name '*.contract.yaml' -maxdepth 1 | sort

for rid in lexos_intake_agent lexos_custodian_agent lexos_story_architect lexos_evidence_archivist \
 lexos_analyst lexos_strategist lexos_librarian lexos_advocate lexos_adversary lexos_rhetorician; do
  rg -n --glob '*.yaml' "^role_id:\\s*${rid}\\s*$" plugins/vertical/lexos/roles/contracts || exit 1
done

rg 'live_court_filing:\\s*(true|false)' plugins/vertical/lexos/roles/contracts
```

All `live_*` booleans resolve to **`false`** in MVO posture.
