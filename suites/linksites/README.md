# LinkSites Module

LinkSites is the WebsiteFactory lead-to-preview-site module and the first MVO.

Current implementation still lives partly in `LiNKaios/linkaios-web/src/lib/suite-integrations/websitefactory` and `LiNKautowork/gateway/src/workflows/*websitefactory*`. This folder is the canonical module home for manifests, module docs, UI surfaces, stage declarations, and compatibility exports as migration proceeds.

## Capability connectors (LTS-013)

LinkSites suite connectors are declared in `LiNKskills/capability-connectors/linksites/manifest.ts` with YAML contracts under `LiNKskills/capability-connectors/cap.*.yaml`. Runtime surfaces: `createLinksitesSuiteCapabilityRuntime()` in `linksites-suite-defaults.ts` (mock/shadow MVO; lease + audit required).
