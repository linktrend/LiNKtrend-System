# Pending migrations — apply together

Do **not** apply these individually during feature work. Run as one batch when the related UI/backend work is complete.

| Migration | Purpose | Status |
|-----------|---------|--------|
| `032_brain_virtual_file_memory_tags.sql` | `memory_tags` jsonb on `linkaios.brain_virtual_files` | **Applied** 2026-05-22 |
| *(planned)* `033_linkskills_capability_catalog.sql` | Persist licensor-registered capability connectors | Pending |
| *(planned)* `034_linkskills_tenant_catalog_policy.sql` | Per-tenant skill/tool enablement | Pending |
| *(planned)* `035_linkskills_catalog_requests.sql` | Licensee request queue → Work inbox | Pending |
| *(planned)* `036_support_tickets.sql` | Support tickets queue (Chatwoot sync) | Pending |

## Apply command (when ready)

From repo root, against the target Supabase project:

```bash
# Example — adjust connection/profile to your environment
for f in services/migrations/032_brain_virtual_file_memory_tags.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

Update this list before the batch apply.
