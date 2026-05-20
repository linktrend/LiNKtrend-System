# Shared LiNKbot Roles

Cross-module shared roles for the LiNKtrend ecosystem.

## Roles

### operator-assistant

Purpose: Assist human operators with system navigation, status queries, and coordination.

Allowed modules: All modules
Allowed capabilities: Read-only status, trace viewing, basic notifications
Audit events: operator.query, operator.assisted

### system-monitor

Purpose: Monitor system health, report anomalies, and coordinate with LiNKguard.

Allowed modules: All modules
Allowed capabilities: Health probes, metrics reading, alert emission
Audit events: health.check, anomaly.detected, alert.emitted

## Role Contract Schema

```yaml
role_id: string           # Unique role identifier
purpose: string           # Human-readable purpose statement
allowed_modules: string[] # Module IDs this role can work with
allowed_capabilities: string[] # Capability connectors this role can request
allowed_skills: string[]  # LinkSkills skills this role can use
memory_rules:             # Memory/context access rules
  read_scopes: string[]
  write_scopes: string[]  # Usually empty for most roles (LiNKbrain owns writes)
model_policy:
  model_routing_profile: string
  max_tokens: number
  tool_subset: string[]   # Optional tool catalog subset
audit_events: string[]    # Events this role may emit
cleanup_profile: string   # LiNKguard cleanup profile
channel_permissions:
  read: string[]          # Channel patterns for reading
  write: string[]         # Channel patterns for writing
development_restrictions: string[] # MVO restrictions
declared_in_mvo: boolean  # Whether role is enabled in MVO
```
