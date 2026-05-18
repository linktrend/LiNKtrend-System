# LinkSites Module LiNKbot Roles

Per CONTRACTS_MVO.md §0.A.4 - LinkSites v2 LiNKbot role contract pack.

## Roles

### lead_scout_bot

**Status: DECLARED BUT DISABLED IN MVO**

Future role for discovering leads and creating/enriching CRM records.
- MVO: Disabled, mock input only
- Outputs: lead_record_ref from mock/local substitution
- No live acquisition or public scraping

### research_enrichment_bot

**Status: ENABLED IN MVO**

Researches the lead and comparable businesses; produces provenance-backed enrichment bundle.
- Inputs: lead_record_ref, lead_input business facts
- Outputs: lead_research_bundle (facts + comparables + citations)
- Allowed capabilities: cap.research.public_web, cap.zulip.run_messaging

### website_builder_bot

**Status: ENABLED IN MVO**

Selects template guidance from LiNKsites and produces business-specific website package.
- Inputs: lead_record_ref, lead_research_bundle, template_id
- Outputs: website_package (copy bundle, media plan, style proposal)
- Allowed capabilities: cap.asset.generation, cap.research.public_web

### outreach_bot

**Status: DECLARED BUT DISABLED IN MVO**

Future role for client outreach.
- MVO: Disabled, no draft or send
- No external contact capability

## Development-Mode Restrictions

Per CONTRACTS_MVO.md §0.A.4:
- lead_scout_bot: disabled_in_mvo, mock_input_only
- research_enrichment_bot: research_read_only, provenance_required
- website_builder_bot: local_artifact_target_only, no_direct_publish
- outreach_bot: disabled_in_mvo, no_outreach_draft, no_outreach_send
