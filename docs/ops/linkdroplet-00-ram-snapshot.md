# linkdroplet-00 RAM snapshot (Wave 11.5)

**Host:** DigitalOcean compute node (`linkdroplet-00`)  
**RAM:** 16 GB minimum (studio launch posture)  
**Purpose:** Principal review of headroom under fleet load before Hetzner migration (Wave 12 **deferred**).

---

## When to capture

Run during Wave 11 acceptance load:

1. LinkSites MVO re-run (`./scripts/run-mvo-linksites-acceptance.sh` against staging kernel)
2. Parallel Agent Zero lane smoke (2+ lanes)
3. OpenClaw sub-agent burst under `linksites-head` or `admin-openclaw`

---

## How to capture

On the VPS (recommended):

```bash
cd /path/to/LiNKtrend-System
RAM_SNAPSHOT_REMOTE=1 RAM_LOAD_CONTEXT="MVO re-run + AZ smoke" ./scripts/capture-ram-snapshot.sh
```

Or SSH manually:

```bash
ssh linkdroplet-00 'free -h && docker stats --no-stream'
```

Append output below under **Snapshots**.

---

## Review thresholds

| Signal | Action |
|--------|--------|
| Available &lt; 2 GB sustained under acceptance load | Cap concurrent AZ lanes; prioritize Hetzner cutover after 11.7 |
| Swap &gt; 0 during acceptance | Document peak services; consider compose memory limits |
| OOM killer events in `dmesg` | **Block** production promotion until Hetzner or service split |

Hetzner target: 2× EX44 64 GB — removes headroom anxiety (Wave 12 deferred).

---

## Snapshots

_Operator: append captures from `capture-ram-snapshot.sh` or manual `free -h` below._

### Baseline template (pre-load)

```text
# Example shape — replace with live capture
              total        used        free      shared  buff/cache   available
Mem:           15Gi       8.2Gi       1.1Gi       120Mi       6.4Gi       6.8Gi
Swap:            0B          0B          0B
```

### Under-load template

```text
# Record during MVO + parallel AZ lanes
# Peak RSS services: openclaw-gateway, link-agentzero, n8n, payload-cms, linkaios-web
```

---

## References

- `STUDIO_FORWARD_PLAN.md` Wave 11.5, §5 RAM note
- `LiNKdev/product/reports/linktrend-system/wave11-do-acceptance.md`
- `docs/deploy/WAVE12_HETZNER_MIGRATION_DEFERRED.md`
