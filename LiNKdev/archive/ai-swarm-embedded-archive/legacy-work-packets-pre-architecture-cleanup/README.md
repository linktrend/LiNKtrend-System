# Legacy Work Packets Before Architecture Cleanup

This archive preserves old work packet definitions and launch prompts as historical evidence.

Do not use these files as current implementation instructions without updating:

- old `plugins/vertical` paths to `modules/`
- old `LiNKbot/runtime-adapters/openclaw/bot-runtime`, `LiNKbot/communications/temporary-gateways/zulip`, `LiNKguard/sidecar/linkguard`, and `LiNKbot/runtime-adapters/openclaw/openclaw-shim` paths to `LiNKbot/` or `LiNKguard/`
- old product casing to `LiNKbot` and `LiNKbrain`
- old "capability plugin" terminology to "capability connector"

Current agents should start from:

- `docs/architecture/repo-architecture-target.md`
- `.ai-swarm/REPO_INVENTORY.md`
- `.cursor/rules/`
- active files in `.ai-swarm/WORK_PACKETS/` and `.ai-swarm/AGENT_PROMPTS/`
