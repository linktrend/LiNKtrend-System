# WP-004 — MVO contracts

## Objective

Author **`CONTRACTS_MVO.md`** content for the **lead-to-preview-site** slice: cross-service contracts, events, error codes, idempotency rules, and stub behaviors — consistent with frozen Day-1 decisions.

## Prerequisites

- WP-002 complete enough that preview publishing and persistence mode are not ambiguous **or** explicitly stubbed with documented behavior.
- WP-003 defines the LiNKaios kernel/plugin manifest, WebsiteFactory as the first vertical plugin example, and the stage list that contracts must bind to.

## Tasks

1. Replace placeholder sections in `CONTRACTS_MVO.md` with concrete prose contracts (tables allowed) based on the WP-003 LiNKaios kernel/plugin manifest.
2. Define **minimum audit events** LiNKbrain must receive for a successful run vs a failed run (tie to `DECISIONS.md` audit row).
3. Define **LinkSkills** checks for any side effect (e.g., deploy, DNS, billing-adjacent hooks) — or mark as **not invoked in MVO**.
4. Define **LiNKautowork** workflow boundaries: start, step transitions, completion, compensation (if any).
5. Define **LinkBot** involvement as **delegating** calls only; list forbidden ownership explicitly.
6. Define what contract surfaces belong to **LiNKaios core/kernel** versus the **WebsiteFactory plugin declaration**.

## Acceptance criteria

- [ ] `CONTRACTS_MVO.md` has no remaining *TBD* placeholders **or** each *TBD* is replaced with a **STUB** block that includes behavior + limitations + owner.
- [ ] Contracts reference plane boundaries verbatim where helpful (short quotes, not duplication of entire rules doc).
- [ ] `INTEGRATION_QUEUE.md` updated for any contract-driven integration work.

## Required proof

- Final `CONTRACTS_MVO.md` section headings listed in agent report **Tests / Proof** with note “ready for implementation planning”.
- `DECISIONS.md` updated if contract work reveals a new fork.

## Out of scope

Writing or modifying application source to satisfy contracts.
