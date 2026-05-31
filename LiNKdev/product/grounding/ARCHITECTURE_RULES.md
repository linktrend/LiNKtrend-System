# Architecture rules (non-negotiable)

Plane boundaries for LiNKtrend System / LiNKaios. Superseded only by a recorded decision in [`DECISIONS.md`](DECISIONS.md).

**Canonical narrative:** [`PRINCIPAL_PRODUCT_DEFINITION.md`](PRINCIPAL_PRODUCT_DEFINITION.md)  
**Repo ownership map:** `docs/architecture/repo-architecture-target.md`

---

## LiNKtrend System = LiNKaios

LiNKaios is the **organizational execution control plane**. LiNKbrain, LinkSkills, LiNKautowork, LiNKbot, and LiNKguard are **components of LiNKaios** with strict ownership — not separate products that LiNKaios may absorb.

LiNKaios **coordinates** the ecosystem. It **must not** own canonical memory, skills/secrets, deterministic workflow bodies, or bot reasoning.

---

## Planes of responsibility

| Plane | Owns | Must not own |
|-------|------|--------------|
| **LiNKaios** | Client + Admin UI, tenants, Suites/Projects, routing, approvals, traces | Memory, leases, workflow execution, bot sessions, skill IP |
| **LiNKbot** | Runtime adapters, roles, personas, judgment dispatch | Canonical memory, lease issuance, secrets, deterministic steps |
| **LinkSkills** | Skills, capability catalog, leases, idempotency, kill switches | Long-term memory |
| **LiNKautowork** | Deterministic workflows, n8n gateway | High-judgment decisions, audit storage |
| **LiNKbrain** | Events, audit, memory objects, context assembly, Librarian loop | Business actions, outbound side effects |
| **LiNKguard** | Worker cleanup, skill-trace wipe, confidentiality enforcement | Skills, memory, mission authority |

---

## LiNKbot (thin runtime)

- LiNKbots receive skills via **progressive disclosure** from LinkSkills
- After use, **LiNKguard wipes skill traces** from the worker
- Bots request context from LiNKbrain and leases through LiNKaios/kernel — no direct side effects

---

## LinkSkills

- Governs **Capabilities** (connectors) and **skills**
- Every external side effect flows through a **lease**
- Does not store institutional memory

---

## LiNKbrain

- Single audit envelope for all planes (`DECISIONS.md` D-08)
- **Librarian** LiNKbot promotes run logs to company knowledge and anonymized world brain
- Does not execute CRM, publish, or messaging actions

---

## LiNKautowork

- Executes repeatable workflow handles with idempotency and audit
- LinkSites deterministic stages (artifact write, mirror sync, Payload sync, checks, status updates) live here

---

## LiNKguard

- Session residue cleanup (legacy PRISM package under `LiNKguard/`)
- **Skill IP protection:** wipe bot traces after skill execution
- **Confidentiality:** enforce anonymization before world brain writes per tenant privacy policy

---

## Suites and external repos

- Suite workflow maps live under `suites/<suite-id>/`
- **LinkSites product** (templates, Payload, frontend) lives in **`LiNKsites`** external repo
- This repo declares integration contracts in [`CONTRACTS_MVO.md`](CONTRACTS_MVO.md) and capability connectors under `LiNKskills/capability-connectors/`

---

## MVO scope

First delivery = **LiNKaios Client + LiNKtrend Admin + LinkSites one-lead full E2E**. No other Suite work until MVO ships.

---

## Delivery principles

- Reuse existing code; do not rebuild working systems
- Stop and ask before inventing target-software business configuration
- Unacceptable stubs: missing audit, lease, memory, or trace for work that claimed success
- Route by contract: memory → LiNKbrain; permission → LinkSkills; automation → LiNKautowork; reasoning → LiNKbot; coordination → LiNKaios
