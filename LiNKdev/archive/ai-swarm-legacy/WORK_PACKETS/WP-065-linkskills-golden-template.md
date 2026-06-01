# WP-065 - LinkSkills Golden Template and Skill SDK

## Objective

Copy Golden Template from old repo and create skill validation SDK for LinkBot skill usage.

## Repo / branch

- Repo: `/Users/linktrend/Projects/LiNKtrend-System`
- Branch: `dev/codex/WP-065-linkskills-golden-template`
- Base: `development`

## Allowed files

- `packages/linklogic-sdk/templates/skill-golden.md`
- `packages/linklogic-sdk/src/validation/skill.ts`
- `packages/linklogic-sdk/src/types/skill.ts`
- `packages/linkskills-core/src/skills/`
- `.ai-swarm/AGENT_REPORTS/linkskills-agent.md`

## Prohibited files

- Old repo implementation files (copy template only)
- LinkBot runtime code (SDK only)

## Required context

- `.ai-swarm/LINKSKILLS_COMPLETION_PLAN.md` §4.6
- `/Users/linktrend/Projects/LiNKskills/skills/skill-template/SKILL.md`
- `/Users/linktrend/Projects/LiNKskills/skills/skill-architect/SKILL.md`
- PRD_LINKSKILLS_LOGIC_ENGINE §11.1, §12

## Steps

1. Copy Golden Template:
   - Source: `LiNKskills/skills/skill-template/SKILL.md`
   - Target: `packages/linklogic-sdk/templates/skill-golden.md`
   - Preserve frontmatter structure
   - Update version reference to match SDK

2. Define skill types in SDK:
   - `SkillFrontmatter` interface (YAML frontmatter fields)
   - `SkillEngineRequirements` (min_reasoning_tier, preferred_model, context_required)
   - `SkillToolingPolicy` (policy, jit_enabled_if, threshold)
   - `SkillPersistence` (required, state_path)
   - `SkillManifest` (complete skill definition)

3. Implement skill validation:
   - `validateSkillManifest(skillMd: string): ValidationResult`
   - Parse YAML frontmatter
   - Check required fields: name, description, version, engine, tooling, permissions
   - Validate version format (semver)
   - Validate engine requirements
   - Validate tooling policy

4. Implement skill scaffolding helper:
   - `scaffoldSkill(name: string, options: ScaffoldOptions)`
   - Generate folder structure
   - Copy Golden Template with replacements
   - Create references/schemas.json scaffold
   - Create .workdir/tasks/ directory

5. Implement skill catalog integration:
   - `SkillCatalogEntry` type
   - Connection to capability registry for governed skills

6. Document progressive disclosure:
   - Public contract layer specification
   - Runtime disclosure layer for LinkBots
   - Token structure (defer signing to WP-066)

## Acceptance criteria

- [ ] Golden Template copied and versioned
- [ ] `validateSkillManifest()` validates all required fields
- [ ] Skill scaffolding generates working structure
- [ ] Frontmatter parsing handles all template fields
- [ ] Documentation for LinkBot skill usage
- [ ] Tests for validation and scaffolding

## Proof required

- Validation test output (valid and invalid skills)
- Scaffolded skill structure listing
- Golden Template render in SDK

## Blockers

- None - can proceed in parallel with WP-061

## Notes

- Golden Template is authoring guidance, not runtime code
- LinkBots consume skills through progressive disclosure, not full source
- Coordinate with WP-066 for disclosure token integration
- `skill-architect` is reference only for how skills are created
