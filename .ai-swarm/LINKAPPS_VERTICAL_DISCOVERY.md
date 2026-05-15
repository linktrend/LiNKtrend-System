# LiNKapps Vertical Starter Kit Discovery

**Work Packet:** WP-057  
**Discovery Date:** 2026-05-15  
**Target Repo:** `/Users/linktrend/Projects/LiNKapps`  
**Guidance Source:** `/Users/linktrend/Downloads/260320 - LiNKtrend Autonomous Organizational Structure (Final) (1).md`

---

## Executive Summary

LiNKapps is a production-ready App Factory starter kit designed for the LiNKtrend Agentic Venture Factory. It provides a deterministic, reusable engineering baseline for creating SaaS applications with minimal marginal cost. The system is architected to support the 7-phase venture lifecycle defined in the autonomous organizational structure.

---

## 1. Starter Kit Assets Inventory

### 1.1 Repository Structure

```
LiNKapps/
├── apps/
│   ├── web/                    # Next.js 14 + TypeScript + Tailwind + shadcn/ui
│   └── mobile/                 # React Native + Expo + NativeWind
├── apps_templates/
│   └── LiNKdev-Starter-Kit/
│       └── _worktrees/         # Generated app instances (callisto, titan)
├── packages/
│   ├── api/                    # tRPC API layer with Supabase integration
│   ├── config/                 # Shared Tailwind preset, ESLint config
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # @starter/ui - shared UI primitives (web + native)
│   └── utils/                  # Shared utility functions
├── mcp/
│   ├── supabase/               # MCP server for database operations
│   ├── stripe/                 # MCP server for payment management
│   ├── figma/                  # MCP server for design file access
│   └── shadcn/                 # MCP server for component discovery
├── docs/
│   └── 00_OPERATOR_LIBRARY/    # Official workflow and governance docs
├── .agent/
│   ├── agents/                 # 20 specialist agent definitions
│   ├── skills/                 # 36 reusable skill modules
│   └── workflows/              # 11 slash-command workflows
├── .cursor/rules/              # 12 rule files for IDE behavior
├── design/
│   └── DESIGN_TOKENS.json      # Token-based design system
├── scripts/
│   ├── create-app-repo.sh      # App generation script
│   └── release-readiness.sh    # Quality gates script
└── specify/                    # PRD and bootstrap context location
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Web Framework | Next.js 14 (App Router) | SSR, routing, API routes |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| UI Components | shadcn/ui | Accessible primitives |
| Mobile | React Native + Expo | Cross-platform apps |
| Backend | Supabase | Auth, database, storage, edge functions |
| API | tRPC | Type-safe API layer |
| Payments | Stripe | Billing, subscriptions |
| Testing | Vitest (web), Jest (mobile), Playwright (E2E) | Quality assurance |
| Package Manager | pnpm | Workspace management |
| Deployment | Vercel (web), EAS (mobile) | Hosting |

### 1.3 Agent Ecosystem (20 Agents)

**Core Development Squad:**
- `product-owner` - Strategic facilitator, PRD owner
- `frontend-specialist` - Web UI/UX implementation
- `backend-specialist` - API and business logic
- `mobile-developer` - React Native/Expo
- `database-architect` - Schema and SQL
- `test-engineer` - Testing strategies
- `qa-automation-engineer` - E2E pipelines

**Supporting Roles:**
- `orchestrator` - Multi-agent coordination
- `project-planner` - Discovery and task planning
- `devops-engineer` - CI/CD, Docker
- `security-auditor` - Security compliance
- `performance-optimizer` - Web Vitals
- `debugger` - Root cause analysis
- `documentation-writer` - Manuals and docs
- `seo-specialist` - Search optimization
- `code-archaeologist` - Legacy refactoring
- `explorer-agent` - Codebase analysis

### 1.4 Skills Inventory (36 Skills)

**Frontend:** react-best-practices, web-design-guidelines, tailwind-patterns, frontend-design, ui-ux-pro-max

**Backend:** api-patterns, nodejs-best-practices, python-patterns, nestjs-expert

**Database:** database-design, prisma-expert

**Testing:** testing-patterns, webapp-testing, tdd-workflow, code-review-checklist, lint-and-validate

**Security:** vulnerability-scanner, red-team-tactics

**Mobile:** mobile-design

**Architecture:** architecture, plan-writing, brainstorming, app-builder

**DevOps:** deployment-procedures, docker-expert, server-management

**SEO/Growth:** seo-fundamentals, geo-fundamentals

---

## 2. App Factory Workflow (Idea to Launch/Spinoff)

### 2.1 The 7-Phase Venture Lifecycle

Per the autonomous organizational structure document:

| Phase | Name | Department | Key Activities | Output |
|-------|------|------------|----------------|--------|
| 1 | Discovery & Research | BD/Market Research | Market sizing, competitor analysis | Problem statement, target segments |
| 2 | Feasibility & Stress-Testing | BD/Venture Architect | Unit economics modeling, ROI validation | Feasibility package |
| 3 | Blueprinting | Cross-departmental | Business Plan, PRD, GTM strategy | Venture blueprint |
| 4 | The Final Gate | Strategic Leadership | Chairman + CEO Go/No-Go decision | Approval/rejection |
| 5 | Technical Implementation | Development | Squad formation, rapid prototyping using IDP | Working product |
| 6 | Launch & Traction | Growth/Media & Sales | Outreach, marketing, PMF validation | Live venture |
| 7 | Spinout | All Departments | Transition to standalone entity under Project CEO | Independent venture |

### 2.2 LiNKapps-Specific Workflow (PRD to Deployed App)

**Step 1: Generate New App Repo**
```bash
./scripts/create-app-repo.sh \
  --slug <app-slug> \
  --name "App Name" \
  --out /Users/linktrend/Projects \
  --prd /absolute/path/to/PRD.md \
  --remote https://github.com/<org>/<repo>.git
```

**Step 2: Install & AI Build Pass**
```bash
cd /Users/linktrend/Projects/<app-slug>
pnpm install
# AI implements PRD requirements
```

**Step 3: Configure Independent Services**
- Create dedicated Supabase project
- Create app-specific Stripe products/prices
- Configure environment variables
- Run migrations and seed data

**Step 4: Validate**
```bash
./scripts/release-readiness.sh [--with-e2e]
```

**Step 5: Deploy**
- Web: Vercel project with env vars
- Mobile: EAS build and distribute

**Step 6: Handover Pack**
- Final PRD (`specify/PRD.md`)
- Env var checklist
- SQL migrations
- Stripe product/price IDs
- Deployment URLs
- Rollback procedure

### 2.3 Quality Gates

| Gate | Command | Description |
|------|---------|-------------|
| Web Verification | `pnpm verify:web` | Typecheck, lint, build, test, routes |
| Mobile Verification | `pnpm verify:mobile` | Typecheck, lint, tests |
| API Unit Tests | `pnpm --filter @starter/api test:unit` | Business logic tests |
| API Integration Tests | `pnpm --filter @starter/api test:integration` | Integration tests |
| E2E Tests | `pnpm e2e:web` | Playwright E2E (optional) |
| Release Readiness | `./scripts/release-readiness.sh` | Full validation suite |

---

## 3. Development Team / LinkBot Pod Concept

### 3.1 The Autonomous Squad Structure

Per the organizational structure document, the Development Department operates through **autonomous squads** that execute Phase 5 (Technical Implementation):

```
Autonomous Development Squad
├── Product Owner (PO)
│   ├── Continues from Phase 3 BD role
│   ├── Owns PRD, Business Plan, GTM context
│   ├── Controls prioritization and scope
│   └── Evolves into venture COO post-spinout
├── Technical Lead
│   ├── Architecture enforcement
│   ├── Code review authority
│   └── Technical decision maker
├── Frontend Developer
│   ├── UI/UX implementation
│   ├── Design system adherence
│   └── API integration
├── Backend Developer
│   ├── Business logic implementation
│   ├── API development
│   └── Database integration
├── UI/UX Designer
│   ├── Design system creation
│   └── Figma-to-code workflow
└── QA/Automation Engineer (Embedded)
    ├── Quality enforcement
    ├── Automated validation
    └── Release approval authority
```

### 3.2 LinkBot Agent Mapping to Squad Roles

The `.agent/agents/` folder contains pre-defined agent personas that map directly to squad positions:

| Squad Role | LinkBot Agent File | Purpose |
|------------|-------------------|---------|
| Product Owner | `product-owner.md` | Requirements, roadmap, PRD ownership |
| Technical Lead | `orchestrator.md` + `backend-specialist.md` | Architecture, multi-agent coordination |
| Frontend Developer | `frontend-specialist.md` | Web UI implementation |
| Backend Developer | `backend-specialist.md` | API and logic implementation |
| Mobile Developer | `mobile-developer.md` | React Native implementation |
| UI/UX Designer | `frontend-specialist.md` (design section) | Design system, visual implementation |
| QA Engineer | `qa-automation-engineer.md` + `test-engineer.md` | Testing, validation |
| Database Architect | `database-architect.md` | Schema design |
| Security Auditor | `security-auditor.md` | Security compliance |
| DevOps Engineer | `devops-engineer.md` | CI/CD, deployment |

### 3.3 Squad Workflow Integration

The `.agent/workflows/` folder defines slash-command workflows for squad operations:

| Workflow | File | Purpose |
|----------|------|---------|
| `/brainstorm` | `brainstorm.md` | Idea generation, requirements exploration |
| `/plan` | `plan.md` | Task decomposition, milestone planning |
| `/create` | `create.md` | Code generation from specs |
| `/debug` | `debug.md` | Issue investigation and resolution |
| `/test` | `test.md` | Test execution and validation |
| `/deploy` | `deploy.md` | Deployment procedures |
| `/enhance` | `enhance.md` | Refactoring and optimization |
| `/orchestrate` | `orchestrate.md` | Multi-agent coordination |
| `/preview` | `preview.md` | Build preview and verification |
| `/status` | `status.md` | Project status check |
| `/ui-ux-pro-max` | `ui-ux-pro-max.md` | Advanced UI/UX generation |

---

## 4. Reusable Assets Assessment

### 4.1 High-Value Reusable Assets

| Asset | Location | Reuse Potential | Maturity |
|-------|----------|-----------------|----------|
| Web app starter | `apps/web/` | High - Complete Next.js foundation | Production-ready |
| Mobile app starter | `apps/mobile/` | High - Expo/React Native baseline | Production-ready |
| UI primitives | `packages/ui/` | High - Web + Native component library | Production-ready |
| API layer | `packages/api/` | High - tRPC + Supabase integration | Production-ready |
| Design tokens | `design/DESIGN_TOKENS.json` | High - Token-based design system | Production-ready |
| Agent definitions | `.agent/agents/` | High - 20 specialist personas | Well-defined |
| Skill modules | `.agent/skills/` | High - 36 reusable skills | Well-documented |
| Workflow definitions | `.agent/workflows/` | Medium - Slash command procedures | Functional |
| Create app script | `scripts/create-app-repo.sh` | High - App generation automation | Production-ready |
| Release readiness script | `scripts/release-readiness.sh` | High - Quality gates | Production-ready |
| PRD template | `docs/00_OPERATOR_LIBRARY/templates/PRD_TEMPLATE.md` | High - Standardized requirements | Complete |
| Operator library | `docs/00_OPERATOR_LIBRARY/` | High - Governance and workflow docs | Comprehensive |
| MCP servers | `mcp/` | Medium - IDE integration | Functional |

### 4.2 Capability Dependencies for LiNKapps Vertical Plugin

Based on the PLUGIN_ARCHITECTURE_V2 contract, LiNKapps would require:

**Required Capability Plugins:**
- Supabase capability (auth, database, storage)
- Stripe capability (billing, payments)
- Vercel/EAS capability (deployment)
- Git/GitHub capability (repo management)

**Required LinkSkills:**
- App generation skill
- Database migration skill
- Deployment skill
- Testing/validation skill

**Required LiNKautowork Workflows:**
- App repo creation workflow
- CI/CD pipeline workflow
- Release readiness workflow

**Required LiNKbrain Events:**
- App creation event
- Deployment event
- Test result event
- Release event

**LiNKaios UI Panels:**
- App factory dashboard
- Build status view
- Deployment history
- Test results view

---

## 5. Gaps and Unknowns

### 5.1 Identified Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No explicit "Linktrend Development" vertical plugin definition | Cannot attach development squad to LiNKaios | Define plugin manifest for LiNKapps vertical |
| Squad-to-LiNKaios integration undefined | Squad operates outside LiNKaios governance | Design squad orchestration hooks |
| Phase 5-7 handoff mechanics unclear | Spinoff process not automated | Define spinout workflow with LiNKaios/LiNKbrain |
| No venture-level CRM/Chatwoot integration | Post-spinoff ops disconnected | Add CRM capability plugin requirement |
| No explicit Plane project integration | Task tracking outside LiNKaios | Add Plane capability plugin requirement |

### 5.2 Hard Unknowns

1. **Squad Formation Trigger**: How does LiNKaios trigger squad formation at Phase 5 transition?
2. **Role Assignment**: How are specific LinkBot agent instances assigned to squad roles?
3. **Context Handoff**: How does Phase 3 BD context (feasibility, blueprint) transfer to the development squad?
4. **Progress Reporting**: How does the squad report progress back to LiNKaios for Phase 5-6 tracking?
5. **Spinoff Mechanics**: What is the technical process for transitioning an app from LiNKapps factory to standalone venture entity?

---

## 6. Capability Lease Requirements (LinkSkills)

For each capability action, LiNKapps would require:

| Action | Capability | Lease Requirements | Audit Events |
|--------|------------|-------------------|--------------|
| Create app repo | Git/GitHub | Write access to org repos | repo_created, commit_pushed |
| Provision Supabase | Supabase | Project creation rights | project_created, migration_applied |
| Configure Stripe | Stripe | Product/price write access | product_created, price_created |
| Deploy to Vercel | Vercel | Project deployment rights | deployment_triggered, deployment_completed |
| Run E2E tests | Testing | Test environment access | test_run_started, test_run_completed |
| Create squad | LinkBot | Agent instantiation rights | squad_created, role_assigned |

---

## 7. Recommendations for Integrator

### 7.1 For Future LiNKapps Vertical Plugin Work Packets

1. **WP-XXX: LiNKapps Plugin Manifest** - Define vertical plugin declaration per PLUGIN_ARCHITECTURE_V2
2. **WP-XXX: Squad Orchestration Integration** - Design how LiNKaios coordinates autonomous squads
3. **WP-XXX: Phase 5-7 Transition Workflow** - Define handoff mechanics from development to spinout
4. **WP-XXX: LinkBot Pod Lifecycle** - Define squad creation, execution, and teardown workflows
5. **WP-XXX: Capability Plugin Contracts** - Define required capability plugins for app factory operations

### 7.2 Reuse Strategy

- **Copy/Adapt**: `create-app-repo.sh`, `release-readiness.sh`, PRD template, agent definitions
- **Reference**: Operator library docs, skill definitions, design tokens
- **Integrate**: UI package, API layer patterns, quality gate patterns
- **Extend**: Add LiNKaios orchestration hooks, LinkSkills capability leases, LiNKbrain audit events

---

## 8. Evidence Paths

| Evidence Type | Path |
|---------------|------|
| Starter kit root | `/Users/linktrend/Projects/LiNKapps` |
| Web app | `/Users/linktrend/Projects/LiNKapps/apps/web` |
| Mobile app | `/Users/linktrend/Projects/LiNKapps/apps/mobile` |
| UI package | `/Users/linktrend/Projects/LiNKapps/packages/ui` |
| API package | `/Users/linktrend/Projects/LiNKapps/packages/api` |
| Agent definitions | `/Users/linktrend/Projects/LiNKapps/.agent/agents` |
| Skill modules | `/Users/linktrend/Projects/LiNKapps/.agent/skills` |
| Workflows | `/Users/linktrend/Projects/LiNKapps/.agent/workflows` |
| Operator library | `/Users/linktrend/Projects/LiNKapps/docs/00_OPERATOR_LIBRARY` |
| App creation script | `/Users/linktrend/Projects/LiNKapps/scripts/create-app-repo.sh` |
| Release readiness script | `/Users/linktrend/Projects/LiNKapps/scripts/release-readiness.sh` |
| Organizational structure | `/Users/linktrend/Downloads/260320 - LiNKtrend Autonomous Organizational Structure (Final) (1).md` |

---

## 9. Target Repo Clean Status

```bash
$ git -C /Users/linktrend/Projects/LiNKapps status --short
# No output - repository is clean, no edits made by discovery agent
```

**Status:** Confirmed clean - no modifications to LiNKapps repository.

---

*Discovery completed per WP-057 requirements. Output sufficient for Integrator to write future LiNKapps vertical work packets.*
