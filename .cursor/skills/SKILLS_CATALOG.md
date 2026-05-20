---
name: linktrend-skills-catalog
description: >-
  Progressive-disclosure catalog of project Cursor skills, MCP servers, and related tool/plugin indexes. Agents read this first to select only the relevant skill bodies and tool descriptors for the current task.
catalog_version: 1
generated_from: .cursor/skills
skill_count: 152
mcp_server_count: 4
agent_instructions:
  - Read this catalog before opening individual skill folders.
  - Select skills whose description/category matches the user request, then read only those `SKILL.md` files and directly linked references needed for the task.
  - Prefer project-specific LiNKtrend skills and rules when they conflict with imported generic skills.
  - For MCP usage, inspect the relevant MCP tool descriptor JSON before calling any MCP tool.
  - Do not bulk-load every skill body; use this catalog for routing and progressive disclosure.
skill_categories:
  backend-api-tools:
    - name: api-patterns
      path: .cursor/skills/api-patterns/SKILL.md
      source: linktrend-skills
      description: 'API design principles and decision-making. REST vs GraphQL vs tRPC selection, response formats, versioning, pagination.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: server-management
      path: .cursor/skills/server-management/SKILL.md
      source: linktrend-skills
      description: 'Server management principles and decision-making. Process management, monitoring strategy, and scaling decisions. Teaches thinking, not commands.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
  database:
    - name: database-design
      path: .cursor/skills/database-design/SKILL.md
      source: linktrend-skills
      description: 'Database design principles and decision-making. Schema design, indexing strategy, ORM selection, serverless databases.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
  devops-release:
    - name: deployment-procedures
      path: .cursor/skills/deployment-procedures/SKILL.md
      source: linktrend-skills
      description: 'Production deployment principles and decision-making. Safe deployment workflows, rollback strategies, and verification. Teaches thinking, not scripts.'
      allowed_tools: 'Read, Glob, Grep, Bash'
  frontend-ui-ux:
    - name: app-builder
      path: .cursor/skills/app-builder/SKILL.md
      source: linktrend-skills
      description: 'Main application building orchestrator. Creates full-stack applications from natural language requests. Determines project type, selects tech stack, coordinates agents.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash, Agent'
    - name: architecture
      path: .cursor/skills/architecture/SKILL.md
      source: linktrend-skills
      description: 'Architectural decision-making framework. Requirements analysis, trade-off evaluation, ADR documentation. Use when making architecture decisions or analyzing system design.'
      allowed_tools: 'Read, Glob, Grep'
    - name: bash-linux
      path: .cursor/skills/bash-linux/SKILL.md
      source: linktrend-skills
      description: 'Bash/Linux terminal patterns. Critical commands, piping, error handling, scripting. Use when working on macOS or Linux systems.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: brainstorming
      path: .cursor/skills/brainstorming/SKILL.md
      source: linktrend-skills
      description: 'Socratic questioning protocol + user communication. MANDATORY for complex requests, new features, or unclear requirements. Includes progress reporting and error handling.'
      allowed_tools: 'Read, Glob, Grep'
    - name: code-review-checklist
      path: .cursor/skills/code-review-checklist/SKILL.md
      source: linktrend-skills
      description: 'Code review guidelines covering code quality, security, and best practices.'
      allowed_tools: 'Read, Glob, Grep'
    - name: documentation-templates
      path: .cursor/skills/documentation-templates/SKILL.md
      source: linktrend-skills
      description: 'Documentation templates and structure guidelines. README, API docs, code comments, and AI-friendly documentation.'
      allowed_tools: 'Read, Glob, Grep'
    - name: frontend-design
      path: .cursor/skills/frontend-design/SKILL.md
      source: linktrend-skills
      description: 'Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics. Use when the user asks to build web components, pages, artifacts, posters, or applications, or when any design skill requires project context.'
    - name: intelligent-routing
      path: .cursor/skills/intelligent-routing/SKILL.md
      source: linktrend-skills
      description: 'Automatic agent selection and intelligent task routing. Analyzes user requests and automatically selects the best specialist agent(s) without requiring explicit user mentions.'
    - name: mcp-builder
      path: .cursor/skills/mcp-builder/SKILL.md
      source: linktrend-skills
      description: 'MCP (Model Context Protocol) server building principles. Tool design, resource patterns, best practices.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: mobile-design
      path: .cursor/skills/mobile-design/SKILL.md
      source: linktrend-skills
      description: 'Mobile-first design thinking and decision-making for iOS and Android apps. Touch interaction, performance patterns, platform conventions. Teaches principles, not fixed values. Use when building React Native, Flutter, or native mobile apps.'
      allowed_tools: 'Read, Glob, Grep, Bash'
    - name: mobile-games
      path: .cursor/skills/game-development/mobile-games/SKILL.md
      source: link-antigravity-kit
      description: 'Mobile game development principles. Touch input, battery, performance, app stores.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: parallel-agents
      path: .cursor/skills/parallel-agents/SKILL.md
      source: linktrend-skills
      description: 'Multi-agent orchestration patterns. Use when multiple independent tasks can run with different domain expertise or when comprehensive analysis requires multiple perspectives.'
      allowed_tools: 'Read, Glob, Grep'
    - name: react-best-practices
      path: .cursor/skills/nextjs-react-expert/SKILL.md
      source: linktrend-skills
      description: 'React and Next.js performance optimization from Vercel Engineering. Use when building React components, optimizing performance, eliminating waterfalls, reducing bundle size, reviewing code for performance issues, or implementing server/client-side optimizations.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: tailwind-patterns
      path: .cursor/skills/tailwind-patterns/SKILL.md
      source: linktrend-skills
      description: 'Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design token architecture.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: templates
      path: .cursor/skills/app-builder/templates/SKILL.md
      source: linktrend-skills
      description: 'Project scaffolding templates for new applications. Use when creating new projects from scratch. Contains 12 templates for various tech stacks.'
      allowed_tools: 'Read, Glob, Grep'
    - name: vr-ar
      path: .cursor/skills/game-development/vr-ar/SKILL.md
      source: link-antigravity-kit
      description: 'VR/AR development principles. Comfort, interaction, performance requirements.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: web-design-guidelines
      path: .cursor/skills/web-design-guidelines/SKILL.md
      source: linktrend-skills
      description: 'Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".'
  general:
    - name: 2d-games
      path: .cursor/skills/game-development/2d-games/SKILL.md
      source: link-antigravity-kit
      description: '2D game development principles. Sprites, tilemaps, physics, camera.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: 3d-games
      path: .cursor/skills/game-development/3d-games/SKILL.md
      source: link-antigravity-kit
      description: '3D game development principles. Rendering, shaders, physics, cameras.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: game-art
      path: .cursor/skills/game-development/game-art/SKILL.md
      source: link-antigravity-kit
      description: 'Game art principles. Visual style selection, asset pipeline, animation workflow.'
      allowed_tools: 'Read, Glob, Grep'
    - name: game-audio
      path: .cursor/skills/game-development/game-audio/SKILL.md
      source: link-antigravity-kit
      description: 'Game audio principles. Sound design, music integration, adaptive audio systems.'
      allowed_tools: 'Read, Glob, Grep'
    - name: game-design
      path: .cursor/skills/game-development/game-design/SKILL.md
      source: link-antigravity-kit
      description: 'Game design principles. GDD structure, balancing, player psychology, progression.'
      allowed_tools: 'Read, Glob, Grep'
    - name: game-development
      path: .cursor/skills/game-development/SKILL.md
      source: link-antigravity-kit
      description: 'Game development orchestrator. Routes to platform-specific skills based on project needs.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: geo-fundamentals
      path: .cursor/skills/geo-fundamentals/SKILL.md
      source: linktrend-skills
      description: 'Generative Engine Optimization for AI search engines (ChatGPT, Claude, Perplexity).'
      allowed_tools: 'Read, Glob, Grep'
    - name: i18n-localization
      path: .cursor/skills/i18n-localization/SKILL.md
      source: linktrend-skills
      description: 'Internationalization and localization patterns. Detecting hardcoded strings, managing translations, locale files, RTL support.'
      allowed_tools: 'Read, Glob, Grep'
    - name: pc-games
      path: .cursor/skills/game-development/pc-games/SKILL.md
      source: link-antigravity-kit
      description: 'PC and console game development principles. Engine selection, platform features, optimization strategies.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: performance-profiling
      path: .cursor/skills/performance-profiling/SKILL.md
      source: linktrend-skills
      description: 'Performance profiling principles. Measurement, analysis, and optimization techniques.'
      allowed_tools: 'Read, Glob, Grep, Bash'
    - name: powershell-windows
      path: .cursor/skills/powershell-windows/SKILL.md
      source: link-antigravity-kit
      description: 'PowerShell Windows patterns. Critical pitfalls, operator syntax, error handling.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: python-patterns
      path: .cursor/skills/python-patterns/SKILL.md
      source: linktrend-skills
      description: 'Python development principles and decision-making. Framework selection, async patterns, type hints, project structure. Teaches thinking, not copying.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: rust-pro
      path: .cursor/skills/rust-pro/SKILL.md
      source: link-antigravity-kit
      description: 'Master Rust 1.75+ with modern async patterns, advanced type system'
    - name: seo-fundamentals
      path: .cursor/skills/seo-fundamentals/SKILL.md
      source: linktrend-skills
      description: 'SEO fundamentals, E-E-A-T, Core Web Vitals, and Google algorithm principles.'
      allowed_tools: 'Read, Glob, Grep'
    - name: systematic-debugging
      path: .cursor/skills/systematic-debugging/SKILL.md
      source: linktrend-skills
      description: '4-phase systematic debugging methodology with root cause analysis and evidence-based verification. Use when debugging complex issues.'
      allowed_tools: 'Read, Glob, Grep'
    - name: web-games
      path: .cursor/skills/game-development/web-games/SKILL.md
      source: link-antigravity-kit
      description: 'Web browser game development principles. Framework selection, WebGPU, optimization, PWA.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
  gstack-workflow:
    - name: autoplan
      path: .cursor/skills/gstack/autoplan/SKILL.md
      source: gstack
      description: 'Auto-review pipeline — reads the full CEO, design, eng, and DX review skills from disk and runs them sequentially with auto-decisions using 6 decision principles. Surfaces taste decisions (close approaches, borderline scope, codex disagreements) at a final approval gate. One command, fully reviewed plan out. Use when asked to "auto review", "autoplan", "run all reviews", "review this plan automatically", or "make th…'
    - name: benchmark
      path: .cursor/skills/gstack/benchmark/SKILL.md
      source: gstack
      description: 'Performance regression detection using the browse daemon. Establishes baselines for page load times, Core Web Vitals, and resource sizes. Compares before/after on every PR. Tracks performance trends over time. Use when: "performance", "benchmark", "page speed", "lighthouse", "web vitals", "bundle size", "load time". (gstack) Voice triggers (speech-to-text aliases): "speed test", "check performance".'
    - name: benchmark-models
      path: .cursor/skills/gstack/benchmark-models/SKILL.md
      source: gstack
      description: 'Cross-model benchmark for gstack skills. Runs the same prompt through Claude, GPT (via Codex CLI), and Gemini side-by-side — compares latency, tokens, cost, and optionally quality via LLM judge. Answers "which model is actually best for this skill?" with data instead of vibes. Separate from /benchmark, which measures web page performance. Use when: "benchmark models", "compare models", "which model is best for X", "…'
    - name: browse
      path: .cursor/skills/gstack/browse/SKILL.md
      source: gstack
      description: 'Fast headless browser for QA testing and site dogfooding. Navigate any URL, interact with elements, verify page state, diff before/after actions, take annotated screenshots, check responsive layouts, test forms and uploads, handle dialogs, and assert element states. ~100ms per command. Use when you need to test a feature, verify a deployment, dogfood a user flow, or file a bug with evidence. Use when asked to "open …'
    - name: canary
      path: .cursor/skills/gstack/canary/SKILL.md
      source: gstack
      description: 'Post-deploy canary monitoring. Watches the live app for console errors, performance regressions, and page failures using the browse daemon. Takes periodic screenshots, compares against pre-deploy baselines, and alerts on anomalies. Use when: "monitor deploy", "canary", "post-deploy check", "watch production", "verify deploy". (gstack)'
    - name: careful
      path: .cursor/skills/gstack/careful/SKILL.md
      source: gstack
      description: 'Safety guardrails for destructive commands. Warns before rm -rf, DROP TABLE, force-push, git reset --hard, kubectl delete, and similar destructive operations. User can override each warning. Use when touching prod, debugging live systems, or working in a shared environment. Use when asked to "be careful", "safety mode", "prod mode", or "careful mode". (gstack)'
    - name: codex
      path: .cursor/skills/gstack/codex/SKILL.md
      source: gstack
      description: 'OpenAI Codex CLI wrapper — three modes. Code review: independent diff review via codex review with pass/fail gate. Challenge: adversarial mode that tries to break your code. Consult: ask codex anything with session continuity for follow-ups. The "200 IQ autistic developer" second opinion. Use when asked to "codex review", "codex challenge", "ask codex", "second opinion", or "consult codex". (gstack) Voice triggers (…'
    - name: context-restore
      path: .cursor/skills/gstack/context-restore/SKILL.md
      source: gstack
      description: 'Restore working context saved earlier by /context-save. Loads the most recent saved state (across all branches by default) so you can pick up where you left off — even across Conductor workspace handoffs. Use when asked to "resume", "restore context", "where was I", or "pick up where I left off". Pair with /context-save. Formerly /checkpoint resume — renamed because Claude Code treats /checkpoint as a native rewind …'
    - name: context-save
      path: .cursor/skills/gstack/context-save/SKILL.md
      source: gstack
      description: 'Save working context. Captures git state, decisions made, and remaining work so any future session can pick up without losing a beat. Use when asked to "save progress", "save state", "context save", or "save my work". Pair with /context-restore to resume later. Formerly /checkpoint — renamed because Claude Code treats /checkpoint as a native rewind alias in current environments, which was shadowing this skill. (gsta…'
    - name: cso
      path: .cursor/skills/gstack/cso/SKILL.md
      source: gstack
      description: 'Chief Security Officer mode. Infrastructure-first security audit: secrets archaeology, dependency supply chain, CI/CD pipeline security, LLM/AI security, skill supply chain scanning, plus OWASP Top 10, STRIDE threat modeling, and active verification. Two modes: daily (zero-noise, 8/10 confidence gate) and comprehensive (monthly deep scan, 2/10 bar). Trend tracking across audit runs. Use when: "security audit", "thre…'
    - name: design-consultation
      path: .cursor/skills/gstack/design-consultation/SKILL.md
      source: gstack
      description: 'Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview pages. Creates DESIGN.md as your project\'s design source of truth. For existing sites, use /plan-design-review to infer the system instead. Use when asked to "design system", "brand guidelines", or "create DESIGN.md". Proa…'
    - name: design-html
      path: .cursor/skills/gstack/design-html/SKILL.md
      source: gstack
      description: 'Design finalization: generates production-quality Pretext-native HTML/CSS. Works with approved mockups from /design-shotgun, CEO plans from /plan-ceo-review, design review context from /plan-design-review, or from scratch with a user description. Text actually reflows, heights are computed, layouts are dynamic. 30KB overhead, zero deps. Smart API routing: picks the right Pretext patterns for each design type. Use wh…'
    - name: design-review
      path: .cursor/skills/gstack/design-review/SKILL.md
      source: gstack
      description: 'Designer\'s eye QA: finds visual inconsistency, spacing issues, hierarchy problems, AI slop patterns, and slow interactions — then fixes them. Iteratively fixes issues in source code, committing each fix atomically and re-verifying with before/after screenshots. For plan-mode design review (before implementation), use /plan-design-review. Use when asked to "audit the design", "visual QA", "check if it looks good", or…'
    - name: design-shotgun
      path: .cursor/skills/gstack/design-shotgun/SKILL.md
      source: gstack
      description: 'Design shotgun: generate multiple AI design variants, open a comparison board, collect structured feedback, and iterate. Standalone design exploration you can run anytime. Use when: "explore designs", "show me options", "design variants", "visual brainstorm", or "I don\'t like how this looks". Proactively suggest when the user describes a UI feature but hasn\'t seen what it could look like. (gstack)'
    - name: devex-review
      path: .cursor/skills/gstack/devex-review/SKILL.md
      source: gstack
      description: 'Live developer experience audit. Uses the browse tool to actually TEST the developer experience: navigates docs, tries the getting started flow, times TTHW, screenshots error messages, evaluates CLI help text. Produces a DX scorecard with evidence. Compares against /plan-devex-review scores if they exist (the boomerang: plan said 3 minutes, reality says 8). Use when asked to "test the DX", "DX audit", "developer exp…'
    - name: document-generate
      path: .cursor/skills/gstack/document-generate/SKILL.md
      source: gstack
      description: 'Generate missing documentation from scratch for a feature, module, or entire project. Uses the Diataxis framework (tutorial / how-to / reference / explanation) to produce complete, structured documentation. Can be invoked standalone or called by /document-release when it finds coverage gaps. Use when asked to "write docs", "generate documentation", "document this feature", "create a tutorial", or "explain this modul…'
    - name: document-release
      path: .cursor/skills/gstack/document-release/SKILL.md
      source: gstack
      description: 'Post-ship documentation update. Reads all project docs, cross-references the diff, builds a Diataxis coverage map (reference/how-to/tutorial/explanation), updates README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md to match what shipped, detects architecture diagram drift, polishes CHANGELOG voice with a sell-test rubric, cleans up TODOS, and optionally bumps VERSION. Surfaces documentation debt in the PR body. Use when aske…'
    - name: freeze
      path: .cursor/skills/gstack/freeze/SKILL.md
      source: gstack
      description: 'Restrict file edits to a specific directory for the session. Blocks Edit and Write outside the allowed path. Use when debugging to prevent accidentally "fixing" unrelated code, or when you want to scope changes to one module. Use when asked to "freeze", "restrict edits", "only edit this folder", or "lock down edits". (gstack)'
    - name: gstack
      path: .cursor/skills/gstack/SKILL.md
      source: gstack
      description: 'Fast headless browser for QA testing and site dogfooding. Navigate pages, interact with elements, verify state, diff before/after, take annotated screenshots, test responsive layouts, forms, uploads, dialogs, and capture bug evidence. Use when asked to open or test a site, verify a deployment, dogfood a user flow, or file a bug with screenshots. (gstack)'
    - name: gstack-autoplan
      path: .cursor/skills/gstack-autoplan/SKILL.md
      source: gstack
      description: 'Auto-review pipeline — reads the full CEO, design, eng, and DX review skills from disk and runs them sequentially with auto-decisions using 6 decision principles. Surfaces taste decisions (close approaches, borderline scope, codex disagreements) at a final approval gate. One command, fully reviewed plan out. Use when asked to "auto review", "autoplan", "run all reviews", "review this plan automatically", or "make th…'
    - name: gstack-benchmark
      path: .cursor/skills/gstack-benchmark/SKILL.md
      source: gstack
      description: 'Performance regression detection using the browse daemon. Establishes baselines for page load times, Core Web Vitals, and resource sizes. Compares before/after on every PR. Tracks performance trends over time. Use when: "performance", "benchmark", "page speed", "lighthouse", "web vitals", "bundle size", "load time". (gstack) Voice triggers (speech-to-text aliases): "speed test", "check performance".'
    - name: gstack-benchmark-models
      path: .cursor/skills/gstack-benchmark-models/SKILL.md
      source: gstack
      description: 'Cross-model benchmark for gstack skills. Runs the same prompt through Claude, GPT (via Codex CLI), and Gemini side-by-side — compares latency, tokens, cost, and optionally quality via LLM judge. Answers "which model is actually best for this skill?" with data instead of vibes. Separate from /benchmark, which measures web page performance. Use when: "benchmark models", "compare models", "which model is best for X", "…'
    - name: gstack-browse
      path: .cursor/skills/gstack-browse/SKILL.md
      source: gstack
      description: 'Fast headless browser for QA testing and site dogfooding. Navigate any URL, interact with elements, verify page state, diff before/after actions, take annotated screenshots, check responsive layouts, test forms and uploads, handle dialogs, and assert element states. ~100ms per command. Use when you need to test a feature, verify a deployment, dogfood a user flow, or file a bug with evidence. Use when asked to "open …'
    - name: gstack-browser-skills-hackernews-frontpage
      path: .cursor/skills/gstack-browser-skills-hackernews-frontpage/SKILL.md
      source: gstack
      description: 'Scrape the Hacker News front page (titles, points, comment counts).'
    - name: gstack-canary
      path: .cursor/skills/gstack-canary/SKILL.md
      source: gstack
      description: 'Post-deploy canary monitoring. Watches the live app for console errors, performance regressions, and page failures using the browse daemon. Takes periodic screenshots, compares against pre-deploy baselines, and alerts on anomalies. Use when: "monitor deploy", "canary", "post-deploy check", "watch production", "verify deploy". (gstack)'
    - name: gstack-careful
      path: .cursor/skills/gstack-careful/SKILL.md
      source: gstack
      description: 'Safety guardrails for destructive commands. Warns before rm -rf, DROP TABLE, force-push, git reset --hard, kubectl delete, and similar destructive operations. User can override each warning. Use when touching prod, debugging live systems, or working in a shared environment. Use when asked to "be careful", "safety mode", "prod mode", or "careful mode". (gstack)'
    - name: gstack-codex
      path: .cursor/skills/gstack-codex/SKILL.md
      source: gstack
      description: 'OpenAI Codex CLI wrapper — three modes. Code review: independent diff review via codex review with pass/fail gate. Challenge: adversarial mode that tries to break your code. Consult: ask codex anything with session continuity for follow-ups. The "200 IQ autistic developer" second opinion. Use when asked to "codex review", "codex challenge", "ask codex", "second opinion", or "consult codex". (gstack) Voice triggers (…'
    - name: gstack-context-restore
      path: .cursor/skills/gstack-context-restore/SKILL.md
      source: gstack
      description: 'Restore working context saved earlier by /context-save. Loads the most recent saved state (across all branches by default) so you can pick up where you left off — even across Conductor workspace handoffs. Use when asked to "resume", "restore context", "where was I", or "pick up where I left off". Pair with /context-save. Formerly /checkpoint resume — renamed because Claude Code treats /checkpoint as a native rewind …'
    - name: gstack-context-save
      path: .cursor/skills/gstack-context-save/SKILL.md
      source: gstack
      description: 'Save working context. Captures git state, decisions made, and remaining work so any future session can pick up without losing a beat. Use when asked to "save progress", "save state", "context save", or "save my work". Pair with /context-restore to resume later. Formerly /checkpoint — renamed because Claude Code treats /checkpoint as a native rewind alias in current environments, which was shadowing this skill. (gsta…'
    - name: gstack-cso
      path: .cursor/skills/gstack-cso/SKILL.md
      source: gstack
      description: 'Chief Security Officer mode. Infrastructure-first security audit: secrets archaeology, dependency supply chain, CI/CD pipeline security, LLM/AI security, skill supply chain scanning, plus OWASP Top 10, STRIDE threat modeling, and active verification. Two modes: daily (zero-noise, 8/10 confidence gate) and comprehensive (monthly deep scan, 2/10 bar). Trend tracking across audit runs. Use when: "security audit", "thre…'
    - name: gstack-design-consultation
      path: .cursor/skills/gstack-design-consultation/SKILL.md
      source: gstack
      description: 'Design consultation: understands your product, researches the landscape, proposes a complete design system (aesthetic, typography, color, layout, spacing, motion), and generates font+color preview pages. Creates DESIGN.md as your project\'s design source of truth. For existing sites, use /plan-design-review to infer the system instead. Use when asked to "design system", "brand guidelines", or "create DESIGN.md". Proa…'
    - name: gstack-design-html
      path: .cursor/skills/gstack-design-html/SKILL.md
      source: gstack
      description: 'Design finalization: generates production-quality Pretext-native HTML/CSS. Works with approved mockups from /design-shotgun, CEO plans from /plan-ceo-review, design review context from /plan-design-review, or from scratch with a user description. Text actually reflows, heights are computed, layouts are dynamic. 30KB overhead, zero deps. Smart API routing: picks the right Pretext patterns for each design type. Use wh…'
    - name: gstack-design-review
      path: .cursor/skills/gstack-design-review/SKILL.md
      source: gstack
      description: 'Designer\'s eye QA: finds visual inconsistency, spacing issues, hierarchy problems, AI slop patterns, and slow interactions — then fixes them. Iteratively fixes issues in source code, committing each fix atomically and re-verifying with before/after screenshots. For plan-mode design review (before implementation), use /plan-design-review. Use when asked to "audit the design", "visual QA", "check if it looks good", or…'
    - name: gstack-design-shotgun
      path: .cursor/skills/gstack-design-shotgun/SKILL.md
      source: gstack
      description: 'Design shotgun: generate multiple AI design variants, open a comparison board, collect structured feedback, and iterate. Standalone design exploration you can run anytime. Use when: "explore designs", "show me options", "design variants", "visual brainstorm", or "I don\'t like how this looks". Proactively suggest when the user describes a UI feature but hasn\'t seen what it could look like. (gstack)'
    - name: gstack-devex-review
      path: .cursor/skills/gstack-devex-review/SKILL.md
      source: gstack
      description: 'Live developer experience audit. Uses the browse tool to actually TEST the developer experience: navigates docs, tries the getting started flow, times TTHW, screenshots error messages, evaluates CLI help text. Produces a DX scorecard with evidence. Compares against /plan-devex-review scores if they exist (the boomerang: plan said 3 minutes, reality says 8). Use when asked to "test the DX", "DX audit", "developer exp…'
    - name: gstack-document-generate
      path: .cursor/skills/gstack-document-generate/SKILL.md
      source: gstack
      description: 'Generate missing documentation from scratch for a feature, module, or entire project. Uses the Diataxis framework (tutorial / how-to / reference / explanation) to produce complete, structured documentation. Can be invoked standalone or called by /document-release when it finds coverage gaps. Use when asked to "write docs", "generate documentation", "document this feature", "create a tutorial", or "explain this modul…'
    - name: gstack-document-release
      path: .cursor/skills/gstack-document-release/SKILL.md
      source: gstack
      description: 'Post-ship documentation update. Reads all project docs, cross-references the diff, builds a Diataxis coverage map (reference/how-to/tutorial/explanation), updates README/ARCHITECTURE/CONTRIBUTING/CLAUDE.md to match what shipped, detects architecture diagram drift, polishes CHANGELOG voice with a sell-test rubric, cleans up TODOS, and optionally bumps VERSION. Surfaces documentation debt in the PR body. Use when aske…'
    - name: gstack-freeze
      path: .cursor/skills/gstack-freeze/SKILL.md
      source: gstack
      description: 'Restrict file edits to a specific directory for the session. Blocks Edit and Write outside the allowed path. Use when debugging to prevent accidentally "fixing" unrelated code, or when you want to scope changes to one module. Use when asked to "freeze", "restrict edits", "only edit this folder", or "lock down edits". (gstack)'
    - name: gstack-gstack-upgrade
      path: .cursor/skills/gstack-gstack-upgrade/SKILL.md
      source: gstack
      description: 'Upgrade gstack to the latest version. Detects global vs vendored install, runs the upgrade, and shows what\'s new. Use when asked to "upgrade gstack", "update gstack", or "get latest version". Voice triggers (speech-to-text aliases): "upgrade the tools", "update the tools", "gee stack upgrade", "g stack upgrade".'
    - name: gstack-guard
      path: .cursor/skills/gstack-guard/SKILL.md
      source: gstack
      description: 'Full safety mode: destructive command warnings + directory-scoped edits. Combines /careful (warns before rm -rf, DROP TABLE, force-push, etc.) with /freeze (blocks edits outside a specified directory). Use for maximum safety when touching prod or debugging live systems. Use when asked to "guard mode", "full safety", "lock it down", or "maximum safety". (gstack)'
    - name: gstack-health
      path: .cursor/skills/gstack-health/SKILL.md
      source: gstack
      description: 'Code quality dashboard. Wraps existing project tools (type checker, linter, test runner, dead code detector, shell linter), computes a weighted composite 0-10 score, and tracks trends over time. Use when: "health check", "code quality", "how healthy is the codebase", "run all checks", "quality score". (gstack)'
    - name: gstack-investigate
      path: .cursor/skills/gstack-investigate/SKILL.md
      source: gstack
      description: 'Systematic debugging with root cause investigation. Four phases: investigate, analyze, hypothesize, implement. Iron Law: no fixes without root cause. Use when asked to "debug this", "fix this bug", "why is this broken", "investigate this error", or "root cause analysis". Proactively invoke this skill (do NOT debug directly) when the user reports errors, 500 errors, stack traces, unexpected behavior, "it was working …'
    - name: gstack-land-and-deploy
      path: .cursor/skills/gstack-land-and-deploy/SKILL.md
      source: gstack
      description: 'Land and deploy workflow. Merges the PR, waits for CI and deploy, verifies production health via canary checks. Takes over after /ship creates the PR. Use when: "merge", "land", "deploy", "merge and verify", "land it", "ship it to production". (gstack)'
    - name: gstack-landing-report
      path: .cursor/skills/gstack-landing-report/SKILL.md
      source: gstack
      description: 'Read-only queue dashboard for workspace-aware ship. Shows which VERSION slots are currently claimed by open PRs, which sibling Conductor workspaces have WIP work likely to ship soon, and what slot /ship would pick next. No mutations — just a snapshot. Use when asked to "landing report", "what\'s in the queue", "show me open PRs", or "which version do I claim next". (gstack)'
    - name: gstack-learn
      path: .cursor/skills/gstack-learn/SKILL.md
      source: gstack
      description: 'Manage project learnings. Review, search, prune, and export what gstack has learned across sessions. Use when asked to "what have we learned", "show learnings", "prune stale learnings", or "export learnings". Proactively suggest when the user asks about past patterns or wonders "didn\'t we fix this before?"'
    - name: gstack-make-pdf
      path: .cursor/skills/gstack-make-pdf/SKILL.md
      source: gstack
      description: 'Turn any markdown file into a publication-quality PDF. Proper 1in margins, intelligent page breaks, page numbers, cover pages, running headers, curly quotes and em dashes, clickable TOC, diagonal DRAFT watermark. Not a draft artifact — a finished artifact. Use when asked to "make a PDF", "export to PDF", "turn this markdown into a PDF", or "generate a document". (gstack) Voice triggers (speech-to-text aliases): "mak…'
    - name: gstack-office-hours
      path: .cursor/skills/gstack-office-hours/SKILL.md
      source: gstack
      description: 'YC Office Hours — two modes. Startup mode: six forcing questions that expose demand reality, status quo, desperate specificity, narrowest wedge, observation, and future-fit. Builder mode: design thinking brainstorming for side projects, hackathons, learning, and open source. Saves a design doc. Use when asked to "brainstorm this", "I have an idea", "help me think through this", "office hours", or "is this worth buil…'
    - name: gstack-open-gstack-browser
      path: .cursor/skills/gstack-open-gstack-browser/SKILL.md
      source: gstack
      description: 'Launch GStack Browser — AI-controlled Chromium with the sidebar extension baked in. Opens a visible browser window where you can watch every action in real time. The sidebar shows a live activity feed and chat. Anti-bot stealth built in. Use when asked to "open gstack browser", "launch browser", "connect chrome", "open chrome", "real browser", "launch chrome", "side panel", or "control my browser". Voice triggers (s…'
    - name: gstack-openclaw-ceo-review
      path: .cursor/skills/gstack/openclaw/skills/gstack-openclaw-ceo-review/SKILL.md
      source: gstack
      description: 'Use when asked to review a plan, challenge a proposal, run a CEO review, poke holes in an approach, think bigger about scope, or decide whether to expand or reduce the plan.'
    - name: gstack-openclaw-investigate
      path: .cursor/skills/gstack/openclaw/skills/gstack-openclaw-investigate/SKILL.md
      source: gstack
      description: 'Use when asked to debug, fix a bug, investigate an error, or do root cause analysis, and when users report errors, stack traces, unexpected behavior, or say something stopped working.'
    - name: gstack-openclaw-office-hours
      path: .cursor/skills/gstack/openclaw/skills/gstack-openclaw-office-hours/SKILL.md
      source: gstack
      description: 'Use when asked to brainstorm, evaluate whether an idea is worth building, run office hours, or think through a new product idea or design direction before any code is written.'
    - name: gstack-openclaw-retro
      path: .cursor/skills/gstack/openclaw/skills/gstack-openclaw-retro/SKILL.md
      source: gstack
      description: 'Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware with per-person contributions, praise, and growth areas. Use when asked for weekly retro, what shipped this week, or engineering retrospective.'
    - name: gstack-openclaw-skills-gstack-openclaw-ceo-review
      path: .cursor/skills/gstack-openclaw-skills-gstack-openclaw-ceo-review/SKILL.md
      source: gstack
      description: 'Use when asked to review a plan, challenge a proposal, run a CEO review, poke holes in an approach, think bigger about scope, or decide whether to expand or reduce the plan.'
    - name: gstack-openclaw-skills-gstack-openclaw-investigate
      path: .cursor/skills/gstack-openclaw-skills-gstack-openclaw-investigate/SKILL.md
      source: gstack
      description: 'Use when asked to debug, fix a bug, investigate an error, or do root cause analysis, and when users report errors, stack traces, unexpected behavior, or say something stopped working.'
    - name: gstack-openclaw-skills-gstack-openclaw-office-hours
      path: .cursor/skills/gstack-openclaw-skills-gstack-openclaw-office-hours/SKILL.md
      source: gstack
      description: 'Use when asked to brainstorm, evaluate whether an idea is worth building, run office hours, or think through a new product idea or design direction before any code is written.'
    - name: gstack-openclaw-skills-gstack-openclaw-retro
      path: .cursor/skills/gstack-openclaw-skills-gstack-openclaw-retro/SKILL.md
      source: gstack
      description: 'Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware with per-person contributions, praise, and growth areas. Use when asked for weekly retro, what shipped this week, or engineering retrospective.'
    - name: gstack-pair-agent
      path: .cursor/skills/gstack-pair-agent/SKILL.md
      source: gstack
      description: 'Pair a remote AI agent with your browser. One command generates a setup key and prints instructions the other agent can follow to connect. Works with OpenClaw, Hermes, Codex, Cursor, or any agent that can make HTTP requests. The remote agent gets its own tab with scoped access (read+write by default, admin on request). Use when asked to "pair agent", "connect agent", "share browser", "remote browser", "let another a…'
    - name: gstack-plan-ceo-review
      path: .cursor/skills/gstack-plan-ceo-review/SKILL.md
      source: gstack
      description: 'CEO/founder-mode plan review. Rethink the problem, find the 10-star product, challenge premises, expand scope when it creates a better product. Four modes: SCOPE EXPANSION (dream big), SELECTIVE EXPANSION (hold scope + cherry-pick expansions), HOLD SCOPE (maximum rigor), SCOPE REDUCTION (strip to essentials). Use when asked to "think bigger", "expand scope", "strategy review", "rethink this", or "is this ambitious e…'
    - name: gstack-plan-design-review
      path: .cursor/skills/gstack-plan-design-review/SKILL.md
      source: gstack
      description: 'Designer\'s eye plan review — interactive, like CEO and Eng review. Rates each design dimension 0-10, explains what would make it a 10, then fixes the plan to get there. Works in plan mode. For live site visual audits, use /design-review. Use when asked to "review the design plan" or "design critique". Proactively suggest when the user has a plan with UI/UX components that should be reviewed before implementation. (g…'
    - name: gstack-plan-devex-review
      path: .cursor/skills/gstack-plan-devex-review/SKILL.md
      source: gstack
      description: 'Interactive developer experience plan review. Explores developer personas, benchmarks against competitors, designs magical moments, and traces friction points before scoring. Three modes: DX EXPANSION (competitive advantage), DX POLISH (bulletproof every touchpoint), DX TRIAGE (critical gaps only). Use when asked to "DX review", "developer experience audit", "devex review", or "API design review". Proactively sugges…'
    - name: gstack-plan-eng-review
      path: .cursor/skills/gstack-plan-eng-review/SKILL.md
      source: gstack
      description: 'Eng manager-mode plan review. Lock in the execution plan — architecture, data flow, diagrams, edge cases, test coverage, performance. Walks through issues interactively with opinionated recommendations. Use when asked to "review the architecture", "engineering review", or "lock in the plan". Proactively suggest when the user has a plan or design doc and is about to start coding — to catch architecture issues before …'
    - name: gstack-plan-tune
      path: .cursor/skills/gstack-plan-tune/SKILL.md
      source: gstack
      description: 'Self-tuning question sensitivity + developer psychographic for gstack (v1: observational). Review which AskUserQuestion prompts fire across gstack skills, set per-question preferences (never-ask / always-ask / ask-only-for-one-way), inspect the dual-track profile (what you declared vs what your behavior suggests), and enable/disable question tuning. Conversational interface — no CLI syntax required. Use when asked t…'
    - name: gstack-qa
      path: .cursor/skills/gstack-qa/SKILL.md
      source: gstack
      description: 'Systematically QA test a web application and fix bugs found. Runs QA testing, then iteratively fixes bugs in source code, committing each fix atomically and re-verifying. Use when asked to "qa", "QA", "test this site", "find bugs", "test and fix", or "fix what\'s broken". Proactively suggest when the user says a feature is ready for testing or asks "does this work?". Three tiers: Quick (critical/high only), Standard …'
    - name: gstack-qa-only
      path: .cursor/skills/gstack-qa-only/SKILL.md
      source: gstack
      description: 'Report-only QA testing. Systematically tests a web application and produces a structured report with health score, screenshots, and repro steps — but never fixes anything. Use when asked to "just report bugs", "qa report only", or "test but don\'t fix". For the full test-fix-verify loop, use /qa instead. Proactively suggest when the user wants a bug report without any code changes. (gstack) Voice triggers (speech-to-…'
    - name: gstack-retro
      path: .cursor/skills/gstack-retro/SKILL.md
      source: gstack
      description: 'Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware: breaks down per-person contributions with praise and growth areas. Use when asked to "weekly retro", "what did we ship", or "engineering retrospective". Proactively suggest at the end of a work week or sprint. (gstack)'
    - name: gstack-review
      path: .cursor/skills/gstack-review/SKILL.md
      source: gstack
      description: 'Pre-landing PR review. Analyzes diff against the base branch for SQL safety, LLM trust boundary violations, conditional side effects, and other structural issues. Use when asked to "review this PR", "code review", "pre-landing review", or "check my diff". Proactively suggest when the user is about to merge or land code changes. (gstack)'
    - name: gstack-scrape
      path: .cursor/skills/gstack-scrape/SKILL.md
      source: gstack
      description: 'Pull data from a web page. First call on a new intent prototypes the flow via $B primitives and returns JSON. Subsequent calls on a matching intent route to a codified browser-skill and return in ~200ms. Read-only — for mutating flows (form fills, clicks, submissions), use /automate. Use when asked to "scrape", "get data from", "pull", "extract from", or "what\'s on" a page. (gstack)'
    - name: gstack-setup-browser-cookies
      path: .cursor/skills/gstack-setup-browser-cookies/SKILL.md
      source: gstack
      description: 'Import cookies from your real Chromium browser into the headless browse session. Opens an interactive picker UI where you select which cookie domains to import. Use before QA testing authenticated pages. Use when asked to "import cookies", "login to the site", or "authenticate the browser". (gstack)'
    - name: gstack-setup-deploy
      path: .cursor/skills/gstack-setup-deploy/SKILL.md
      source: gstack
      description: 'Configure deployment settings for /land-and-deploy. Detects your deploy platform (Fly.io, Render, Vercel, Netlify, Heroku, GitHub Actions, custom), production URL, health check endpoints, and deploy status commands. Writes the configuration to CLAUDE.md so all future deploys are automatic. Use when: "setup deploy", "configure deployment", "set up land-and-deploy", "how do I deploy with gstack", "add deploy config".'
    - name: gstack-setup-gbrain
      path: .cursor/skills/gstack-setup-gbrain/SKILL.md
      source: gstack
      description: 'Set up gbrain for this coding agent: install the CLI, initialize a local PGLite or Supabase brain, register MCP, capture per-remote trust policy. One command from zero to "gbrain is running, and this agent can call it." Use when: "setup gbrain", "connect gbrain", "start gbrain", "install gbrain", "configure gbrain for this machine". (gstack)'
    - name: gstack-ship
      path: .cursor/skills/gstack-ship/SKILL.md
      source: gstack
      description: 'Ship workflow: detect + merge base branch, run tests, review diff, bump VERSION, update CHANGELOG, commit, push, create PR. Use when asked to "ship", "deploy", "push to main", "create a PR", "merge and push", or "get it deployed". Proactively invoke this skill (do NOT push/PR directly) when the user says code is ready, asks about deploying, wants to push code up, or asks to create a PR. (gstack)'
    - name: gstack-skillify
      path: .cursor/skills/gstack-skillify/SKILL.md
      source: gstack
      description: 'Codify the most recent successful /scrape flow into a permanent browser-skill on disk. Future /scrape calls with the same intent run the codified script in ~200ms instead of re-driving the page. Walks back through the conversation, synthesizes script.ts + script.test.ts + fixture, runs the test in a temp dir, and asks before committing. Use when asked to "skillify", "codify", "save this scrape", or "make this perman…'
    - name: gstack-sync-gbrain
      path: .cursor/skills/gstack-sync-gbrain/SKILL.md
      source: gstack
      description: 'Keep gbrain current with this repo\'s code and refresh agent search guidance in CLAUDE.md. Wraps the gstack-gbrain-sync orchestrator with state probing, native code-surface registration, capability checks, and a verdict block. Re-runnable, idempotent. Use when: "sync gbrain", "refresh gbrain", "re-index this repo", "gbrain search isn\'t finding things". (gstack)'
    - name: gstack-unfreeze
      path: .cursor/skills/gstack-unfreeze/SKILL.md
      source: gstack
      description: 'Clear the freeze boundary set by /freeze, allowing edits to all directories again. Use when you want to widen edit scope without ending the session. Use when asked to "unfreeze", "unlock edits", "remove freeze", or "allow all edits". (gstack)'
    - name: gstack-upgrade
      path: .cursor/skills/gstack/gstack-upgrade/SKILL.md
      source: gstack
      description: 'Upgrade gstack to the latest version. Detects global vs vendored install, runs the upgrade, and shows what\'s new. Use when asked to "upgrade gstack", "update gstack", or "get latest version". Voice triggers (speech-to-text aliases): "upgrade the tools", "update the tools", "gee stack upgrade", "g stack upgrade".'
    - name: guard
      path: .cursor/skills/gstack/guard/SKILL.md
      source: gstack
      description: 'Full safety mode: destructive command warnings + directory-scoped edits. Combines /careful (warns before rm -rf, DROP TABLE, force-push, etc.) with /freeze (blocks edits outside a specified directory). Use for maximum safety when touching prod or debugging live systems. Use when asked to "guard mode", "full safety", "lock it down", or "maximum safety". (gstack)'
    - name: hackernews-frontpage
      path: .cursor/skills/gstack/browser-skills/hackernews-frontpage/SKILL.md
      source: gstack
      description: 'Scrape the Hacker News front page (titles, points, comment counts).'
    - name: health
      path: .cursor/skills/gstack/health/SKILL.md
      source: gstack
      description: 'Code quality dashboard. Wraps existing project tools (type checker, linter, test runner, dead code detector, shell linter), computes a weighted composite 0-10 score, and tracks trends over time. Use when: "health check", "code quality", "how healthy is the codebase", "run all checks", "quality score". (gstack)'
    - name: investigate
      path: .cursor/skills/gstack/investigate/SKILL.md
      source: gstack
      description: 'Systematic debugging with root cause investigation. Four phases: investigate, analyze, hypothesize, implement. Iron Law: no fixes without root cause. Use when asked to "debug this", "fix this bug", "why is this broken", "investigate this error", or "root cause analysis". Proactively invoke this skill (do NOT debug directly) when the user reports errors, 500 errors, stack traces, unexpected behavior, "it was working …'
    - name: land-and-deploy
      path: .cursor/skills/gstack/land-and-deploy/SKILL.md
      source: gstack
      description: 'Land and deploy workflow. Merges the PR, waits for CI and deploy, verifies production health via canary checks. Takes over after /ship creates the PR. Use when: "merge", "land", "deploy", "merge and verify", "land it", "ship it to production". (gstack)'
    - name: landing-report
      path: .cursor/skills/gstack/landing-report/SKILL.md
      source: gstack
      description: 'Read-only queue dashboard for workspace-aware ship. Shows which VERSION slots are currently claimed by open PRs, which sibling Conductor workspaces have WIP work likely to ship soon, and what slot /ship would pick next. No mutations — just a snapshot. Use when asked to "landing report", "what\'s in the queue", "show me open PRs", or "which version do I claim next". (gstack)'
    - name: learn
      path: .cursor/skills/gstack/learn/SKILL.md
      source: gstack
      description: 'Manage project learnings. Review, search, prune, and export what gstack has learned across sessions. Use when asked to "what have we learned", "show learnings", "prune stale learnings", or "export learnings". Proactively suggest when the user asks about past patterns or wonders "didn\'t we fix this before?"'
    - name: make-pdf
      path: .cursor/skills/gstack/make-pdf/SKILL.md
      source: gstack
      description: 'Turn any markdown file into a publication-quality PDF. Proper 1in margins, intelligent page breaks, page numbers, cover pages, running headers, curly quotes and em dashes, clickable TOC, diagonal DRAFT watermark. Not a draft artifact — a finished artifact. Use when asked to "make a PDF", "export to PDF", "turn this markdown into a PDF", or "generate a document". (gstack) Voice triggers (speech-to-text aliases): "mak…'
    - name: office-hours
      path: .cursor/skills/gstack/office-hours/SKILL.md
      source: gstack
      description: 'YC Office Hours — two modes. Startup mode: six forcing questions that expose demand reality, status quo, desperate specificity, narrowest wedge, observation, and future-fit. Builder mode: design thinking brainstorming for side projects, hackathons, learning, and open source. Saves a design doc. Use when asked to "brainstorm this", "I have an idea", "help me think through this", "office hours", or "is this worth buil…'
    - name: open-gstack-browser
      path: .cursor/skills/gstack/connect-chrome/SKILL.md
      source: gstack
      description: 'Launch GStack Browser — AI-controlled Chromium with the sidebar extension baked in. Opens a visible browser window where you can watch every action in real time. The sidebar shows a live activity feed and chat. Anti-bot stealth built in. Use when asked to "open gstack browser", "launch browser", "connect chrome", "open chrome", "real browser", "launch chrome", "side panel", or "control my browser". Voice triggers (s…'
    - name: open-gstack-browser
      path: .cursor/skills/gstack/open-gstack-browser/SKILL.md
      source: gstack
      description: 'Launch GStack Browser — AI-controlled Chromium with the sidebar extension baked in. Opens a visible browser window where you can watch every action in real time. The sidebar shows a live activity feed and chat. Anti-bot stealth built in. Use when asked to "open gstack browser", "launch browser", "connect chrome", "open chrome", "real browser", "launch chrome", "side panel", or "control my browser". Voice triggers (s…'
    - name: pair-agent
      path: .cursor/skills/gstack/pair-agent/SKILL.md
      source: gstack
      description: 'Pair a remote AI agent with your browser. One command generates a setup key and prints instructions the other agent can follow to connect. Works with OpenClaw, Hermes, Codex, Cursor, or any agent that can make HTTP requests. The remote agent gets its own tab with scoped access (read+write by default, admin on request). Use when asked to "pair agent", "connect agent", "share browser", "remote browser", "let another a…'
    - name: plan-ceo-review
      path: .cursor/skills/gstack/plan-ceo-review/SKILL.md
      source: gstack
      description: 'CEO/founder-mode plan review. Rethink the problem, find the 10-star product, challenge premises, expand scope when it creates a better product. Four modes: SCOPE EXPANSION (dream big), SELECTIVE EXPANSION (hold scope + cherry-pick expansions), HOLD SCOPE (maximum rigor), SCOPE REDUCTION (strip to essentials). Use when asked to "think bigger", "expand scope", "strategy review", "rethink this", or "is this ambitious e…'
    - name: plan-design-review
      path: .cursor/skills/gstack/plan-design-review/SKILL.md
      source: gstack
      description: 'Designer\'s eye plan review — interactive, like CEO and Eng review. Rates each design dimension 0-10, explains what would make it a 10, then fixes the plan to get there. Works in plan mode. For live site visual audits, use /design-review. Use when asked to "review the design plan" or "design critique". Proactively suggest when the user has a plan with UI/UX components that should be reviewed before implementation. (g…'
    - name: plan-devex-review
      path: .cursor/skills/gstack/plan-devex-review/SKILL.md
      source: gstack
      description: 'Interactive developer experience plan review. Explores developer personas, benchmarks against competitors, designs magical moments, and traces friction points before scoring. Three modes: DX EXPANSION (competitive advantage), DX POLISH (bulletproof every touchpoint), DX TRIAGE (critical gaps only). Use when asked to "DX review", "developer experience audit", "devex review", or "API design review". Proactively sugges…'
    - name: plan-eng-review
      path: .cursor/skills/gstack/plan-eng-review/SKILL.md
      source: gstack
      description: 'Eng manager-mode plan review. Lock in the execution plan — architecture, data flow, diagrams, edge cases, test coverage, performance. Walks through issues interactively with opinionated recommendations. Use when asked to "review the architecture", "engineering review", or "lock in the plan". Proactively suggest when the user has a plan or design doc and is about to start coding — to catch architecture issues before …'
    - name: plan-tune
      path: .cursor/skills/gstack/plan-tune/SKILL.md
      source: gstack
      description: 'Self-tuning question sensitivity + developer psychographic for gstack (v1: observational). Review which AskUserQuestion prompts fire across gstack skills, set per-question preferences (never-ask / always-ask / ask-only-for-one-way), inspect the dual-track profile (what you declared vs what your behavior suggests), and enable/disable question tuning. Conversational interface — no CLI syntax required. Use when asked t…'
    - name: qa
      path: .cursor/skills/gstack/qa/SKILL.md
      source: gstack
      description: 'Systematically QA test a web application and fix bugs found. Runs QA testing, then iteratively fixes bugs in source code, committing each fix atomically and re-verifying. Use when asked to "qa", "QA", "test this site", "find bugs", "test and fix", or "fix what\'s broken". Proactively suggest when the user says a feature is ready for testing or asks "does this work?". Three tiers: Quick (critical/high only), Standard …'
    - name: qa-only
      path: .cursor/skills/gstack/qa-only/SKILL.md
      source: gstack
      description: 'Report-only QA testing. Systematically tests a web application and produces a structured report with health score, screenshots, and repro steps — but never fixes anything. Use when asked to "just report bugs", "qa report only", or "test but don\'t fix". For the full test-fix-verify loop, use /qa instead. Proactively suggest when the user wants a bug report without any code changes. (gstack) Voice triggers (speech-to-…'
    - name: retro
      path: .cursor/skills/gstack/retro/SKILL.md
      source: gstack
      description: 'Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware: breaks down per-person contributions with praise and growth areas. Use when asked to "weekly retro", "what did we ship", or "engineering retrospective". Proactively suggest at the end of a work week or sprint. (gstack)'
    - name: review
      path: .cursor/skills/gstack/review/SKILL.md
      source: gstack
      description: 'Pre-landing PR review. Analyzes diff against the base branch for SQL safety, LLM trust boundary violations, conditional side effects, and other structural issues. Use when asked to "review this PR", "code review", "pre-landing review", or "check my diff". Proactively suggest when the user is about to merge or land code changes. (gstack)'
    - name: scrape
      path: .cursor/skills/gstack/scrape/SKILL.md
      source: gstack
      description: 'Pull data from a web page. First call on a new intent prototypes the flow via $B primitives and returns JSON. Subsequent calls on a matching intent route to a codified browser-skill and return in ~200ms. Read-only — for mutating flows (form fills, clicks, submissions), use /automate. Use when asked to "scrape", "get data from", "pull", "extract from", or "what\'s on" a page. (gstack)'
    - name: setup-browser-cookies
      path: .cursor/skills/gstack/setup-browser-cookies/SKILL.md
      source: gstack
      description: 'Import cookies from your real Chromium browser into the headless browse session. Opens an interactive picker UI where you select which cookie domains to import. Use before QA testing authenticated pages. Use when asked to "import cookies", "login to the site", or "authenticate the browser". (gstack)'
    - name: setup-deploy
      path: .cursor/skills/gstack/setup-deploy/SKILL.md
      source: gstack
      description: 'Configure deployment settings for /land-and-deploy. Detects your deploy platform (Fly.io, Render, Vercel, Netlify, Heroku, GitHub Actions, custom), production URL, health check endpoints, and deploy status commands. Writes the configuration to CLAUDE.md so all future deploys are automatic. Use when: "setup deploy", "configure deployment", "set up land-and-deploy", "how do I deploy with gstack", "add deploy config".'
    - name: setup-gbrain
      path: .cursor/skills/gstack/setup-gbrain/SKILL.md
      source: gstack
      description: 'Set up gbrain for this coding agent: install the CLI, initialize a local PGLite or Supabase brain, register MCP, capture per-remote trust policy. One command from zero to "gbrain is running, and this agent can call it." Use when: "setup gbrain", "connect gbrain", "start gbrain", "install gbrain", "configure gbrain for this machine". (gstack)'
    - name: ship
      path: .cursor/skills/gstack/ship/SKILL.md
      source: gstack
      description: 'Ship workflow: detect + merge base branch, run tests, review diff, bump VERSION, update CHANGELOG, commit, push, create PR. Use when asked to "ship", "deploy", "push to main", "create a PR", "merge and push", or "get it deployed". Proactively invoke this skill (do NOT push/PR directly) when the user says code is ready, asks about deploying, wants to push code up, or asks to create a PR. (gstack)'
    - name: skillify
      path: .cursor/skills/gstack/skillify/SKILL.md
      source: gstack
      description: 'Codify the most recent successful /scrape flow into a permanent browser-skill on disk. Future /scrape calls with the same intent run the codified script in ~200ms instead of re-driving the page. Walks back through the conversation, synthesizes script.ts + script.test.ts + fixture, runs the test in a temp dir, and asks before committing. Use when asked to "skillify", "codify", "save this scrape", or "make this perman…'
    - name: sync-gbrain
      path: .cursor/skills/gstack/sync-gbrain/SKILL.md
      source: gstack
      description: 'Keep gbrain current with this repo\'s code and refresh agent search guidance in CLAUDE.md. Wraps the gstack-gbrain-sync orchestrator with state probing, native code-surface registration, capability checks, and a verdict block. Re-runnable, idempotent. Use when: "sync gbrain", "refresh gbrain", "re-index this repo", "gbrain search isn\'t finding things". (gstack)'
    - name: unfreeze
      path: .cursor/skills/gstack/unfreeze/SKILL.md
      source: gstack
      description: 'Clear the freeze boundary set by /freeze, allowing edits to all directories again. Use when you want to widen edit scope without ending the session. Use when asked to "unfreeze", "unlock edits", "remove freeze", or "allow all edits". (gstack)'
  planning-architecture-review:
    - name: behavioral-modes
      path: .cursor/skills/behavioral-modes/SKILL.md
      source: linktrend-skills
      description: 'AI operational modes (brainstorm, implement, debug, review, teach, ship, orchestrate). Use to adapt behavior based on task type.'
      allowed_tools: 'Read, Glob, Grep'
    - name: clean-code
      path: .cursor/skills/clean-code/SKILL.md
      source: linktrend-skills
      description: 'Pragmatic coding standards - concise, direct, no over-engineering, no unnecessary comments'
      allowed_tools: 'Read, Write, Edit'
    - name: multiplayer
      path: .cursor/skills/game-development/multiplayer/SKILL.md
      source: link-antigravity-kit
      description: 'Multiplayer game development principles. Architecture, networking, synchronization.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: plan-writing
      path: .cursor/skills/plan-writing/SKILL.md
      source: linktrend-skills
      description: 'Structured task planning with clear breakdowns, dependencies, and verification criteria. Use when implementing features, refactoring, or any multi-step work.'
      allowed_tools: 'Read, Glob, Grep'
  security:
    - name: nodejs-best-practices
      path: .cursor/skills/nodejs-best-practices/SKILL.md
      source: linktrend-skills
      description: 'Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep'
    - name: red-team-tactics
      path: .cursor/skills/red-team-tactics/SKILL.md
      source: linktrend-skills
      description: 'Red team tactics principles based on MITRE ATT&CK. Attack phases, detection evasion, reporting.'
      allowed_tools: 'Read, Glob, Grep'
    - name: vulnerability-scanner
      path: .cursor/skills/vulnerability-scanner/SKILL.md
      source: linktrend-skills
      description: 'Advanced vulnerability analysis principles. OWASP 2025, Supply Chain Security, attack surface mapping, risk prioritization.'
      allowed_tools: 'Read, Glob, Grep, Bash'
  testing-quality:
    - name: lint-and-validate
      path: .cursor/skills/lint-and-validate/SKILL.md
      source: linktrend-skills
      description: 'Automatic quality control, linting, and static analysis procedures. Use after every code modification to ensure syntax correctness and project standards. Triggers onKeywords: lint, format, check, validate, types, static analysis.'
      allowed_tools: 'Read, Glob, Grep, Bash'
    - name: tdd-workflow
      path: .cursor/skills/tdd-workflow/SKILL.md
      source: linktrend-skills
      description: 'Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: testing-patterns
      path: .cursor/skills/testing-patterns/SKILL.md
      source: linktrend-skills
      description: 'Testing patterns and principles. Unit, integration, mocking strategies.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
    - name: webapp-testing
      path: .cursor/skills/webapp-testing/SKILL.md
      source: linktrend-skills
      description: 'Web application testing principles. E2E, Playwright, deep audit strategies.'
      allowed_tools: 'Read, Write, Edit, Glob, Grep, Bash'
mcp_servers:
  - name: cursor-ide-browser
    descriptor_path: /Users/linktrend/.cursor/projects/Users-linktrend-Projects-LiNKtrend-System/mcps/cursor-ide-browser
    tool_count: 26
    resource_count: 0
    tools: [browser_click, browser_console_messages, browser_drag, browser_fill, browser_fill_form, browser_get_bounding_box, browser_handle_dialog, browser_highlight, browser_hover, browser_lock, browser_mouse_click_xy, browser_navigate, browser_navigate_back, browser_network_requests, browser_press_key, browser_profile_start, browser_profile_stop, browser_resize, browser_scroll, browser_search, browser_select_option, browser_snapshot, browser_tabs, browser_take_screenshot ...]
  - name: plugin-shadcn-shadcn
    descriptor_path: /Users/linktrend/.cursor/projects/Users-linktrend-Projects-LiNKtrend-System/mcps/plugin-shadcn-shadcn
    tool_count: 7
    resource_count: 0
    tools: [get_add_command_for_items, get_audit_checklist, get_item_examples_from_registries, get_project_registries, list_items_in_registries, search_items_in_registries, view_items_in_registries]
  - name: plugin-slack-slack
    descriptor_path: /Users/linktrend/.cursor/projects/Users-linktrend-Projects-LiNKtrend-System/mcps/plugin-slack-slack
    tool_count: 1
    resource_count: 0
    tools: [mcp_auth]
  - name: plugin-supabase-supabase
    descriptor_path: /Users/linktrend/.cursor/projects/Users-linktrend-Projects-LiNKtrend-System/mcps/plugin-supabase-supabase
    tool_count: 29
    resource_count: 0
    tools: [apply_migration, confirm_cost, create_branch, create_project, delete_branch, deploy_edge_function, execute_sql, generate_typescript_types, get_advisors, get_cost, get_edge_function, get_logs, get_organization, get_project, get_project_url, get_publishable_keys, list_branches, list_edge_functions, list_extensions, list_migrations, list_organizations, list_projects, list_tables, merge_branch ...]
plugin_indexes:
  - path: /Users/linktrend/.cursor/plugins/cache
    use: Cursor-installed plugin skills, rules, and cached plugin assets; inspect only when a plugin capability is relevant.
  - path: .cursor/mcp.json
    use: Project MCP server configuration, currently including shadcn MCP.
---

# LiNKtrend Skills Catalog

This file is an index, not the source of each skill. Use it to choose which skill bodies, MCP descriptors, and plugin references to open for a task.

## Selection Workflow

1. Match the user request to one or more `skill_categories` above.
2. Read the selected skill `SKILL.md` files only.
3. If the task involves a provider/tool, inspect the relevant MCP server folder and tool descriptor JSON before calling tools.
4. If a Cursor plugin capability is likely relevant, inspect `/Users/linktrend/.cursor/plugins/cache` or the project `.cursor/mcp.json` entry for that plugin.
5. Apply all always-on `.cursor/rules/*.mdc`; this catalog does not override repo rules or user instructions.

## Notes

- GStack skills are imported with `gstack-*` names to avoid collisions with LiNKtrend skills.
- Some imported skills include host-specific instructions for other agents. Adapt them to Cursor tool names and this repo’s rules.
- MCP tools are not invoked from this catalog. Always inspect the live descriptor first.
