# LinkSites autowork handles (LTS-030+)

Deterministic LiNKautowork workflow handles for the LinkSites MVO path. Implemented in `LiNKautowork/gateway/src/workflows/linksites-v2.ts` and registered via `bootstrapWebsiteFactoryWorkflows`.

| Handle | Issue | Lease required |
|--------|-------|----------------|
| `autowork.linksites.artifact_write_local` | LTS-030 | no |
| `autowork.linksites.supabase_mirror_upsert` | LTS-031 | yes |
| `autowork.linksites.payload_sync_local` | LTS-032 | yes |
| `autowork.linksites.preview_readiness_check` | LTS-033 | no |
| `autowork.linksites.crm_ready_to_contact_mark` | LTS-034 | yes |

Integration tests: `LiNKautowork/gateway/src/workflows/linksites-v2.test.ts`.
