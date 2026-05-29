# Work Packets

Use this folder only for active or next-wave work packets.

Older packet definitions were moved to `dev-swarm/archive/ai-swarm-embedded-archive/legacy-work-packets-pre-architecture-cleanup/WORK_PACKETS/` because many contain pre-cleanup paths and terminology. They are historical evidence, not current instructions.

New work packets must:

- use `docs/architecture/repo-architecture-target.md` as the ownership map
- put LiNKaios work under `LiNKaios/` or current compatibility code in `LiNKaios/linkaios-web`
- put LiNKbrain work under `LiNKbrain/`
- put LiNKbot work under `LiNKbot/`
- put LinkSkills connector docs/manifests under `LiNKskills/capability-connectors/`
- put modules under `modules/`
- use `.worktrees/<packet-id>` for isolated worktrees
- include proof required and report file to update
- declare dependencies on prior packet branches/commits if any are required
- avoid being scheduled in parallel with packets whose output they need

Do not copy archived packets without updating paths, terminology, and ownership boundaries.

## Completion Handoff

A packet is not complete until its intended files and report are committed on its packet branch, the final commit SHA is recorded in the report, and `git status --short` is clean except for explicitly documented excluded files.

Do not rely on uncommitted worktree-only artifacts for later packets. If a packet produced useful uncommitted output, an Integrator packet must reconcile and commit it before dependent work starts.
