# Repo Git Policy Rollout

**Status:** Phase 2 executed on 2026-05-15T02:40:15Z.

## Policy Applied

- Stable branches: `main`, `staging`, `development`.
- Promotion flow: work branch -> `development` -> `staging` -> `main`.
- GitHub is the source of truth.
- Fork repos sync upstream into the `linktrend/*` fork `development` branch only. No upstream PRs are created or suggested.
- Repo automation is normalized to CI, branch source policy, and fork upstream sync only.

## Repo Results

| Repo | Origin | Upstream | Branches | Workflows on development | main protected | staging protected | Local status | HEAD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LiNKapps | linktrend/LiNKapps | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | clean | 34ab5af |
| LiNKautowork | linktrend/LiNKautowork | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | 1 uncommitted | dacf410 |
| LiNKbot-core | linktrend/LiNKbot-core | https://github.com/openclaw/openclaw.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | ee1716c5ba |
| LiNKsites | linktrend/LiNKsites | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | clean | 64f15df |
| LiNKskills | linktrend/LiNKskills | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | clean | 38e8cc0 |
| LiNKsmartfile | linktrend/LiNKsmartfile | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | 2 uncommitted | 96bfc13 |
| LiNKtrend-LEXOS | linktrend/LiNKtrend-LEXOS | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | clean | 81c5094 |
| LiNKtrend-System | linktrend/LiNKtrend-System | none | development,main,staging | branch-source-policy.yml,ci.yml | true | true | 1 uncommitted | 83f43a7 |
| link-GlitchTip | linktrend/link-GlitchTip | https://github.com/burke-software/GlitchTip.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 018b735 |
| link-account-financial-tools | linktrend/link-account-financial-tools | https://github.com/OCA/account-financial-tools.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 4d64fc5d |
| link-agency-agents | linktrend/link-agency-agents | https://github.com/msitarzewski/agency-agents.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 921e843 |
| link-antigravity-kit | linktrend/link-antigravity-kit | https://github.com/vudovn/antigravity-kit.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 27cf0bd |
| link-awesome-openclaw-skills | linktrend/link-awesome-openclaw-skills | https://github.com/VoltAgent/awesome-openclaw-skills.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 3dc3a90 |
| link-chatwoot | linktrend/link-chatwoot | https://github.com/chatwoot/chatwoot.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | f990df671 |
| link-growthbook | linktrend/link-growthbook | https://github.com/growthbook/growthbook.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 09720ffa2 |
| link-listmonk | linktrend/link-listmonk | https://github.com/knadh/listmonk.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 3a51b3c |
| link-llm-council | linktrend/link-llm-council | https://github.com/karpathy/llm-council.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 19f2ce4 |
| link-metabase | linktrend/link-metabase | https://github.com/metabase/metabase.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 922c82138f |
| link-odoo | linktrend/link-odoo | https://github.com/odoo/odoo.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 7f46201d2da |
| link-paperless-ngx | linktrend/link-paperless-ngx | https://github.com/paperless-ngx/paperless-ngx.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 6ab148fdc |
| link-plane | linktrend/link-plane | https://github.com/makeplane/plane.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 5e9a25eb9 |
| link-postiz-app | linktrend/link-postiz-app | https://github.com/gitroomhq/postiz-app.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | dbf4d637 |
| link-serpbear | linktrend/link-serpbear | https://github.com/towfiqi/serpbear.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | c4366fa |
| link-traefik | linktrend/link-traefik | https://github.com/traefik/traefik.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 74153221b |
| link-typebot.io | linktrend/link-typebot.io | https://github.com/baptisteArno/typebot.io.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | d9bcdc40d |
| link-umami | linktrend/link-umami | https://github.com/umami-software/umami.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 1cf61bde |
| link-vaultwarden | linktrend/link-vaultwarden | https://github.com/dani-garcia/vaultwarden.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | 444ede46 |
| link-zulip | linktrend/link-zulip | https://github.com/zulip/zulip.git | development,main,staging | branch-source-policy.yml,ci.yml,upstream-sync.yml | true | true | clean | d65ec03e71 |

## Notes

- Required CI checks were not set on protections in this pass because the normalized workflows are currently on `development` and must be promoted to `staging`/`main` before their checks reliably exist on protected branches.
- `LiNKsmartfile` intentionally still has an uncommitted secret-management manual excluded from commits.
- Local `.DS_Store` files were intentionally excluded from checkpoint commits.
- `LiNKbot-core` pre-commit hooks ran successfully during policy commits, including 3,963 passing tests in the changed-test lane.
