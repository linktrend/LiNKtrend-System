# LinkSites Vertical Plugin MVO v2

**Status:** Approved design direction for the revised MVO.
**Replaces:** The earlier static/local lead-to-preview proof as the current roadmap target.

## MVO Boundary

The LinkSites MVO proves the full website factory workflow in development mode.

In scope:

- mock CRM lead data
- LiNKbot research and enrichment
- industry template selection from `LiNKsites`
- generated website copy, media plan, and style changes
- governed public web research with provenance
- governed generated images/videos with provenance and audit
- local generated artifact folder that mimics future artifact storage
- Supabase mirror update
- LiNKautowork sync from Supabase to real local Payload CMS
- preview-ready website display through existing/local frontend
- deterministic checks
- CRM/mock lead status update to `ready_to_contact`
- Zulip run notifications and LiNKbot/operator work-channel messages
- Plane internal execution tracking plus future client/project scaffold, mock/shadow by default

Out of scope for this MVO:

- autonomous real lead acquisition
- real client outreach
- real VPS deployment
- customer domain, DNS, TLS, or production hosting
- inventing Payload CMS schema or Supabase mirror schema
- writing generated artifacts to Git repos
- public outreach email/message send

## Development vs Production Artifact Storage

In development mode, generated website artifacts are written to a local generated-artifact folder.

In production, this artifact store becomes cloud cold storage such as Google Drive or an equivalent durable archive. It is not the live website host; it is the versioned artifact archive for generated site outputs.

## Target Flow

1. CRM/mock lead exists with business facts and any prior research.
2. Lead Scout role is present but real acquisition is disabled.
3. Research/Enrichment Bot reads the CRM lead, performs governed public research, records provenance, and enriches lead context.
4. Website Builder Bot finds the master/industry template in `LiNKsites`, uses it as a guide, writes business-specific copy, proposes media/style changes, and creates a structured website package.
5. Generated artifacts are written to the local generated-artifact folder.
6. Structured website content and asset references are written to the Supabase mirror.
7. LiNKautowork publishes/syncs Supabase content into real local Payload CMS.
8. Existing/local frontend reads from Payload and displays the preview-ready site.
9. LiNKautowork deterministic checks validate required pages, navigation, content blocks, media references, provenance, Payload sync status, and preview readiness.
10. If checks pass, CRM/mock lead status is set to `ready_to_contact`.
11. Outreach Bot role exists, but real outreach execution is disabled.

## LiNKbot Roles

Recommended v1 roles:

- **Lead Scout Bot:** future role for discovering leads and creating/enriching CRM records. Disabled in MVO; mock CRM data supplies its output.
- **Research/Enrichment Bot:** researches the specific lead and comparable businesses, records provenance, and prepares research context.
- **Website Builder Bot:** selects template guidance, writes copy, plans media, proposes style changes, and produces the structured website package.
- **Outreach Bot:** future role for client outreach. Present in the workflow contract but disabled in MVO; no outreach draft or send for v1.

Quality control starts with deterministic LiNKautowork checks. A separate QA Bot is deferred until deterministic checks expose a need for judgment review.

## Required Capability Plugins

Version 1 requires:

- **Odoo/CRM shadow-readiness:** local/mock writes for lead status, with Odoo readiness/shadow checks behind config.
- **Payload CMS:** local Payload sync/publish connector; no schema invention.
- **Supabase mirror/content:** structured website content and asset references; schema copied/adapted from existing source.
- **Zulip:** run notifications plus LiNKbot/operator work-channel communication.
- **Public web research:** governed read-only public research with citations/provenance.
- **Asset generation:** governed generated media with provenance/audit.
- **Plane:** internal execution tasks plus future client/project scaffold, mock/shadow by default.

## Data And Storage Flow

`CRM lead record -> LiNKbot research/enrichment -> generated website package -> local artifact folder in dev / cloud cold storage in prod -> Supabase mirror -> Payload CMS -> website frontend preview`

CRM holds lead and business facts. LiNKbot enrich and generate the website package. Artifact storage keeps a durable copy of generated outputs. Supabase is the operational mirror/update layer. LiNKautowork syncs Supabase content into Payload. Payload is the CMS source for what the website frontend displays. The frontend reads from Payload and shows the preview-ready site.

## Site Identity Recommendation

Use one canonical `site_id` per business/lead record, with each run creating a versioned `site_generation_run_id`.

Reasoning:

- avoids creating a new logical site for every retry
- supports version history
- lets future CRM/Odoo and Plane records point to the same site
- supports later production deployment without changing identity

## Discovery Requirements

Before implementation, agents must discover:

- where the master Payload-linked template lives inside `/Users/linktrend/Projects/LiNKsites`
- how the current Payload CMS schema is represented
- whether the Supabase mirror schema already exists and where it lives
- how the local Payload CMS boots
- which frontend reads from Payload for preview display

Agents must not invent these pieces if they already exist.
