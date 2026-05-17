# LinkSites Completion Plan

## Definition of Completion
LinkSites will be considered "structurally complete" (MVO achieved) when the remaining work transitions from **platform plumbing** (capabilities, workflows, sync processes) to **content creation** (adding new industry-specific templates, refining copy prompts, adding stock media assets). The system must end-to-end process a mock lead into a local Payload-backed preview website with deterministic checks and CRM status promotion.

## Inspected Context
- **Repos:** `/Users/linktrend/Projects/LiNKtrend-System`, `/Users/linktrend/Projects/LiNKsites`
- **Files:** `CONTRACTS_MVO.md`, `LINKSITES_VERTICAL_MVO_V2.md`, `LINKSITES_TEMPLATE_PAYLOAD_DISCOVERY.md`

## Structural Plumbing vs. Content Work

### 1. Structural Plumbing (To Be Completed)
These remaining tasks focus on wiring the data and execution boundaries defined in v2:

- **Artifact Storage:** Implementing the `autowork.linksites.artifact_write_local` workflow to store the generated structured website package locally.
- **Supabase & Payload Alignment:** Wiring the `autowork.linksites.supabase_mirror_upsert` and `autowork.linksites.payload_sync_local` workflows to persist generated data and make it available to the CMS.
- **Preview & Checks:** Ensuring the `web-master` frontend is served and validated by the `autowork.linksites.preview_readiness_check` workflow.
- **Template Registry Integration:** Exposing the `src/templates/registry.ts` available templates to the `WebsiteBuilderBot` for selection.

### 2. Content & Template Work (Future / Ongoing)
Once plumbing is complete, ongoing work will scale horizontal capabilities:

- Creating new industry templates in `/Users/linktrend/Projects/LiNKsites/apps/web-master/src/templates/` beyond `marketing-smb-v1`.
- Enhancing Payload content blocks and React components to support richer designs.
- Improving LinkBot reasoning prompts for better copy and media placement.

## Concrete Gaps & Follow-up Packets

Based on the v2 architecture and WP-042 discovery, the following gaps require execution packets:

1. **WP-084: Local Artifact Storage Implementation**
   - **Goal:** Implement `autowork.linksites.artifact_write_local` to save the `WebsiteBuilderBot`'s `website_package` to the local filesystem.
2. **WP-085: Supabase Mirror Upsert & Payload Sync**
   - **Goal:** Implement the `supabase_mirror_upsert` and `payload_sync_local` workflows based on the schemas found in `cms-mapping.json` and `lsites_core.schema.json`.
3. **WP-086: Frontend Preview & Deterministic Checks**
   - **Goal:** Implement `autowork.linksites.preview_readiness_check` to validate required pages and content against the live `web-master` local instance.
4. **WP-087: Template Registry Hookup**
   - **Goal:** Surface the templates defined in `LiNKsites/apps/web-master/src/templates/registry.ts` as searchable context for `WebsiteBuilderBot`'s `template_id` selection.

## Blockers
- No immediate blockers identified. Discovery in WP-042 successfully located the required target files in `LiNKsites`.
