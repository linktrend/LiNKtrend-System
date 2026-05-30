# Scripts

`scripts/` contains repo-level developer and verification scripts.

Current scripts:

- `run-e2e.ts`: local MVO end-to-end harness for the WebsiteFactory flow.

Do not place long-running product services here. Product runtime code belongs under its owning system folder, and reusable library code belongs under `packages/`.
