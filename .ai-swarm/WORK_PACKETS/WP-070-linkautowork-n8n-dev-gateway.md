# WP-070 - LiNKautowork n8n Dev Gateway Integration

## Objective

Connect LiNKautowork to n8n for external workflow template execution in development mode.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-070-linkautowork-n8n-dev-gateway`
- Base: `development`

## Allowed Files

- `LiNKautowork/gateway/src/lib/n8n-client.ts` (new)
- `LiNKautowork/gateway/src/lib/n8n-webhook-handler.ts` (new)
- `LiNKautowork/gateway/src/workflows/n8n-executor.ts` (new)
- `LiNKautowork/docker-compose.n8n.yml` (new)
- `LiNKautowork/gateway/src/lib/n8n-client.test.ts` (new tests)

## Prohibited Files

- No production n8n configuration
- No production credentials or secrets
- No modifications to contract types

## Hard Boundaries

- Local/Docker n8n only (no production deployment)
- Development mode workflows only
- Mock webhooks acceptable for MVO

## Required Context

- `CONTRACTS_MVO.md` §6.4 (LiNKaios ↔ LiNKautowork contract)
- n8n API documentation: https://docs.n8n.io/api/
- Existing workflow runner in `workflow-runner.ts`

## Technical Requirements

### n8n Configuration

```yaml
# docker-compose.n8n.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=localdev
      - WEBHOOK_URL=http://localhost:5678/
```

### n8n Client Interface

```typescript
interface N8nClient {
  // Workflow management
  importWorkflow(templateJson: object): Promise<{ workflowId: string }>;
  activateWorkflow(workflowId: string): Promise<void>;
  
  // Execution
  executeWorkflow(
    workflowId: string,
    payload: Record<string, unknown>
  ): Promise<{ executionId: string; result?: unknown }>;
  
  // Webhooks (for async callbacks)
  registerWebhookHandler(
    path: string,
    handler: (result: unknown) => Promise<void>
  ): void;
  
  // Health check
  checkHealth(): Promise<boolean>;
}
```

### Integration Point

In `workflow-runner.ts`, add a mode check:
- If `process.env.AUTOWORK_MODE === 'n8n'` → dispatch to n8n
- Else → run in-process handler (current behavior)

## Steps

1. Create `docker-compose.n8n.yml` for local n8n
2. Implement `N8nHttpClient` class
3. Create webhook handler for async callbacks
4. Add n8n execution mode to workflow runner
5. Export sample workflow template (JSON)
6. Write integration tests with mocked n8n API
7. Update agent report

## Acceptance Criteria

- [ ] `docker-compose.n8n.yml` starts n8n locally
- [ ] n8n API client connects and authenticates
- [ ] Workflow template can be imported to n8n
- [ ] `invokeWorkflow` dispatches to n8n when `AUTOWORK_MODE=n8n`
- [ ] Webhook callback updates run status
- [ ] Audit events emitted: `workflow.invoked`, `workflow.completed`/`failed`
- [ ] Health check endpoint verifies n8n connectivity

## Proof Required

- n8n container running: `docker ps` shows n8n
- Workflow import successful: screenshot or API response
- Test output: `✓ dispatches to n8n and receives callback`
- Agent report with Docker commands used

## Estimated Effort

4-6 hours (backend-specialist)

## Blockers

- Requires Docker/Docker Compose for local testing
- May need n8n API key (local development only)

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G3
- WP-074 (Template Registry) depends on this
