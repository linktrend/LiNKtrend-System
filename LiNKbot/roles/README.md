# LiNKbot Roles

Roles define what a LiNKbot is allowed and expected to do.

## Shared Roles

Shared roles live under `shared/`. Examples:

- CEO
- COO
- Finance Agent
- Legal Agent
- Product Owner
- Resource Agent
- DevOps Engineer
- QA Automation Engineer

## Suite Roles

Suite-specific roles live under `LiNKbot/roles/suites/<suite>/`. Examples:

- LEXOS Litigation Librarian
- LinkSites Website Strategist
- Linktrend Media Content Producer
- LiNKapps Technical Lead

## Role Definition Contents

A role definition should include:

- purpose
- responsibilities
- allowed suites and suite modules
- allowed capabilities (LinkSkills capability connectors)
- allowed skills and tools
- memory/context rules
- model/runtime profile
- engine-specific identity/persona/soul files if needed
- LiNKguard security profile
- channel permissions
- audit events
