# Risks, Decisions, And Stubs v2

## Main Risk — Timeline

Seven days is aggressive. Plan 21, execute for 7. Use stubs to keep the flow moving.

## Main Risk — Integration Bottleneck

The hard part is not coding isolated services. The hard part is connecting existing systems.

Mitigation: prioritize contracts, trace, and one demo flow.

## Main Risk — Old Code Ambiguity

Existing code may be useful but inconsistent.

Mitigation: wrap existing code; do not do large rewrites.

## Main Risk — LiNKbot Adapter

OpenClaw integration may take longer than expected.

Mitigation: create a thin adapter or mission-runner wrapper first. Do not refactor all of OpenClaw.

## Main Risk — CRM/Plane

Real integrations may block the flow.

Mitigation: stub with local tables if needed, but keep the interface compatible with real Chatwoot/Plane later.

## Main Risk — Preview Publishing

Real publishing may block the flow.

Mitigation: static/local preview is acceptable for Day 7 if a URL or artifact is available.

## Main Risk — LiNKbrain Service Missing

Archive schema exists but HTTP service may not.

Mitigation: create the thinnest FastAPI/Node service around the archived schema.

## Main Risk — LinkSkills Endpoint Gap

Existing logic-engine may not expose exact disclosure/run endpoints.

Mitigation: add thin endpoints over existing catalog logic.

## Main Risk — LiNKautowork Overcomplexity

Gateway exists and may be more sophisticated than needed.

Mitigation: use its existing MVO path; do not expand governance.

## Stubbing Rules

Stub only when a real integration blocks the 7-day target.

Acceptable stubs:

- CRM local table
- Plane local table
- preview static folder
- lead seed CSV
- simplified policy response
- simple context bundle
- mock image selection

Unacceptable stubs:

- fake success without trace
- no audit event
- no capability lease
- no memory write
- no visible LiNKaios status

## Decisions Required Day 1

- CRM real or stub
- Plane real or stub
- preview target
- OpenClaw source
- Supabase remote/local
- LinkSites template source
- model routing provider
- audit event contract
