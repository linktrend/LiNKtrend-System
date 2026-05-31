# WP-074 - LiNKautowork Workflow Template Registry

## Objective

Externalize workflow definitions from code to configurable JSON templates.

## Repo / Branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-074-linkautowork-template-registry`
- Base: `development`

## Allowed Files

- `LiNKautowork/gateway/src/lib/template-registry.ts` (new)
- `LiNKautowork/templates/` (new folder)
- `LiNKautowork/templates/schema.json` (new)
- `LiNKautowork/gateway/src/lib/template-registry.test.ts` (new)

## Prohibited Files

- No removal of existing workflow handlers (additive only)
- No changes to workflow contracts

## Hard Boundaries

- Templates are additive, not replacing code workflows
- Versioned templates (v1, v2 supported simultaneously)
- Dev/staging/prod environment separation

## Required Context

- `LiNKautowork/gateway/src/workflows/index.ts` (current bootstrap)
- WP-070 n8n integration (template loading from n8n)
- n8n workflow JSON format

## Technical Requirements

### Template Schema

```typescript
interface WorkflowTemplate {
  version: '1.0';
  handle: string;
  displayName: string;
  description: string;
  requiresLease: boolean;
  
  // Source
  source: {
    type: 'inline' | 'n8n' | 'file';
    // For 'n8n':
    n8nWorkflowId?: string;
    // For 'file':
    filePath?: string;
    // For 'inline':
    handlerCode?: string; // Base64 encoded TS
  };
  
  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  
  // Environment targeting
  environments: ('development' | 'staging' | 'production')[];
}
```

### Template Registry

```typescript
interface TemplateRegistry {
  // Loading
  loadFromFile(path: string): Promise<WorkflowTemplate>;
  loadFromN8n(workflowId: string): Promise<WorkflowTemplate>;
  loadAllFromDirectory(dir: string): Promise<WorkflowTemplate[]>;
  
  // Registration
  register(template: WorkflowTemplate): void;
  
  // Querying
  get(handle: string, environment: string): WorkflowTemplate | undefined;
  list(environment?: string): WorkflowTemplate[];
  listVersions(handle: string): string[];
  
  // Promotion
  promote(handle: string, fromEnv: string, toEnv: string): Promise<void>;
}
```

### Sample Template

```json
{
  "version": "1.0",
  "handle": "autowork.websitefactory.render",
  "displayName": "WebsiteFactory Render",
  "description": "Renders a website preview bundle",
  "requiresLease": false,
  "source": {
    "type": "file",
    "filePath": "./handlers/websitefactory-render.js"
  },
  "tags": ["websitefactory", "render"],
  "environments": ["development", "staging", "production"]
}
```

## Steps

1. Create template JSON schema
2. Implement `TemplateRegistry` class
3. Create `templates/` directory with sample templates
4. Add template loader to workflow bootstrap
5. Implement promotion workflow (dev→staging→prod)
6. Write tests for template loading and promotion
7. Update agent report

## Acceptance Criteria

- [ ] Template schema validated on load
- [ ] Templates can load from JSON files
- [ ] Templates can reference n8n workflow IDs
- [ ] Template registry lists templates by environment
- [ ] Template promotion copies template between environments
- [ ] Invalid template fails validation with clear error
- [ ] Template changes don't require code deploy

## Proof Required

```bash
# List templates
curl /api/templates
# Returns: [{"handle":"autowork.websitefactory.render",...}]

# Promote template
curl -X POST /api/templates/autowork.websitefactory.render/promote \
  -d '{"from":"development","to":"staging"}'
```

- Test output: `✓ loads template from JSON`, `✓ promotes template to staging`
- Agent report with API examples

## Estimated Effort

4-6 hours (backend-specialist)

## Blockers

- WP-070 (n8n integration) — for n8n template loading

## Related

- `LINKAUTOWORK_COMPLETION_PLAN.md` Gap G7
- Enables no-code workflow modifications
