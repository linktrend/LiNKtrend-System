# Deployment Target v2

## Goal

First target: local internal run.

Second target: DigitalOcean/Tailscale/Traefik internal deployment.

## Local First

The MVO should run locally first with:

- LiNKaios web
- LiNKbrain service
- LinkSkills service
- LiNKautowork gateway
- n8n
- LiNKbot-core adapter
- Supabase remote or local Postgres
- seed leads
- template preview path

## DigitalOcean Second

Use:

- Docker Compose
- Traefik
- Tailscale
- Supabase remote if already used
- private internal domains

## Vercel

If the LiNKaios web app is already easier to deploy on Vercel, use Vercel for web and DigitalOcean for backend services. Do not force everything into DigitalOcean if that slows the sprint.

## Health Checks

Every service should expose or document a health path.

## Acceptance Criteria

The MVO deployment succeeds when:

1. LiNKaios opens.
2. LinkBot can run the mission.
3. LinkSkills issues capability lease.
4. LiNKautowork executes workflow.
5. LiNKbrain records event/audit.
6. Preview site is available.
7. CRM/Plane or accepted stubs are created.
8. Trace is visible.

## Do Not Overbuild

No Kubernetes. No multi-region. No public SaaS hardening. No complex CI/CD before the demo.
