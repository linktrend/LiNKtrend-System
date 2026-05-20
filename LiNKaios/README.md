# LiNKaios

LiNKaios is the organizational execution control plane.

## Owns

- tenant and module activation
- cockpit UI and dashboards
- work contracts and work routing
- approvals and operator control
- system-level governance
- plugin/module registration

## Current Migration State

LiNKaios currently lives mainly in:

- `LiNKaios/linkaios-web`
- `packages/linkaios-kernel`
- `packages/linklogic-sdk`

`LiNKaios/linkaios-web` is the deployable command-centre app. The `packages/linkaios-kernel` package is still kept under `packages/` because it is a reusable workspace package, not a standalone app.
