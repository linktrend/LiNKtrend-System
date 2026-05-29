# WP-087 - LinkSites Template Registry Hookup

## Objective
Surface the `LiNKsites` master template registry to the `WebsiteBuilderBot` reasoning phase.

## Recommended Model/Tool
Antigravity Gemini 3.1 Pro Low or Cursor.

## Context
The `WebsiteBuilderBot` needs to know which templates are available to guide its content generation. WP-042 discovered `apps/web-master/src/templates/registry.ts` as the canonical source.

## Requirements
1. Implement a local discovery mechanism (or build step) that surfaces `registry.ts` template slugs and schemas to the LiNKaios kernel context.
2. Feed these available `template_id`s to the `WebsiteBuilderBot` inputs during its reasoning dispatch.
3. Validate that `WebsiteBuilderBot` output `template_id` matches an existing slug.

## Allowed Files
- `apps/linkaios-kernel/src/services/template_discovery.ts` (or similar)
- `apps/linkaios-kernel/src/bots/website_builder_bot.ts`

## Prohibited
- Do not modify the `LiNKsites` registry itself in this packet.
