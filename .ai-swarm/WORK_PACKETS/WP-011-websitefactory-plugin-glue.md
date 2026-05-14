# WP-011 — WebsiteFactory plugin declaration and stage glue

## Objective

Implement the WebsiteFactory plugin declaration and stage-handler glue that lets LiNKaios orchestrate the lead-to-preview flow without putting WebsiteFactory business logic into the kernel.

## Required context

- `.ai-swarm/LINKAIOS_KERNEL_MANIFEST.md`
- `.ai-swarm/CONTRACTS_MVO.md` §§1.4, 2, 10, 12.2
- `.ai-swarm/DECISIONS.md` D-03, D-07
- `apps/linkaios-web`
- `LiNKsites/apps/web-master`

## Allowed files

- WebsiteFactory plugin declaration/glue location chosen by WP-010
- `apps/linkaios-web/**` only for plugin registration and thin preview panel integration
- tests for the plugin glue
- `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`

## Prohibited files

- Kernel orchestration internals beyond consuming WP-010 extension points
- LinkBot reasoning internals
- LinkSkills lease implementation
- LiNKautowork workflow bodies
- LiNKbrain audit persistence
- Full Payload CMS publish, Vercel deploy, DNS, outbound email

## Dependencies

- Start after WP-010 defines the plugin registration/dispatch extension points.
- Coordinate with WP-009 for reasoning outputs and WP-008 for render/preview workflow outputs.

## Tasks

1. Implement the WebsiteFactory plugin manifest declaration with canonical fields from WP-003/WP-004.
2. Register `websitefactory.lead_to_preview` with the LiNKaios kernel.
3. Implement stage-handler glue that delegates:
   - reasoning stages to LinkBot
   - side-effect capabilities to LinkSkills
   - deterministic render/serve stages to LiNKautowork
   - audit writes to LiNKbrain through the agreed envelope
4. Implement preview panel/read-view wiring only as thin display of `PreviewOutput`.
5. Add tests or smoke proof that the plugin declares all required capabilities, workflows, audit events, and non-goals.
6. Update `.ai-swarm/AGENT_REPORTS/linkaios-agent.md`.

## Acceptance criteria

- WebsiteFactory can be loaded as a plugin and does not require kernel code changes for its stage list.
- Plugin does not own approvals, trace, run state, leases, memory, workflows, or secrets.
- Stage names and output names match `CONTRACTS_MVO.md`.
- Preview output uses static/local route per D-03.

## Required proof

- Test/smoke output showing plugin registration and manifest validation.
- Agent report includes role-bleed self-check.

## Out of scope

General plugin marketplace, second verticals, LEXOS/legal work, full WebsiteFactory product features, real external publishing.
