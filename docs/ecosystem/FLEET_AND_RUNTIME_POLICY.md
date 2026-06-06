# Fleet and runtime policy (Principal-approved)

**Status:** v1 — 2026-06-05  
**Canonical implementation plan:** `LiNKdev/product/reports/linktrend-system/STUDIO_FORWARD_PLAN.md`  
**Terminology:** `docs/terminology.md`, `.cursor/rules/07-suite-project-terminology.mdc`

---

## 1. Tenants and base subscription

| Tenant type | Surface | Included |
|-------------|---------|----------|
| **Vendor** | LiNKaios Admin | `admin-openclaw` + LLM Council access |
| **Client** | LiNKaios Client | `ceo-client` + LLM Council access |

Each **client tenant** is isolated by `tenant_id` in LiNKbrain, leases, traces, and Zulip routing.

---

## 2. Suite packaging

- **Suite** = department; **one OpenClaw head** per subscribed suite (department class).
- **Modules** = optional entitlements inside the suite; subscribe to one or more; full suite is the designed default.
- Partial module subscription may require **manual inputs** when upstream modules are not entitled.
- **Suite roles** in Plane/templates are logical assignees; they do **not** imply one OpenClaw per role.

Utility-only suites (sync/report packs) may declare `openclaw_slots: 0` in a future manifest field.

---

## 3. OpenClaw fleet v1 (studio staging)

Single gateway process (`openclaw-gateway`), five profiles:

| Profile | Tenant | Role |
|---------|--------|------|
| `admin-openclaw` | Admin | Vendor executive + LiNKsuitegen suite head |
| `ceo-client` | Client (Linktrend) | Tenant CEO |
| `linksites-head` | Client | LinkSites department head |
| `linkdeveloper-orchestrator` | Client | LiNKdeveloper factory head |
| `linkdeveloper-steward` | Client | Product steward (per active product run) |

**LiNKdeveloper** is entitled on **Client** for Linktrend first — not Admin operator default.  
**LiNKsuitegen** is **Admin-only**.

---

## 4. Agent Zero lanes v1

Deploy eight named lanes from day one (`link-agentzero` worker):

`az-librarian`, `az-suitegen-factory`, `az-linksites-research`, `az-linksites-build`, `az-linkdeveloper-analysis`, `az-linkdeveloper-architecture`, `az-linkdeveloper-validation`, `az-linkdeveloper-ops`

Issue → lane mapping is **deterministic** (see STUDIO_FORWARD_PLAN §4). Librarian and LiNKsuitegen factory analyst roles **never** use OpenClaw profiles.

---

## 5. Runtime ladder

1. LiNKautowork — deterministic  
2. Agent Zero lane — persistent/adequate tool work  
3. OpenClaw sub-agent — bounded burst under a head  
4. OpenClaw head / CEO / steward — relationship + orchestration  
5. Codex / Cursor — governed implementation  
6. LLM Council — gate deliberation (`cap.llm_council.deliberation`, [karpathy/llm-council](https://github.com/karpathy/llm-council))

Product steward is **always** OpenClaw (Zulip-capable). Suite orchestrator is **head**; steward is **subordinate** during factory and **graduates** with the product.

---

## 6. Gateway and isolation

- **v1:** One gateway, five profiles; tenant isolation enforced by LiNKaios.  
- **Independent client:** Second gateway on same VPS (recommended).  
- **Regulated:** Dedicated gateway and optional dedicated node.

Profiles isolate **roles** (workspace + sessions per `agentId`). **Tenants** require kernel `tenant_id` discipline.

---

## 7. Communications

Zulip and LiNKaios inbox have **parity** — humans may act in either channel (Admin and Client).

---

## 8. Hosting

| Phase | Infrastructure |
|-------|----------------|
| Launch / test | DigitalOcean `linkdroplet-00` + `linkdroplet-01` |
| Scale | Hetzner 2× EX44 64 GB (compute + collaboration), same topology |

See STUDIO_FORWARD_PLAN Wave 11–12.
