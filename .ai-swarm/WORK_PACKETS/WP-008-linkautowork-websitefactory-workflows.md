# WP-008 — LiNKautowork WebsiteFactory workflows

## Objective

Implement deterministic LiNKautowork workflow handles for WebsiteFactory rendering and static/local preview serving.

## Required context

- `.ai-swarm/CONTRACTS_MVO.md` §§6.4, 10, 11.3, 12.5
- `.ai-swarm/INTEGRATION_QUEUE.md` INT-015, INT-022
- `.ai-swarm/DECISIONS.md` D-03, D-07
- `LiNKautowork/gateway/`
- `LiNKsites/apps/web-master`

## Allowed files

- `LiNKautowork/gateway/**`
- workflow template/config files owned by LiNKautowork
- test fixtures under LiNKautowork
- `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`

## Prohibited files

- LiNKaios kernel/UI implementation
- LinkSkills lease implementation except consuming provided `lease_id`
- LinkBot reasoning code
- LiNKbrain schema/writer except emitting agreed audit events
- Real DigitalOcean/Payload publishing, DNS, TLS, external hosting clients

## Dependencies

- Start after WP-005 types are available or keep local types temporary and documented.
- Coordinate with WP-007 for `preview.publish` lease behavior.
- Coordinate with WP-012 for preview artifact storage/route assumptions.

## Tasks

1. Inspect `LiNKautowork/gateway` for existing n8n gateway and workflow-run patterns.
2. Add workflow handle `autowork.websitefactory.render`.
3. Add workflow handle `autowork.websitefactory.preview_serve`.
4. Ensure workflow request/result shapes match `WorkflowInvokeRequest` / `WorkflowInvokeResult`.
5. Emit `workflow.invoked`, `workflow.completed`, `workflow.failed`, and `workflow.compensated` audit events as applicable.
6. Keep workflow deterministic: no lead scoring, copy generation, template judgment, or capability decisions.
7. Update `.ai-swarm/AGENT_REPORTS/linkautowork-agent.md`.

## Acceptance criteria

- Render workflow accepts `render_spec` and returns `preview_artifact_ref`.
- Preview serve workflow accepts artifact reference and returns a route-compatible `preview_url`.
- Side-effecting publish path requires a `lease_id`.
- Compensation behavior is explicit for partial render/serve failures.

## Required proof

- Test/smoke command output showing workflow invocation and result.
- Agent report lists workflow handles, inputs/outputs, and audit events emitted.

## Out of scope

LLM copy generation, LinkSkills policy, LiNKaios route implementation, real DigitalOcean/Payload publishing.
