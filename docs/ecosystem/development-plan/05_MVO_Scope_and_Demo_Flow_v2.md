# MVO Scope And Demo Flow v2

## MVO Goal

The first MVO proves the LinkSites / WebsiteFactory lead-to-preview-site flow.

This is the first internal proof of the entire ecosystem.

## Demo Story

An operator opens LiNKaios and starts a WebsiteFactory mission:

```text
Find a potential SMB lead and create a preview website for outreach.
```

The assigned LinkBot acts as Website Scout / Studio Manager.

For the first MVO, the lead source should be seed CSV or approved provider/API. Do not build direct Google Maps scraping into the first demo.

The bot selects a business with weak/no website, such as a restaurant.

The bot uses LiNKbrain to retrieve tenant context, industry website patterns, prior template performance, and outreach examples.

The bot requests capabilities from LinkSkills.

LinkSkills issues short-lived capability leases.

LiNKautowork executes deterministic workflow steps.

LiNKsites/Payload CMS or the existing template stack creates/publishes the preview site.

CRM and Plane records are created, or stubbed with local tables if real integration would block the 7-day sprint.

LiNKbrain records all events.

LiNKaios displays the trace.

## Required Result

At demo time, the operator should see:

- selected lead
- industry/category
- selected template
- generated preview site URL
- generated outreach email draft
- CRM record or MVO CRM stub
- Plane project/tasks or MVO Plane stub
- LinkBot run
- LinkSkills capability leases/runs
- LiNKautowork workflow run
- LiNKbrain events/memory
- unified trace in LiNKaios

## Day-1 Frozen Decisions

The following must be decided before implementation agents start:

1. Lead source: seed CSV for MVO.
2. CRM: real Chatwoot/Odoo or local CRM table.
3. Plane: real Plane API or local project/task table.
4. Preview: LinkSites/Payload, static local preview, or Vercel preview.
5. OpenClaw source: current `LiNKbot-core` unless repo comparison proves otherwise.
6. Supabase: remote Supabase preferred unless local Postgres is already easier.
7. Model routing: OpenRouter first unless existing LiteLLM is ready.
8. LinkSites template: `LiNKsites/apps/web-master` unless repo inspection finds a better starter.

## MVO Non-Goals

Do not send real outreach email. Draft only.

Do not process payments.

Do not build full CRM/Plane integrations if stubs unblock the demo.

Do not build full cross-tenant intelligence.

Do not build all WebsiteFactory templates.

Do not polish public SaaS UI.

## Simple Example

A restaurant called “Bella Taipei Pasta” appears in the seed lead list. The LinkBot identifies it as a restaurant, selects the restaurant template from the LinkSites template stack, generates local Italian restaurant copy, picks suitable stock or placeholder food images, changes the look-and-feel to a bistro style, publishes a preview URL, creates a CRM lead, creates a Plane project with follow-up tasks, drafts an outreach email, and records the full trace.
