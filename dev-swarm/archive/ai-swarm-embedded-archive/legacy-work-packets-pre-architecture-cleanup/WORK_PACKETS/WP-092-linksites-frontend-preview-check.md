# WP-092 - LinkSites Frontend Preview & Deterministic Checks

## Objective
Implement `autowork.linksites.preview_readiness_check` and `autowork.linksites.crm_ready_to_contact_mark`.

## Recommended Model/Tool
Antigravity Gemini 3.1 Pro Low or Cursor.

## Context
After syncing Payload, the local `web-master` frontend should display the generated site. We must verify its required pages, navigation, media references, and provenance, then update the CRM.

## Requirements
1. Implement `autowork.linksites.preview_readiness_check` per the WP-041/v2 contract.
2. It must accept deterministic inputs for expected pages/content and return the readiness status and `failed_checks[]`.
3. Implement `autowork.linksites.crm_ready_to_contact_mark` requiring a LinkSkills `lease_id`.
4. Ensure the CRM mark workflow fails if `checks_passed` is false.

## Allowed Files
- `packages/linklogic-sdk/src/workflows/linksites.ts`
- `apps/linkautowork/src/workflows/linksites/preview_readiness_check.ts`
- `apps/linkautowork/src/workflows/linksites/crm_ready_to_contact_mark.ts`

## Prohibited
- Do not implement custom UI.
