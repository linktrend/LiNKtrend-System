# Architecture rules (non-negotiable)

These boundaries apply to the LiNKtrend AI Agent Ecosystem MVO and all follow-on work unless explicitly superseded by a recorded decision in `DECISIONS.md`.

## Planes of responsibility

- **LiNKaios** is the **organizational execution control plane**.
- **LiNKbrain** is the **institutional memory and learning plane**.
- **LinkSkills** is the **capability governance and capability lease plane**.
- **LiNKautowork** is the **deterministic workflow execution plane**.
- **LinkBot** is the **role-bound AI employee runtime adapter**.

## Coordination vs absorption

- **LiNKaios coordinates the ecosystem** but **must not absorb** the responsibilities of LiNKbrain, LinkSkills, LiNKautowork, or LinkBot.

## LinkBot (thin runtime)

- LinkBot **must remain a thin reasoning/runtime shell**.
- LinkBot **must not own** canonical memory, skills, secrets, or deterministic workflow execution.

## LinkSkills

- LinkSkills **governs capabilities and side effects**.
- LinkSkills **does not own long-term memory**.

## LiNKbrain

- LiNKbrain **records** events, memory, audit, trace, and learning.
- LiNKbrain **does not execute business actions**.

## LiNKautowork

- LiNKautowork **executes deterministic workflows**.
- LiNKautowork **does not make high-judgment decisions**.

## MVO scope

- The **first MVO** is the **LinkSites / WebsiteFactory lead-to-preview-site flow**.

## Delivery principles

- **Reuse existing code** where clearly useful; **do not rebuild** working systems from scratch.
- If an integration **blocks the 7-day target**, **stub it**, **record the stub** (see `INTEGRATION_QUEUE.md` and agent reports), and **continue**.
- **Do not start LEXOS/legal work** until the **WebsiteFactory MVO** works.
