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
