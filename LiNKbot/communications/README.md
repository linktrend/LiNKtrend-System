# LiNKbot Communications

This folder owns mission-aware communication profiles for LiNKbot.

## Owns

- tenant-to-channel routing profiles
- mission context bridge contracts
- channel permission profiles
- audit and trace mapping for bot communications
- temporary gateways until native engine support is adopted

## Does Not Own

- OpenClaw-native Slack, Telegram, WhatsApp, Discord, Matrix, Mattermost, Google Chat, MS Teams, Signal, LINE, IRC, or similar channel implementations
- LinkSkills permission/lease enforcement
- external chat server code

## Zulip

Zulip is currently represented by `LiNKbot/communications/temporary-gateways/zulip`, a temporary mission-aware gateway. OpenClaw has Zulip channel work in upstream PR/plugin form. The target is to adopt native OpenClaw Zulip support when it satisfies LiNKtrend requirements for tenant routing, mission mapping, LiNKbot identity, audit/trace writes, and LinkSkills permission checks.

## Fleet v1 channel profiles

`LiNKbot/communications/profiles/zulip-channel-profiles.ts` registers one **communication profile id** per OpenClaw fleet agent (`admin-openclaw`, `ceo-client`, `linksites-head`, `linkdeveloper-orchestrator`, `linkdeveloper-steward`). LiNKaios and bot-runtime resolve `profile_id` → Zulip bot identity (GSM secret names with `ZULIP_BOT_*` fallbacks) and governed `cap.zulip.run_messaging` dispatch.
