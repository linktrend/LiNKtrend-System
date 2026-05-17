# LiNKapps capability requirements (`linkapps.app_factory`)

**Status:** Specification / WP-108  
**Audience:** Integrator, LinkSkills/WP-112, LiNKautowork/WP-109  
**Canonical contract shapes:** Align to `CONTRACTS_MVO.md` §0.A.5.1 (connector-only capability pack) and canonical failure taxonomy §5.4.

## 1. Posture — development vs shadow vs live

- **Development / MVO (default):** All operations below MUST be satisfiable via **mock**, **local filesystem/git**, **fixture records**, **local/stub backends**, **recorded-but-not-sent Zulip payloads**, **or no-op stubs** behind the same lease + audit envelopes. No undocumented real production writes.

- **Shadow:** Optional probes that touch real provider endpoints for **connectivity/readiness only** (`readiness.probe`-class operations); MUST NOT mutate production SaaS tenant state unless a future packet explicitly expands shadow semantics per provider.

- **Live (explicitly future-only for LiNKapps):** Creating real GitHub org repos, provisioning Supabase org projects, authoring live Stripe catalogue objects in a live mode account, deploying to tenant Vercel teams, triggering paid EAS builds, mutating Plane production workspaces, **or delivering real outbound Zulip messages** requires **explicit tenant opt-in**, **distinct lease policies**, **`live` capability mode routing**, **and** downstream WP-112 implementation. This packet **does not** authorize turning those on silently.

Violations MUST surface as §5.4 `LEASE_DENIED` with `retryable=false` until policies are pinned.

Sources: LiNKapps `scripts/create-app-repo.sh` / `scripts/release-readiness.sh` (deterministic staging steps referenced by `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §4.1), vertical manifest `plugins/vertical/linkapps/manifest.yaml`.

## 2. Master capability matrix (operation × mode × lease)

Abbreviations:

- **L** = mandatory grant before execute (Lease permission / SKU).
- **—** = mode not offered for this operation (`LEASE_DENIED` if requested).
- **Mock** / **Shadow** / **Live** = capability execution mode routing.

### 2.1 `cap.github.repo_management`

**WP-085 name mapping:** `repo.create` is represented by `repo.create_from_template` (starter-kit materialization, analogous to `LiNKapps/scripts/create-app-repo.sh`). `repo.clone` is intentionally **collapsed** into the same staging path for MVO; a distinct `repo.clone_from_remote` surface is deferred to WP-112 for non-template lineage. `commit.push` decomposes into `commit.apply` (deterministic commits) plus `push.ref` (upstream push; **future live**).

| Operation | Purpose (LiNKapps) | Mock | Shadow | Live | LinkSkills lease SKU(s) |
|-----------|-------------------|------|--------|------|-------------------------|
| `repo.create_from_template` | Materialize starter kit workspace (mirror `create-app-repo.sh` staging) | L | probe only¹ | future L | `github.repo.template_materialize`, `github.repo.write`² |
| `repo.init_local` | `git init` + initial commit in workspace (mirror script `--skip-git` inverse) | L | — | L | `github.repo.write`, `git.local.init`³ |
| `remote.register` | Associate `origin` URL metadata (no network in mock) | L | L⁴ | future L | `github.repo.configure` |
| `commit.apply` | Apply staged patches / bot commits deterministically | L | — | L | `github.commit.write`, `github.repo.write` |
| `push.ref` | Push branch/tag to upstream | —⁵ | — | future L | `github.push.deploy` |

¹ Shadow for GitHub MAY be limited to `connectivity.probe` at capability level unless a narrowly scoped PAT-readiness RPC is added later.  
² `github.repo.write` is the umbrella SKU declared in LINKAPPS conversion plan §5.1; sub-SKUs in this matrix are granular recommendations for WP-112 catalog rows.  
³ Local git leases are bookkeeping SKUs so LinkSkills still emits `lease.granted|executed` in dev workflows.  
⁴ Registers URL only — no OAuth flow inside capability.  
⁵ Push is intentionally absent from dev/MVO connector surface unless Integrator adopts a guarded local remote (for example bundled bare repo).

### 2.2 `cap.supabase.provisioning`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `project.scaffold_stub` — record `supabase_project_ref` fixture | L | — | future L | `supabase.project.stub`, `supabase.project.create`² |
| `migration.apply_workspace` — run repo migrations locally/offline³ | L | — | future L | `supabase.schema.apply`, `supabase.migrate.run` |
| `rls.pack.apply_mock` — apply fixture RSQL pack to mock DB | L | — | future L | `supabase.rls.configure` |
| `readiness.probe` — API/ping without writes | — | L | L | `supabase.readiness.check` |

² `supabase.project.create` is LINKAPPS-plan umbrella for future provisioning.  
³ Mirrors `release-readiness.sh` test isolation (`TEMPLATE_OFFLINE=1` posture) — stays off shared cloud projects in MVO.

### 2.3 `cap.stripe.product_management`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `catalog.snapshot_mock` — Free/Pro/Business placeholders | L | — | future L | `stripe.product.fixture`, `stripe.product.write` |
| `price.attach_mock` | L | — | future L | `stripe.price.write` |
| `webhook.endpoint.register_stub` — record endpoint URL only | L | — | future L | `stripe.webhook.configure` |
| `readiness.probe` — key rotation / reachable API | — | L | L | `stripe.account.readiness` |

### 2.4 `cap.vercel.deployment`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `build.local_record` — store tarball/digest refs only | L | — | future L | `vercel.project.record`, `vercel.deploy.record`¹ |
| `deploy.trigger_mock` — emit preview URL fixtures | L | — | future L | `vercel.deploy` |
| `project.link_stub` | L | — | future L | `vercel.project.create` |
| `domain.configure_future` placeholder | — | — | future L | `vercel.domain.configure` |

¹ Mirrors local `pnpm --filter ./apps/web build` success path captured as audit metadata (no CDN publish in MVO).

### 2.5 `cap.eas.build`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `build.skip_placeholder` — record rationale (mobile off/default) | L | — | future L | `eas.build.plan` |
| `build.trigger` | — | — | future L | `eas.build` |
| `submit.app_store_future` | — | — | future L | `eas.submit.release` |

### 2.6 `cap.plane.execution_tracking`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `project.ensure_mock` — local/mock identity | L | — | future L | `plane.project.write` |
| `task.ensure_mock` | L | — | future L | `plane.task.write` |
| `sprint.track_stub` — attach iteration counters to LiNKbrain, not Plane taxonomy | L | — | future L | `plane.sprint.track`¹ |
| `readiness.probe` | — | L | future L | `plane.readiness.check` |

¹ Optional SKU — if unused, collapse into `plane.task.write` in WP-112.

### 2.7 `cap.zulip.run_messaging`

| Operation | Mock | Shadow | Live | Lease SKU(s) |
|-----------|------|--------|------|--------------|
| `run.notify` — queue payload locally | L | — | future L | `zulip.run.notify` |
| `channel.message.mock_send` | L | — | future L | `zulip.channel.message.send`² |
| `connectivity.probe` | — | L | L | `zulip.connectivity.probe`³ |

² Id matches `CONTRACTS_MVO.md` §0.A.5.1 (`channel.message.mock_send`).  
³ Same SKU family as readiness in LinkSites pack; unify in WP-112 if duplication is undesirable.

---

## 3. Per-capability connector contract rows (§0.A.5.1 table format)

| Capability plugin | Operations | Modes | Auth/config surface | Idempotency | LinkSkills lease requirements | Audit events | Allowed callers | Failure mapping (minimum) | Explicit non-ownership |
|---|---|---|---|---|---|---|---|---|---|
| `cap.github.repo_management` | `repo.create_from_template`, `repo.init_local`, `remote.register`, `commit.apply`, `push.ref` | `mock` default (`repo.push`/`push.ref` disabled in mock surface per §2.1 matrix), optional `shadow` for org connectivity probes only, **`live` future-only for remote push and GitHub-hosted repo shells** | `github.org_ref`, `github.app_installation_ref`, `github.pat_ref`/`github.oauth_actor_ref`, `github.default_branch_policy_ref`, optional `remote.url_template`; **no literals in manifests** | Per-operation §4; duplicates replay original result §5 | `github.repo.template_materialize`, `github.repo.configure`, `github.commit.write`, `github.repo.write`; future `github.push.deploy` | `capability.requested`, `capability.executed`, `linkapps.repo.scaffolded`, `github.commit.recorded`, `capability.failed` | `linkautowork`, `vertical_plugin` (dispatcher), **`linkbot` excluded from direct issuer per manifest `no_direct_lease_issue`; kernel issues on behalf** | malformed slug/path → `LEASE_REQUEST_INVALID`; missing installation/PAT → `INTEGRATION_AUTH_FAILED`; policy/kill-switch → `LEASE_DENIED`/`LEASE_KILL_SWITCH`; GitHub outage → `INTEGRATION_UNAVAILABLE`/`INTEGRATION_TIMEOUT`; replay conflict → `LEASE_IDEMPOTENCY_CONFLICT`; unknown manifest ref → `MANIFEST_INVALID` | Repository permission model beyond connector args, CODEOWNERS, branch protection taxonomy, Codespaces policy, Actions workflow design |

| `cap.supabase.provisioning` | `project.scaffold_stub`, `migration.apply_workspace`, `rls.pack.apply_mock`, `readiness.probe` | `mock` default; `shadow` for readiness probes; **`live` future-only org project provisioning** | `supabase.organization_ref`, `supabase.management_api_ref`, `supabase.fixture_profile_ref`; secret refs only | §4 | `supabase.project.stub`, `supabase.schema.apply`, `supabase.rls.configure`, `supabase.readiness.check`; future `supabase.project.create` | `capability.requested`, `capability.executed`, `linkapps.services.provisioned`, `supabase.migration.applied`, `capability.failed` | `linkautowork`, `vertical_plugin` | invalid fixture → `MANIFEST_INVALID`; PAT invalid → `INTEGRATION_AUTH_FAILED`; offline template → safe exit `INTEGRATION_UNAVAILABLE` with `retryable=true` for worker; destructive apply without lease → `LEASE_DENIED`; TTL expiry mid-run → `LEASE_EXPIRED` | Application business schema/content model invented without discovery; SaaS metering/billing dashboards inside Supabase console |

| `cap.stripe.product_management` | `catalog.snapshot_mock`, `price.attach_mock`, `webhook.endpoint.register_stub`, `readiness.probe` | `mock` default; `shadow` for readiness/account probes; **`live` future-only Stripe API writes** | `stripe.account_ref`, `stripe.api_key_ref`, `stripe.fixture_catalog_ref`; webhook endpoint URL template refs | §4 | `stripe.product.fixture`, `stripe.price.write`, `stripe.webhook.configure`, `stripe.account.readiness` | `capability.requested`, `capability.executed`, `stripe.catalog.mocked`, `capability.failed` | `linkautowork`, `vertical_plugin` | missing fixture profile → `MANIFEST_INVALID`; key invalid/revoked → `INTEGRATION_AUTH_FAILED`; Stripe outage → `INTEGRATION_UNAVAILABLE`/`INTEGRATION_TIMEOUT`; webhook registration blocked → `POLICY_REQUIRES_APPROVAL` optional; accidental live mode attempt in MVO → `LEASE_DENIED` | Subscription lifecycle rules, disputes, taxation, Radar rules, Stripe Connect onboarding |

| `cap.vercel.deployment` | `build.local_record`, `deploy.trigger_mock`, `project.link_stub`, `domain.configure_future` | `mock` default; optional `shadow` only if readiness probe ops added matching provider; **`live` future CDN publish** | `vercel.team_ref`, `vercel.token_ref`, `vercel.project_naming_rules_ref` | §4 | `vercel.project.record`, `vercel.deploy`, future `vercel.project.create`, `vercel.domain.configure` | `capability.requested`, `capability.executed`, `linkapps.deployed`, `capability.failed` | `linkautowork`, `vertical_plugin` | malformed deploy profile → `LEASE_REQUEST_INVALID`; token invalid → `INTEGRATION_AUTH_FAILED`; provider outage → `INTEGRATION_UNAVAILABLE`/`INTEGRATION_TIMEOUT`; premature live flag → `LEASE_DENIED` | Vercel org membership governance, SAML/SCIM setup, observability alerting baselines |

| `cap.eas.build` | `build.skip_placeholder`, `build.trigger`, `submit.app_store_future` | `mock` default (skip placeholders); **`live` future-only Expo builds/App Store submits** | `eas.project_ref`, `eas.token_ref`, `apple.connect_ref` (*future-only*) | §4 | `eas.build.plan`, future `eas.build`, `eas.submit.release` | `capability.requested`, `capability.executed`, `eas.build.skipped` / `eas.build.failed` | `linkautowork`, `vertical_plugin` | unauthorized live attempt while mobile track disabled (`manifest` restriction) → `LEASE_DENIED`; provider quota → `INTEGRATION_UNAVAILABLE`/`MODEL_QUOTA_EXCEEDED` analogue map to **`INTEGRATION_UNAVAILABLE`** unless Integrator assigns provider-specific enum | Enterprise Apple portal policies, phased releases, Crashlytics, store listing copy |

| `cap.plane.execution_tracking` | `project.ensure_mock`, `task.ensure_mock`, `sprint.track_stub`, `readiness.probe` | `mock` default; `shadow` for probes; **`live` future-only real Plane MU** | `plane.base_url`, `plane.workspace_ref`, `plane.api_key_ref`, `plane.project_template_ref` | §4 | `plane.project.write`, `plane.task.write`, `plane.sprint.track`¹, `plane.readiness.check` | `capability.requested`, `capability.executed`, `plane.task.upserted`, `plane.readiness.checked`, `capability.failed` | `linkaios`, `vertical_plugin`, `linkautowork` | connectivity → `INTEGRATION_UNAVAILABLE`; auth → `INTEGRATION_AUTH_FAILED`; policy/killswitch → `LEASE_DENIED`; invalid titles/ids → `LEASE_REQUEST_INVALID`; timeout → `INTEGRATION_TIMEOUT` | Enterprise portfolio taxonomy, SLA contracts with clients |

| `cap.zulip.run_messaging` | `run.notify`, `channel.message.mock_send`, `connectivity.probe` | **`mock` default outbound queue**; **`shadow` connectivity**; **`live` future outbound** | Per `CONTRACTS_MVO.md` §0.A.5.1 plus `tenant.stream_routing_ref` overrides for Linkapps run panels | `(tenant_id, run_id, stage_id, operation, message_purpose)` | `zulip.run.notify`, `zulip.channel.message.send`, `zulip.connectivity.probe` | `capability.requested`, `capability.executed`, `zulip.notification.queued`, `zulip.connectivity.checked`, `capability.failed` | `linkaios`, `vertical_plugin`, `linkbot`, `linkautowork` | stream/topic config missing → `MANIFEST_INVALID`; auth → `INTEGRATION_AUTH_FAILED`; connectivity → `INTEGRATION_UNAVAILABLE`; live attempt in mock posture → `LEASE_DENIED`; replay conflict → `LEASE_IDEMPOTENCY_CONFLICT`; timeout → `INTEGRATION_TIMEOUT` | Organization-wide taxonomy design beyond run-notification templates |

¹ Optional SKU consolidation in WP-112.

---

## 4. Idempotency key patterns — every operation

Global rules:

1. Lease request uniqueness is **`(tenant_id, idempotency_key)`** per `CONTRACTS_MVO.md` §6.2.
2. **Replay:** Identical `(tenant_id, idempotency_key)` returns original execution outcome without duplicated side-effect.
3. **Conflict:** Same key but materially different canonical arguments → `LEASE_IDEMPOTENCY_CONFLICT`.

Canonical string template:

```text
${tenant_id}:${run_id}:${stage_id}:${capability_id}:${operation}:${stable_scope_segment}
```

`stable_scope_segment` MUST omit volatile timestamps/PATCH bodies; use deterministic hashes (`sha256(normalized_patch)`) where needed.

| Operation group | Stable scope segment |
|-----------------|----------------------|
| `repo.create_from_template` | `app_slug\|template_ref\|workspace_root_hash` |
| `repo.init_local` | `app_repo_digest_pre_init` *(empty marker allowed)* \| `workspace_path_id` |
| `remote.register` | `normalized_remote_url_sha` |
| `commit.apply` | `parents_head_sha\|patch_set_hash` *(LinkSkills stores hash envelope only)* |
| `push.ref` *(future)* | `local_head_sha\|remote_name\|ref_name` |
| `project.scaffold_stub` | `app_slug` |
| `migration.apply_workspace` | `migration_lockfile_digest\|offline_flag` |
| `rls.pack.apply_mock` | `fixture_pack_digest` |
| `readiness.probe` | `tenant_id:${probe_window_floor_ts}` _(floor timestamps per provider policy)_ |
| `catalog.snapshot_mock` | `pricing_tier_set_digest` |
| `price.attach_mock` | `product_mock_id:${currency}` |
| `webhook.endpoint.register_stub` | `endpoint_url_normalized_sha` |
| `build.local_record` | `web_build_bundle_digest` |
| `deploy.trigger_mock` | `preview_subject_hash` |
| `project.link_stub` | `vercel_slug_candidate` |
| `build.skip_placeholder` | `app_slug:mobile_gate` |
| `build.trigger` *(future)* | `eas_platform_profile_digest` |
| `submit.app_store_future` | `release_candidate_tag` *(future)* |
| `project.ensure_mock` | `normalized_project_title` \| `venture_id` |
| `task.ensure_mock` | `normalized_task_title:${issue_group}` \| `normalized_task_body_hash` optional |
| `sprint.track_stub` | `${iteration}:${squad_iteration_scope}` |
| `run.notify` | `run_id:${message_purpose}` |
| `channel.message.mock_send` | `purpose:${deterministic_topic}` |

---

## 5. Failure mapping to §5.4 canonical codes

Baseline minimum (extend but never contradict):

| Situation | Code | `retryable` |
|-----------|------|-------------|
| Malformed slug, missing required arg, mismatched normalized hash vs stored execution | `LEASE_REQUEST_INVALID` | false |
| Policy denial, mocked mode forbids outbound, mobile track disabled while requesting EAS | `LEASE_DENIED` | false² |
| Active kill-switch (tenant/global/op) | `LEASE_KILL_SWITCH` | false |
| Expired lease TTL mid-step | `LEASE_EXPIRED` | true (request new lease) |
| Replay idempotency argument mismatch vs prior execution artifact | `LEASE_IDEMPOTENCY_CONFLICT` | false |
| Secret missing/unauthorized/expired PAT/API key/OAuth refresh failure | `INTEGRATION_AUTH_FAILED` | mostly false³ |
| Provider/network DNS/5xx outages | `INTEGRATION_UNAVAILABLE` | true |
| Outbound/connect timeout | `INTEGRATION_TIMEOUT` | true |
| Unknown capability / operation routing from manifest | `MANIFEST_CAPABILITY_UNKNOWN` / `MANIFEST_INVALID` | false |
| Human approval lacking for gated transition | `POLICY_REQUIRES_APPROVAL` | false |

² Some policy denials MAY become `retryable=true` once kernel UI adds approval completions — default false for spec.  
³ Rotated credential recovery sometimes `retryable=true` after secret refresh lease.

Duplicate provider-specific errors SHOULD map downward into those §5.4 primitives only (`FailureReport.failure_mapping` in capability manifests).

---

## 6. Kill switch requirements

1. **Scope:** Each capability MUST register at least **`capability_kill_switch`** row keyed by `capability_id` with optional **`operation`** sub-scope for asymmetric risk (example: suppress `stripe.webhook.configure` while allowing `stripe.product.fixture`).

2. **Propagation:** Kill-switch trip MUST short-circuit before provider transport dispatch and return **`LEASE_KILL_SWITCH`** (HTTP surfaces mirror `skills.lease.decision.failure` envelope).

3. **Audit:** Emit `security.killswitch.tripped` (or reuse existing LinkSkills killswitch envelope per WP-078) **and** `capability.failed` with `failure.code=LEASE_KILL_SWITCH`.

4. **Visibility:** Tenant operators MUST see killswitch banner in LiNKaios capability health panel referencing last trip reason/time (implementation deferred; requirement stands).

5. **Global escalation:** Support **tenant-level halt** cascading to all LiNKapps external connectors while leaving local mocks running (orthogonal to provider kill-switch).

---

## 7. `not_configured` — explicit exclusions per capability

Items below MUST NOT appear as silently implied responsibilities of WP-112 connector-only packs.

### `cap.github.repo_management`

- Branch protection policies, CODEOWNERS, secrets rotation scheduling, Actions workflow authoring inside customer repos beyond manifest-declared scaffolding hooks.

### `cap.supabase.provisioning`

- Authoring SaaS tenancy pricing, quotas, HIPAA/BA exposure decisions, Postgres extension enablement unrelated to scaffolded template.

### `cap.stripe.product_management`

- Dispute tooling, Radar fraud training, Stripe Tax configuration, Stripe Connect onboarding, revenue recognition workflows.

### `cap.vercel.deployment`

- SSO/SAML enrollment, firewall rules enterprise-only, bespoke edge middleware packages.

### `cap.eas.build`

- Physical device provisioning, MDM rollout, phased release pacing inside App Store Connect (unless handed to human operator artifacts only).

### `cap.plane.execution_tracking`

- Client-facing PM methodology, RACI redesign, SLA legal contract authoring.

### `cap.zulip.run_messaging`

- Stream hierarchy redesign, moderation/bot onboarding for non-Linkapps topics, exporting message archives beyond governed audit slice.

---

## 8. Traceability

- Derived from `LINKAPPS_VERTICAL_PLUGIN_CONVERSION_PLAN.md` §5, `PLUGIN_ARCHITECTURE_V2.md` capability/plugin split, LiNKapps `scripts/create-app-repo.sh` staging behavior, LiNKapps `scripts/release-readiness.sh` deterministic checks posture, `plugins/vertical/linkapps/manifest.yaml` staging + lease posture.
