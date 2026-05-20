# Handoff: next tasks until deployment

**Purpose:** Pick up here after a break. When everything below is done, the **next phase is deployment** (VPS/Mac, env, Compose, LiNKaios hosting), not more feature coding unless something blocks rollout.

**Glossary (plain English)**

- **One agent** = modified **fork** + **Zulip plugin** (engine side) + **LiNKtrend Plugin** (three apps from this monorepo: `bot-runtime`, `zulip-gateway`, `PRISM-Defender`) + that agent’s **secrets and disk volumes**.
- **LiNKtrend Plugin** = those three services, shipped together (same version, one Compose stack or equivalent). Not the same thing as “code inside the fork,” but it **talks to** the fork and to **LiNKaios / Supabase**.
- **LiNKaios** stays a **separate deployment** from each agent (usually always-on on a VPS). **Supabase** stays hosted as you already do.

---

## Task list (do in this order)

### 1. Verify the monorepo (`pnpm`)

From the repo root, run the full check so you know the tree is green before anything else:

- `pnpm install`
- `pnpm build`
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`

Fix anything that fails. This is the **engineering gate** for this repository.

---

### 2. Build the LiNKtrend Plugin (as a deployable bundle)

**Goal:** One repeatable way to run **bot-runtime + zulip-gateway + prism-defender** for **one agent**, without needing the whole developer laptop setup.

**Done in-repo (baseline):**

- Dockerfiles under **`deploy/docker/`** (turbo prune + `pnpm` build + slim runtime). LiNKaios uses **Next.js `output: "standalone"`** for a smaller server image.
- **`docker-compose.linktrend.yml`** at the **repo root** (four services: LiNKaios + three plugin apps; ports **3000** and **8790** exposed). Run from repo root so **`.env`** is used for Compose substitution (including **`NEXT_PUBLIC_*` at build time** for LiNKaios).
- Operator docs: **`deploy/README.md`** and **`deploy/FRIEND-LINKTREND-PLUGIN.md`**.

**You still do when you cut per-agent stacks:** pin **git tags** (monorepo + fork) per release; duplicate or parameterise Compose for **each agent** (ports/env/volumes); add **volume mounts** for PRISM residue roots if you enable FS cleanup.

---

### 3. UI/UX review and changes (LiNKaios)

Walk the product as an operator: flows, copy, empty states, LiNKbrain / workers / settings. Implement the changes you care about for a credible review pass.

---

### 4. Verify the monorepo again (`pnpm`)

After UI changes, run the same commands as **step 1** so regressions are caught before database prep, hardening, and fork work.

---

### 5. Supabase / database readiness (per environment)

Do this for **each** Supabase project you will use (e.g. staging vs production):

- Apply **migrations** (or `ALL_IN_ONE.sql` for a fresh project) so schema matches this repo.
- In the Supabase dashboard, set **PostgREST exposed schemas** so the app can use `.schema("linkaios")` and the other product schemas (see root `README.md`).
- If the direct DB host fails from **IPv4-only** networks, use the **session pooler** URI from the dashboard (**Connect** → session mode) for `DATABASE_URL` / tooling.

---

### 6. Security hardening (platform and plugin)

Examples of what “hardening” means here (adjust to your threat model):

- Supabase: **RLS**, least-privilege keys, rotate any credential that was ever pasted into chat or a ticket.
- LiNKaios: auth boundaries, sensitive **internal** API routes locked down, rate limits where it matters.
- **Background / internal jobs** (e.g. brain embed worker, librarian): production **secrets**, **allowlists**, who can call them, and how they are **scheduled or triggered** — easy to forget until nothing runs in prod.
- LiNKtrend Plugin: no secrets in logs, tight env for PRISM (roots only where intended), timeouts aligned with `bot-runtime` / gateway.
- Remove **`openclaw-shim`** from the path you treat as “real”: after UI/UX is acceptable, **before** serious production testing — point `OPENCLAW_AGENT_RUN_URL` at the **real fork** ingress instead.

---

### 7. LiNKaios control plane for real use

Before or as you cut over to a shared/staging/prod LiNKaios deployment:

- Turn off **synthetic UI mocks** / demo fixtures (`LINKAIOS_UI_MOCKS` and similar) for any environment that is not purely local dev.
- Set **bootstrap admin emails** (or equivalent) if you rely on first-access to `/settings/access`.
- **Plan** (or execute in the deployment phase): **TLS**, **domain/DNS**, and **backups** for LiNKaios and the database.

---

### 8. Integrate on the fork side

**Goal:** The modified fork + Zulip engine plugin accepts what this platform sends (especially **`linktrendGovernance`** on the gateway **`agent`** path — **not** assuming stock `/hooks/.../agent` is enough unless you changed it).

Checklist-style:

- Fork accepts **`OPENCLAW_AGENT_RUN_URL`**-style POST body (or your proxy) and forwards **`linktrendGovernance`** into the engine.
- **LiNKaios “brain” integration:** base URL and **secrets** the fork/plugin uses for published/retrieve (or other documented APIs) — align with `docs/linkbrain-openclaw-plugin-integration-spec.md` and env practice (no secrets in git).
- **Zulip plugin** on the fork works with your **real Zulip server** credentials.
- **`zulip-gateway` topology:** decide and document **one shared gateway** for several agents vs **one gateway per agent**, and match Zulip webhook URLs / firewall rules to that choice.
- End-to-end smoke: **LiNKtrend Plugin** + **fork** against **staging LiNKaios / Supabase** (or production if that is your only environment — your call).

---

### 9. Optional follow-up (not required to “finish” the handoff list)

- **`runtime_settings`:** LiNKaios already stores model picks and caps in the DB; **wiring that into the fork/worker** so runtime behaviour matches the UI is separate product work — schedule if you want automatic alignment.

---

## After the above: deployment phase (next document, not this list)

When steps **1–8** are done, the **next part** is **deployment**, not more of this handoff list:

- Where **LiNKaios** runs (VPS, TLS, backups).
- Where each **agent stack** runs (VPS, Mac mini, count of agents).
- Secrets distribution per agent, monitoring, upgrades (new image tag for LiNKtrend Plugin + fork).

Write a separate short **runbook** when you start that phase (hosts, ports, DNS, one env file per agent).

---

## Order summary

**pnpm → LiNKtrend Plugin bundle (with versions + friend checklist) → UI/UX → pnpm → Supabase per env → security hardening → LiNKaios real-use toggles → fork integration (governance, brain URLs/secrets, Zulip, gateway topology) → optional `runtime_settings` wiring → deployment runbook.**

Saying “build plugin” before the first `pnpm` is only fine for **planning**; **building images** should sit on top of a **green** monorepo (**step 1** first).
