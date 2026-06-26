# GitHub Repo Lifecycle

This repository hosts the shared GitHub Actions lifecycle used across active LiNKtrend forks and product repositories.

## Standard operational branches

- `development`: incoming work and upstream updates land here first
- `staging`: integration and testing branch
- `main`: production branch

## Hybrid fork model

Forks may preserve an upstream-named branch such as `master`, `develop`, `preview`, `18.0`, or `19.0`.

That branch is treated as the upstream alignment branch only.

Operational promotion still uses:

- `development`
- `staging`
- `main`

## Automation schedule

- Sunday sync: upstream branch -> fork `development`
- Monday promotion: `development` -> `staging`
- Manual release: `staging` -> `main`

## Conflict policy

- Fork upstream sync prefers existing fork customizations in `development`
- Promotion from `development` to `staging` prefers `development`
- Promotion from `staging` to `main` prefers `staging`

This keeps the GitHub lifecycle predictable while preserving fork customizations.
