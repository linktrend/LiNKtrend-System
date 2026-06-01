# LinkSites template registry guidance (LTS-042)

`website_builder_bot` selects templates using LiNKsites registry guidance:

| Industry signal | Template ID |
|-----------------|-------------|
| Professional services | `professional_v1` |
| Local service | `local_service_v1` |
| Retail | `retail_v1` |
| Default | `minimal_v1` |

Structured `website_package` output feeds LiNKautowork `autowork.linksites.artifact_write_local` (LTS-030).

See `LiNKbot/runtime-adapters/openclaw/bot-runtime/src/reasoning-dispatch.ts` — `website_package_generation` mock path.
