# LiNKguard

LiNKguard is the worker security and cleanup sidecar formerly referred to as PRISM Defender.

See `../docs/architecture/system-completion-targets.md` for the platform completion target.

## Owns

- sidecar heartbeat and health posture
- worker residue cleanup acknowledgement
- filesystem cleanup policy
- runtime guardrails around worker environments
- audit hooks for cleanup and containment events

## Does Not Own

- LinkSkills leases or capability connector permissions
- LiNKbrain memory objects
- LiNKbot role definitions
- LiNKaios mission authority

## Current Migration State

Legacy package implementation now lives in `LiNKguard/sidecar/linkguard`. The package name remains `@linktrend/linkguard` during the transition so build/deploy scripts can keep working while the subsystem is renamed conceptually to LiNKguard.

## Completed-State Target

LiNKguard is operationally complete when worker sessions have cleanup/residue policy, dry-run and live cleanup modes, filesystem safety checks, heartbeat/retention, audit hooks, and operator visibility without taking ownership of memory, skills, or mission authority.
