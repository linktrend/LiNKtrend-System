# Work Packets

Use this folder only for active or next-wave work packets.

Older packet definitions were moved to `.ai-swarm/archive/legacy-work-packets-pre-architecture-cleanup/WORK_PACKETS/` because many contain pre-cleanup paths and terminology. They are historical evidence, not current instructions.

New work packets must:

- use `docs/architecture/repo-architecture-target.md` as the ownership map
- put LiNKaios work under `LiNKaios/` or current compatibility code in `LiNKaios/linkaios-web`
- put LiNKbrain work under `LiNKbrain/`
- put LiNKbot work under `LiNKbot/`
- put LinkSkills connector docs/manifests under `LiNKskills/capability-connectors/`
- put modules under `modules/`
- use `.worktrees/<packet-id>` for isolated worktrees
- include proof required and report file to update

Do not copy archived packets without updating paths, terminology, and ownership boundaries.
