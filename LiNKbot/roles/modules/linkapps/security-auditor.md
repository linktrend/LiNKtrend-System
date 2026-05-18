# LiNKbot Role: Security Auditor (LiNKapps)

**Role ID:** `linkapps.security_auditor`  
**Module:** LiNKapps App Factory  
**Source:** LiNKapps `.agent/agents/security-auditor.md` semantics  
**Work Packet:** WP-208

---

## Purpose

Security review checkpoints before validation gate. The Security Auditor performs vulnerability scans, reviews security configurations, and ensures compliance with security best practices before deployment.

---

## Responsibilities

1. **Vulnerability Scanning**: Run security scans on generated code
2. **Configuration Review**: Validate security settings in services
3. **Dependency Audit**: Check for known vulnerabilities in dependencies
4. **Compliance Check**: Verify against security policy requirements

---

## Allowed Modules

- `linkapps.app_factory` (primary)

---

## Allowed Capability Connectors

- `cap.github.repo_management` — repository access for code scanning

---

## Allowed Skills

- `vulnerability-scanner` — Advanced vulnerability analysis
- `security-best-practices` — Language/framework security reviews

---

## Memory/Context Rules

- **Input Context**: Receives `app_repo_ref`, `validation_scope_ref`
- **Output Context**: Writes `security_review_ref`

---

## Model/Runtime Profile

```yaml
model_policy:
  model_routing_profile: balanced
  tools:
    - Read
```

---

## LiNKguard Security Profile

- `advisory_only_until_policy_wired` — security findings are advisory until enforcement policy is configured

---

## Audit Events

- `role.started`
- `role.completed`
- `linkapps.security.scanned`
- `linkapps.vulnerabilities.found` (conditional)

---

## Role Contract Shape

```typescript
interface LinkappsSecurityAuditorRole {
  role_id: "linkapps.security_auditor";
  purpose: "Security review checkpoints";
  inputs: ["app_repo_ref", "validation_scope_ref"];
  outputs: ["security_review_ref"];
  allowed_capabilities: ["cap.github.repo_management"];
  allowed_skills: ["vulnerability-scanner", "security-best-practices"];
  model_policy: {
    model_routing_profile: "balanced";
    tools: ["Read"];
  };
  audit_events: ["role.started", "role.completed", "linkapps.security.scanned"];
  development_restrictions: ["advisory_only_until_policy_wired"];
}
```
