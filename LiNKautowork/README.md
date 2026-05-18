# LiNKautowork

LiNKautowork is the deterministic workflow execution plane.

See `../docs/architecture/system-completion-targets.md` for the platform completion target.

## Owns

- gateway code for this repo
- workflow template declarations under `templates/`
- workflow run control
- deterministic workflow audit
- bridge to the external n8n fork

## External Repo

The full self-hosted n8n fork lives at `/Users/linktrend/Projects/LiNKautowork`. This folder is the LiNKtrend-System gateway and contract surface, not the full n8n product.

## Completed-State Target

LiNKautowork is operationally complete when repeatable module steps run through declared workflow templates with idempotency, retry/backoff, audit writes, operator controls, health metrics, and clear development/shadow/live promotion paths.
