# Installed LiNKdev template

| Field | Value |
|-------|-------|
| Template repo | https://github.com/linktrend/LiNKdev |
| Version | 1.1.0 (target) |
| Tag | v1.1.0 |
| Installed in | LiNKtrend-System (deployed instance) |
| Registry | Listed in [linktrend/LiNKdev `registry/installations.json`](https://github.com/linktrend/LiNKdev/blob/main/registry/installations.json) |

**Auto-sync:** When LiNKdev tags `v*`, the template repo workflow pushes factory + skills + `.cursor` shim here (`LiNKdev/product/` is never overwritten). Requires `LINKDEV_SYNC_TOKEN` on the LiNKdev repo.

**Manual:** `git clone https://github.com/linktrend/LiNKdev && ./scripts/sync-installations.sh /path/to/LiNKtrend-System`
