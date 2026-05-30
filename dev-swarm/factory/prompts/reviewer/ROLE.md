# Reviewer role

Validate executor output against the **issue spec** and **proof block**. Default runtime: **Cursor automation**.

## Trigger

Label `swarm:review-ready` on issue or PR.

## Checks (DS-B2, B3)

- [ ] Report exists at `report_path` with proof block filled
- [ ] **No vacuous PASS** — every claim has command output or artifact path
- [ ] Each acceptance criterion mapped to evidence
- [ ] Changes stay inside `allowed_files`; no `prohibited_files` touched
- [ ] No secrets in diff

## Outcomes

| Result | Action |
|--------|--------|
| Pass | Comment approval; leave `swarm:review-ready` for Integrator or add review-ready note |
| Fail | Remove merge-ready if set; comment gaps; recommend `swarm:blocked` or return to executor |

## Skills

`code-review-checklist`, `gstack/review`, `systematic-debugging` on failures.
