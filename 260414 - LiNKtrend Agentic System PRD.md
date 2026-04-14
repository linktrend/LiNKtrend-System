# **1\. Introduction, Purpose, Product Scope, and Reading Guide**

## **1.1 Purpose of This PRD**

This document is the product requirements document for the proprietary LiNKtrend monorepo. Its purpose is to define, in implementation-oriented terms, what the monorepo product must contain, how it must be structured, what behaviors it must support, what responsibilities belong to each application and shared package, what constraints apply to the system, and what acceptance conditions must be met for the first serious version of the product to be considered correctly built.

This PRD exists downstream of the master architecture and system-definition document. The master architecture document explains the system at the conceptual and structural level. It defines the governing principles, the system components, the trust boundaries, the data model direction, the worker model, the security posture, and the distinction between current build scope and future extensions. This PRD assumes that those architectural decisions have already been made and approved. Its role is not to reopen them casually. Its role is to translate them into a build-governing specification for the monorepo product itself.

The monorepo is not simply a code container. It is the owned software product that implements the LiNKtrend command centre, shared logic, central runtime integration layers, observability packages, and surrounding services that together form the proprietary side of the system. Because of that, this PRD must do more than describe code layout. It must define product intent, app/package responsibilities, runtime expectations, storage requirements, security behaviors, build order, and quality gates. In other words, it must describe not only where the code goes, but what the monorepo is for and how it must behave when implemented correctly.

A second purpose of this PRD is to prevent implementation drift inside the monorepo. In a multi-app and multi-package codebase, drift often appears through small local decisions. One package begins to own data that should belong elsewhere. One app begins to embed logic that should live in a shared package. One runtime wrapper becomes the accidental owner of a concept that should be centrally governed. Over time, the system loses clarity. This PRD exists to make such drift easier to detect by defining the boundaries and obligations of the monorepo product clearly enough that future code can be judged against them.

A third purpose of this PRD is to support AI-assisted implementation. The monorepo will be built by a non-technical solo founder working with AI coding tools. That means vague product guidance is not good enough. AI-assisted engineering performs best when the target structure, responsibilities, constraints, and deliverables are explicit. This PRD therefore serves as a stable instruction surface for implementation, review, and iteration. It should make it possible for a competent builder—or an AI-assisted builder—to understand exactly what the monorepo must become without having to reconstruct intent from scattered conversations.

A fourth purpose is sequencing. The monorepo will not be completed in one step. It will be built in an order. Some apps and packages must come before others. Some components must exist before the system becomes minimally usable. Some milestones require validation before later layers should be added. This PRD therefore includes build-order guidance and acceptance criteria so that implementation can proceed systematically rather than chaotically.

Finally, this PRD exists because the monorepo is the core owned code asset of the current LiNKtrend build. The OpenClaw fork remains separate and will be governed by its own narrower PRD. This document is specifically about the proprietary product that LiNKtrend owns, shapes, and evolves directly. It is therefore one of the most important build-governing documents in the entire project.

## **1.2 Intended Audience**

This PRD is written primarily for builders. The first audience is the founder and system owner, who needs to understand what the monorepo must contain, what its boundaries are, and whether future implementation work is aligned with the intended product. The second audience is any human or AI-assisted engineer responsible for creating or reviewing code inside the monorepo. The third audience is any future contributor who joins the project later and needs a stable product-level specification rather than only abstract system philosophy.

The document assumes that the reader may not be a senior full-stack engineer, but it does not assume that the reader should be shielded from architectural specificity. Instead, it aims for plain-English precision. That means product and engineering concepts are described clearly enough to support non-technical decision-making while remaining exact enough to govern real implementation.

Because the development workflow relies heavily on AI copilots and AI coding systems, this PRD is also an operational document for machine-assisted engineering. It should be explicit enough that an AI tool can use it to scaffold, implement, compare, or review code with minimal ambiguity.

## **1.3 What This PRD Governs**

This PRD governs the proprietary Turborepo monorepo that implements the LiNKtrend-owned side of the current system. It governs the structure and responsibilities of the applications inside the monorepo, the shared packages they depend on, the storage and retrieval responsibilities that must be supported, the runtime integration logic that belongs in the proprietary codebase, the requirements for LiNKaios as the command-centre product, and the operational expectations for the communication layer, the cleanup/containment sidecar, and the runtime wrapper around the separate OpenClaw fork.

More specifically, this PRD governs the product requirements for:

- the monorepo’s overall folder and package topology,  
- the applications inside `apps/`,  
- the shared packages inside `packages/`,  
- the boundaries between app-owned logic and shared logic,  
- the requirements for LiNKaios web,  
- the requirements for LiNKlogic SDK and runtime integration,  
- the requirements for PRISM-Defender,  
- the requirements for Zulip-Gateway,  
- the requirements for database access, storage access, configuration, authentication helpers, observability, and shared types,  
- the environment and deployment expectations for monorepo-built services,  
- the acceptance criteria for considering the monorepo product correctly implemented for the current build phase.

This PRD also governs build sequencing and quality gates within the monorepo. That means it does not only define what the final monorepo should look like. It also defines how the product should be approached as an implementation program. This matters because the monorepo is not a static design artifact. It is a staged build with dependencies between layers.

The document governs product behavior and structural boundaries rather than low-level implementation syntax. It should be precise enough to drive code architecture, but it does not attempt to list every exact file, every exact endpoint, or every exact class name unless doing so is necessary to preserve structural clarity.

## **1.4 What This PRD Does Not Govern**

This PRD does not govern the separate OpenClaw fork beyond the way the monorepo must interact with it. The fork is a separate codebase with its own narrower scope and will be described in a separate PRD dedicated to minimal required OpenClaw modifications. This document may mention the fork where necessary to define the monorepo’s runtime integration behavior, but it is not the authority on fork-internal design.

This PRD also does not replace the master architecture document. If the reader wants to understand the full system philosophy, trust boundaries, long-term architectural rationale, or the broader venture-factory context, the master architecture document is the higher-level source. This PRD assumes those decisions are already made and narrows its focus to the owned monorepo product.

It also does not attempt to define the entire future LiNKtrend organization or all hypothetical future apps and services. It must reserve future pathways where appropriate, but it should not treat every future possibility as a current monorepo build obligation. The document is intentionally grounded in the present build scope.

Finally, it does not function as a full engineering runbook, incident response manual, or infrastructure-as-code manual. Those may be created later if needed. This PRD exists to govern the monorepo as a product and code architecture target.

## **1.5 How to Read and Use This PRD**

This PRD should be read as an implementation-governing document. A builder should use it not only to understand the intended final monorepo structure, but also to decide where code belongs, where logic does not belong, what is required before the product is minimally usable, and how to judge whether a given implementation decision is aligned with the architecture.

The best way to read the document is sequentially on a first pass. The opening sections define the product and its scope. The next sections define the monorepo topology and the applications and shared packages that constitute the product. Later sections define the product requirements for each major monorepo component, followed by data, security, environment, observability, build-order, and acceptance sections. This progression is intentional. It moves from identity and scope, to structure, to behaviors, to validation.

Builders should use the early sections to understand what the monorepo is and is not. They should use the middle sections to make app/package placement decisions. They should use the later sections to validate whether the product behaves as required. If a code change seems convenient but conflicts with the responsibility allocations or product constraints described here, the document should be treated as the standard against which that convenience is judged.

Reviewers should use the PRD as a checklist for drift detection. For example, if code related to identity governance appears inside a package that should only provide UI components, the PRD should make that mismatch visible. If runtime enforcement logic begins to spread across multiple apps without clear ownership, the PRD should make that visible. The document is therefore useful both before implementation and after code exists.

Because the system is being built section by section and in phases, this PRD should also be used as a sequencing aid. Not every section implies immediate coding work, but together they define the order in which the monorepo product should become real. The build-plan and acceptance sections near the end are especially important for that reason.

One final reading rule matters: this PRD should always be interpreted in alignment with the central architectural principle that the monorepo owns the proprietary system logic, while durable truth remains centralized and worker runtimes remain governed and disposable. Whenever a detailed implementation choice feels ambiguous, the reader should ask whether that choice strengthens or weakens that principle. In most cases, that question will guide the correct interpretation.

# **2\. Product Definition and Success Criteria**

## **2.1 What the Monorepo Product Is**

The LiNKtrend monorepo product is the proprietary software platform that implements the owned side of the current LiNKtrend agentic system. It is not just a repository layout, not just a shared code workspace, and not just a collection of developer conveniences. It is a product in its own right: a coordinated software platform composed of multiple applications, services, and shared packages that together implement the command centre, runtime integration logic, communication bridge, security sidecar, shared data-access layers, observability utilities, and other foundational elements of the current LiNKtrend build.

This product exists because the LiNKtrend architecture deliberately separates proprietary platform ownership from the external worker engine baseline. OpenClaw remains a separate fork and is treated as an external dependency with minimal required modifications. Everything else that defines how LiNKtrend governs workers, stores intelligence, retrieves context, resolves tools, presents operational visibility, and manages runtime behavior belongs to the proprietary monorepo product. In other words, if the master architecture document defines the conceptual system, the monorepo product is the main owned implementation vehicle for that system.

The monorepo product should be understood as one platform made of several parts, not several unrelated apps bundled together for convenience. LiNKaios web, Zulip-Gateway, PRISM-Defender, bot-runtime, shared database helpers, shared auth helpers, shared observability modules, shared types, and shared configuration utilities all belong to one coordinated product because they implement one architecture. They may deploy separately and run separately, but they are still one product from a code-ownership and design-governance perspective.

This matters because product clarity shapes implementation quality. If the monorepo were treated as merely a storage location, then application boundaries, shared package rules, and code ownership would be much easier to violate. One app would start doing another app’s job. One package would become a dumping ground. Another package would duplicate logic already defined elsewhere. Over time, the repository would become conceptually flat even if it remained physically organized. By defining the monorepo as a product, this PRD makes it clear that structure and boundaries are part of the build, not just decoration.

Another important aspect of the monorepo product is that it is not only backend logic. It includes a human-facing command centre product, machine-facing service layers, and internal platform packages. This makes it a mixed-surface product. The LiNKaios dashboard is part of the product. So is the retrieval logic that workers depend on. So are the communication and cleanup services. The product therefore has both operator-facing and infrastructure-facing responsibilities. A good PRD must account for both.

The monorepo product also exists to reduce cognitive and operational load. Because the founder is a non-technical solo operator working with AI coding assistance, the system needs one coherent proprietary code home where shared contracts are visible and reusable. The monorepo product is that home. It makes it easier to reason about shared types, mission models, identity semantics, observability formats, and environment rules across the whole proprietary system without forcing the founder to juggle multiple independent codebases for closely related concerns.

A final defining property is that the monorepo product is not the whole future LiNKtrend world. It is the current owned system for the current build scope. It must preserve room for future expansion, but it should not be treated as a place to prematurely encode every hypothetical future product or organizational branch. It is the core owned platform for the present architecture phase.

In summary, the monorepo product is the proprietary operating platform of the current LiNKtrend system. It is the owned codebase that turns the architecture into real apps, services, packages, and interfaces. It is the primary product being built in the current phase, and this PRD exists to define exactly what that product must become.

## **2.2 Strategic Objective of the Monorepo**

The strategic objective of the monorepo is to provide one coherent, governable, and extensible proprietary platform that implements the current LiNKtrend architecture while minimizing duplication, drift, and operational confusion. Put simply, the monorepo exists so that the founder can build, operate, and evolve the LiNKtrend system as one owned platform rather than as a fragmented collection of scripts, services, and disconnected repositories.

The first strategic objective is central implementation coherence. The system depends on shared concepts such as identity, mission, manifest, skill, memory, trace, and status. These concepts cannot be allowed to evolve independently in different parts of the proprietary codebase without a high cost. The monorepo helps solve this by giving those shared concepts one governed home, supported by shared packages and explicit app/package boundaries. This reduces semantic drift and makes cross-cutting changes easier to manage.

The second strategic objective is founder leverage. The founder is operating as a solo builder with AI assistance. That means the development environment must support rapid reasoning and low cognitive overhead. A fragmented proprietary codebase would force repeated context switching, repeated explanation of shared system concepts, and repeated reinvention of common logic. The monorepo instead gives the founder and the AI tools one common implementation surface where the system can be understood and evolved more efficiently.

The third strategic objective is governed growth. LiNKtrend is expected to expand over time. New apps, new worker patterns, new governance interfaces, and deeper operational capabilities may eventually be added. The monorepo should make such growth easier by providing a clean internal platform structure. Growth should occur through adding well-bounded modules, not by scattering major new concepts across unrelated places.

The fourth strategic objective is operational reliability. When shared contracts are centralized and app boundaries are explicit, it becomes easier to validate system behavior and easier to reason about deployments. This does not guarantee correctness, but it makes correctness more achievable. The monorepo therefore contributes directly to build quality and long-term maintainability.

The fifth strategic objective is preservation of proprietary value. LiNKtrend’s real differentiation lies not in merely using an agent engine, but in how it centralizes governance, memory, skills, runtime control, and operator oversight. Those proprietary differentiators belong inside the monorepo. The monorepo is therefore not only a technical convenience. It is the main code asset in which the owned operating model is embodied.

## **2.3 Primary Product Outcomes**

The monorepo product should produce several concrete outcomes if implemented correctly. These outcomes define what the product is expected to achieve, not merely what components it is expected to contain.

The first primary outcome is a functioning command centre. The monorepo must produce LiNKaios web as a usable operator-facing dashboard and control plane that allows the founder to inspect workers, missions, skills, memory, traces, and statuses, and to apply central control actions. This is not optional. Without a functioning command centre, the architecture remains too abstract and too dependent on direct infrastructure access.

The second primary outcome is a functioning runtime integration layer. The monorepo must produce the packages and services required for workers to authenticate, retrieve governed context, resolve skills, resolve approved tools, and remain under central runtime control. This includes the LiNKlogic SDK and the runtime-related code that allows the worker side of the architecture to function coherently. If the command centre exists but workers cannot operate under governed runtime conditions, the product has failed one of its central jobs.

The third primary outcome is a functioning communication bridge. The monorepo must produce the communication service that maps messages into mission-aware system context and allows the operator and workers to interact through a structured channel. The communication layer must not become the source of truth for memory or mission state, but it must exist as a real product component rather than a vague future idea.

The fourth primary outcome is a functioning local cleanup and defensive sidecar. The monorepo must produce PRISM-Defender in a form that supports the current build’s realistic security posture. That means local residue reduction, cleanup discipline, and support for fail-closed behavior must exist as concrete product features rather than as wishes deferred to future hardening phases.

The fifth primary outcome is shared infrastructure packages that actually reduce duplication. Shared packages should not be created as theoretical abstractions with no practical use. They must provide real centralization of common types, configuration, database access, observability, auth utilities, and other cross-cutting code so that the monorepo behaves like one platform instead of several silos.

The sixth primary outcome is a valid build and deployment foundation. The monorepo must make it possible to build and deploy the relevant services separately according to environment, without forcing the proprietary codebase into a false monolithic deployment model. The monorepo should prove that source-code unity and runtime modularity can coexist cleanly.

The seventh primary outcome is implementation discipline. If the product is implemented correctly, future contributors should be able to tell where a piece of logic belongs, where it does not belong, and how to extend the system without corrupting its architecture. This is less visible than a dashboard or a worker runtime, but it is one of the most important outcomes for long-term product health.

These outcomes together define the product at a practical level. The monorepo is not successful merely because it exists. It is successful only if it delivers these capabilities in a coherent and governed form.

## **2.4 Non-Negotiable Product Constraints**

Several product constraints are non-negotiable for the current monorepo build. These constraints are not suggestions. They are design boundaries that the product must respect in order to remain aligned with the approved architecture.

The first non-negotiable constraint is that the monorepo must remain the home of proprietary system logic and not become entangled with the full source ownership of OpenClaw. OpenClaw remains separate. The monorepo may wrap it, configure it, and integrate with it, but it must not absorb it as if the external engine were part of the proprietary platform codebase.

The second non-negotiable constraint is that durable truth remains centralized. The monorepo can contain the code that manages skills, memory, identities, and missions, but it must not regress into a file-first architecture in which worker-local files become the canonical location of those things. The product must preserve the architecture’s commitment to centralized governance and centralized persistent intelligence.

The third non-negotiable constraint is that skills and tools remain separate concepts. The monorepo must not build a system in which skill definitions and arbitrary executable code become one uncontrolled unit. Skills are centrally governed method. Tools are approved executable capabilities. The product must preserve that distinction in both storage and runtime behavior.

The fourth non-negotiable constraint is realistic security posture. The product must support best-effort ephemeral handling, central secret management, fail-closed control, and PRISM-based cleanup discipline. It must not claim magical invisibility or build around unsafe assumptions such as permanent worker-local trust. Conversely, it must not ignore the worker-node residue problem as if centralization alone solved it.

The fifth non-negotiable constraint is internal-first scope discipline. The monorepo must support the current internal LiNKtrend use case first. It should preserve future external pathways, but it must not become diluted by trying to build full external-client infrastructure in the first implementation phase.

The sixth non-negotiable constraint is explicit app and package ownership. Shared packages must not become dumping grounds, and applications must not quietly absorb logic that should be centralized elsewhere. The monorepo must remain understandable and structurally clean enough that future contributors can work in it without constantly rediscovering hidden ownership rules.

The seventh non-negotiable constraint is observability. The product must provide enough logging, metrics, traceability, and dashboard visibility that the system is actually operable by the founder. A sophisticated architecture that cannot be seen clearly enough to govern is not an acceptable product outcome.

The eighth non-negotiable constraint is buildability by a solo founder with AI assistance. This means the monorepo must be strong in structure without becoming self-defeatingly overengineered. The product should be serious and scalable, but it must still be executable in the founder’s real operating context.

## **2.5 Success Criteria for Version 1**

Version 1 of the monorepo product should be considered successful only if it satisfies a clear set of concrete product outcomes rather than a vague feeling that the architecture has been partially implemented.

The first success criterion is that LiNKaios web exists as a real command-centre application with sufficient operator visibility into identities, workers, missions, skills, memory, and status. The command centre does not need to include every future governance feature, but it must be genuinely usable as the system’s central surface.

The second success criterion is that one or more LiNKbot runtimes can authenticate successfully through the governed system, attach to a mission, retrieve skill and memory context through the proper channels, and operate under central manifest and permission logic. This proves that the monorepo’s runtime-side product components are actually working.

The third success criterion is that skills are centrally stored and versioned, and that workers retrieve them through governed resolution rather than through worker-local skill folders as canonical truth. If this condition is not met, the monorepo has not implemented one of the central product corrections in the architecture.

The fourth success criterion is that tool invocation follows the approved pattern. The runtime must resolve approved tool capabilities rather than executing arbitrary ungoverned database code as its normal behavior. This proves that the product has implemented the safer and more maintainable execution model.

The fifth success criterion is that PRISM exists in a functioning form that materially contributes to cleanup and residue reduction in worker environments. It does not need to represent the final strongest future hardening posture, but it must be real and operational.

The sixth success criterion is that communication flows through a mission-aware gateway that can map messages to mission context and feed the system structured interaction data. This proves that the communication layer is a real product feature.

The seventh success criterion is that central persistence is working as intended: structured records in Postgres, files in object storage, meaningful traces retained centrally, and runtime-local residue minimized after persistence where practical. This proves that the monorepo product is aligned with the architecture’s data model.

The eighth success criterion is that the monorepo is structurally clean enough that future contributors can identify what belongs in each app and package without major ambiguity. If the codebase becomes structurally confusing before Version 1 is complete, that is a product failure even if several features seem to work.

Taken together, these success criteria define a Version 1 product that is narrow enough to build, serious enough to matter, and clean enough to support future growth.

# **3\. Product Scope: In Scope, Out of Scope, and Future Scope**

## **3.1 In Scope for the Current Build**

The current monorepo build is in scope to deliver the proprietary software platform required to make the present LiNKtrend architecture real. This means it must include the applications, services, packages, and shared code needed to operate LiNKaios as a command centre, enable governed worker runtime behavior, manage centralized skill and memory access, support local residue-reduction and cleanup discipline, and bridge communication into the system in a mission-aware way. The scope is broad enough to be meaningful, but intentionally constrained enough to stay executable.

At the application level, the current build includes the LiNKaios web application, Zulip-Gateway, PRISM-Defender, and bot-runtime. LiNKaios web is in scope because the architecture requires a real operator-facing command centre and not merely a conceptual control plane. Zulip-Gateway is in scope because structured mission-aware communication is part of the current system shape, not an optional future decoration. PRISM-Defender is in scope because local cleanup and residue reduction are core parts of the security posture already locked in. Bot-runtime is in scope because the proprietary platform must provide the runtime wrapper and control logic through which the separate OpenClaw fork is integrated into the governed system.

At the shared-package level, the current build includes at minimum the packages needed for LiNKlogic SDK behavior, shared database access, shared authentication and secret-access helpers, shared types, shared configuration management, shared observability, and shared UI primitives where useful. These are in scope because the monorepo is not intended to be a cluster of isolated apps. It is intended to be one coordinated product. Shared packages are therefore not “nice to have” abstractions; they are required to keep the architecture coherent.

At the storage and data level, the current build includes the code and contracts required to interact with centralized Postgres-backed records and Supabase Storage buckets in the intended architecture. This includes support for central identity records, mission records, manifests, skill records, memory records, traces, and file references. It also includes the code needed to retrieve and persist these entities in a structured and governed way. The monorepo is not itself the system of record, but it is in scope to implement the software that owns and uses that central record correctly.

At the runtime behavior level, the current build includes bootstrap authentication flow, mission attachment flow, skill retrieval flow, tool-resolution flow, memory retrieval using progressive disclosure principles, runtime caching where appropriate, observability hooks, fail-closed status checks, and cleanup support. These are not separate optional add-ons. They are the product behaviors that prove the monorepo is implementing the architecture rather than simply displaying or storing some of its concepts.

At the product-governance level, the current build includes the requirement that the monorepo remain structurally coherent. This means explicit boundaries between app-owned logic and package-owned logic, explicit rules about where code should live, and enough discipline that the codebase does not become an undifferentiated accumulation of convenience hacks. Product structure is in scope because without it the monorepo would cease to be a reliable implementation surface.

The current build also includes environment-aware behavior. The system must support local development, staging or test operation, and production deployment in a way that reflects the architecture’s environment strategy. This means configuration handling, service startup assumptions, cleanup behavior, observability behavior, and deployment expectations are all part of scope. The monorepo is not only a development artifact. It must produce services that can actually run in the real environments the architecture anticipates.

Finally, the current build includes the first serious implementation of the founder’s governance and visibility requirements. The command centre must allow enough operator understanding and control that the system can be run intentionally. This includes visibility into workers, identities, missions, current status, key traces, skills, and memory structures. Without this, the product would technically exist but fail its real operational purpose.

In summary, the current build scope includes the full proprietary platform necessary to make the present LiNKtrend architecture operable: central command centre, runtime wrapper, retrieval and enforcement logic, communication gateway, cleanup sidecar, shared package foundation, storage and persistence integration, observability, and environment-aware deployment behavior.

## **3.2 Explicitly Out of Scope**

To keep the monorepo product focused and buildable, several ideas are explicitly out of scope for the current build. These exclusions are necessary because without them the product would expand into an overgeneralized platform before the foundational system is stable.

The first major out-of-scope category is full ownership or deep absorption of OpenClaw. The monorepo product must not attempt to fold the OpenClaw fork into its own codebase as if the external engine were part of the proprietary platform. The runtime wrapper and integration behavior are in scope; deep engine ownership is not. The separate fork will be governed by its own PRD and should remain external to the monorepo.

The second out-of-scope category is full support for heterogeneous worker engines in Version 1\. The architecture reserves room for future additional worker types or sub-agent classes, but the monorepo product is not required to build first-class support for multiple engine families right now. It is OpenClaw-first. The product must implement that path well before trying to become a universal worker-orchestration platform.

The third out-of-scope category is full external-client or multi-tenant productization. The current monorepo build is internal-first. It should preserve future extensibility for external or client-isolated bots, but it is not required to implement a finished multi-tenant client platform, customer self-service onboarding, external tenant dashboards, or external billing and tenancy workflows. Those would distract from the current product’s foundational mission.

The fourth out-of-scope category is arbitrary general-purpose code distribution from the database. The product should not build a system in which random executable code is routinely stored in central records and run directly by workers as a normal operating pattern. Approved tool references and controlled package resolution are in scope. Treating the system of record as an unrestricted code-execution bus is not.

The fifth out-of-scope category is full future organizational role realization. The broader LiNKtrend vision includes many future roles, departments, and digital organizational structures, but the current monorepo product is not required to encode every such future department or role-specific application in Version 1\. It must provide the platform foundations that can support richer specialization later, not the full future org chart in software form now.

The sixth out-of-scope category is production-grade perfection in every future hardening dimension. The current build must have a real and serious security posture, but it is not expected to solve every future advanced hardening concern immediately. For example, the system should not block Version 1 solely because it has not yet implemented every conceivable future isolation or attestation improvement. It must be realistic and correct for the current phase, not theatrically maximal.

The seventh out-of-scope category is creating a sprawling internal platform ecosystem before there is evidence it is needed. Shared packages should exist where they reduce duplication and clarify ownership. They should not be invented preemptively for every imaginable future abstraction. Likewise, reserved apps such as a possible future `bot-manager` should not become current build obligations unless the product truly requires them in the present phase.

The eighth out-of-scope category is using the monorepo as a generic dumping ground for all founder experiments, all unrelated projects, or all future LiNKtrend digital assets. This PRD governs one product. The monorepo must remain aligned with that product. It is not an undifferentiated “everything repo.”

These exclusions are part of good product discipline. They do not reflect lack of ambition. They reflect sequencing. By defining what is not required now, the product becomes more likely to reach a clean and usable Version 1\.

## **3.3 Reserved Future Scope**

Although the current build is intentionally constrained, the monorepo product must still preserve room for growth. Reserved future scope refers to capabilities, applications, or patterns that are not part of Version 1 but that the current design should not block. These pathways matter because LiNKtrend is intended to evolve, and the monorepo must remain a credible long-term proprietary platform rather than a short-term one-off build.

The first reserved future scope category is additional worker-engine families. The current product is OpenClaw-first, but the monorepo should remain structurally capable of wrapping or integrating future worker types without requiring a total redesign of central identity, mission, memory, skill, and observability logic. This does not require implementing those future engines now. It simply means the product should not hardcode assumptions that make them impossible later.

The second reserved category is external or tenant-isolated worker support. The architecture is internal-first, but the identity model and data-model design should still preserve the possibility of future client-facing pathways. That could later include tenant-aware worker management, external mission isolation, client-specific skill exposure, or external operational views. None of that is required in the current build, but the product should avoid making those future moves structurally painful.

The third reserved category is richer governance features inside LiNKaios. The current build should create a real command centre, but future versions may include approval workflows, more advanced audit views, simulation surfaces, policy editing interfaces, richer mission dashboards, multi-operator governance, or deeper visibility into system intelligence. The current product should therefore treat LiNKaios as a durable application worthy of future growth, not as a temporary control screen.

The fourth reserved category is richer automation and orchestration integration. Future versions of the monorepo product may include tighter links to additional workflow systems, job managers, schedulers, or background orchestration services. The current build does not need to implement all of that. It simply needs to keep app boundaries and shared packages clean enough that these services could be added later without architectural violence.

The fifth reserved category is expanded observability and security hardening. Today’s product needs serious logging, traces, cleanup, and fail-closed behavior. Future versions may add stronger anomaly detection, richer metrics pipelines, improved tool attestation, stronger local runtime isolation, more advanced incident views, or more nuanced secret-governance workflows. The product should remain capable of such evolution.

The sixth reserved category is richer package ecosystem growth. Today’s product has a bounded set of shared packages. Future versions may justify additional shared packages once real repeated needs appear. For example, a future package for workflow definitions, a stronger policy engine, or richer storage abstractions may emerge if the system grows in those directions. The product should permit that growth while resisting premature abstraction now.

The seventh reserved category is more formalized deployment management. The current build will define and support real deployment patterns, but future versions may justify more elaborate fleet or service management tooling, possibly including a dedicated `bot-manager` application. The current product should reserve space for that possibility without making it a current requirement.

Reserved future scope therefore acts as an architectural promise: the monorepo should stay open to credible next steps while still remaining disciplined about what it must deliver now.

## **3.4 Scope-Control Rules**

Because the monorepo is a foundational product with many adjacent possibilities, it is especially vulnerable to scope creep. To prevent the product from expanding into an incoherent or never-finished platform, the current build needs explicit scope-control rules. These rules are not administrative formalities. They are product-quality safeguards.

The first scope-control rule is that current-build necessity outranks theoretical elegance. If a proposed app, package, abstraction, or runtime feature is not needed to deliver the approved current architecture in a clean and maintainable way, it should not be added merely because it may be useful someday. Reserved future scope already exists for this reason. Version 1 must stay grounded.

The second rule is that shared code must justify itself. A piece of logic should become a shared package only when centralizing it materially improves clarity, reuse, or contract consistency. The monorepo should not create shared packages for tiny one-off conveniences or for hypothetical future reuse. Over-sharing too early can make the codebase more abstract and harder to navigate rather than less.

The third rule is that app ownership must remain explicit. If a new feature does not clearly belong in an existing application based on its responsibility, that is a signal to revisit the architecture rather than to casually place it wherever it is easiest. The same applies to runtime logic. The product should not tolerate logic placement based only on convenience.

The fourth rule is that future pathways must remain labeled as future. The monorepo may contain reserved placeholders, TODO markers, or structural allowances for future apps such as a bot manager, but those allowances must not be allowed to distort the current implementation into prematurely solving all future problems at once. Future-aware is acceptable. Future-bloated is not.

The fifth rule is that central architectural principles cannot be traded away for speed. For example, it may be tempting during implementation to store skill truth locally in worker directories “just for now,” to let arbitrary code stream from central storage “just temporarily,” or to hardcode secrets on worker machines because it feels convenient. These are exactly the kinds of shortcuts that undermine the product. Scope control therefore includes protecting core design principles during pressure moments.

The sixth rule is that every major addition should answer one question clearly: does this strengthen the monorepo as the owned implementation of the current architecture, or does it distract from that goal? If the answer is unclear, the addition probably does not belong in the current build.

The seventh rule is that the current build should prefer completing a coherent vertical slice over partially scattering capability everywhere. For example, a functioning command-centre view tied to real mission and worker data is more valuable than ten speculative dashboard screens tied to incomplete backend logic. A real worker runtime flow is more valuable than several loosely sketched future runtime ideas. This rule helps keep the product grounded in working system value.

These scope-control rules should be applied continuously during implementation. They are not only for the planning stage. They are what keep the monorepo product clean enough to remain a real platform instead of becoming a large but blurry codebase.

# **4\. Monorepo Structure and Package Topology**

## **4.1 Monorepo Design Principles**

The LiNKtrend monorepo must be structured according to a small number of clear design principles. These principles are important because the monorepo is not just a directory tree. It is the main proprietary product surface for the current LiNKtrend architecture. If its internal structure is weak, the product will become harder to build, harder to review, and easier to corrupt over time.

The first design principle is architectural alignment. The monorepo structure must reflect the approved architecture rather than forcing the architecture to conform to arbitrary repository habits. This means the repository should make it clear which code belongs to operator-facing products, which belongs to runtime services, which belongs to shared package infrastructure, and which belongs to deployment, migration, or documentation support. A good monorepo should make the architecture more visible, not less visible.

The second principle is explicit ownership. Every major folder category should exist for a reason and should imply a responsibility model. If code belongs in `apps/`, it should be because that code produces or directly supports a deployable application or service. If code belongs in `packages/`, it should be because it is shared logic used by multiple apps or because it defines a platform-level contract that deserves a reusable central package. This explicit ownership is what prevents repository sprawl.

The third principle is minimal duplication. Shared concepts such as identity models, mission types, event shapes, configuration rules, observability structures, or storage-access abstractions should not be redefined separately across applications unless there is a compelling reason. The monorepo should encourage centralization of these shared concepts through well-scoped packages, while still avoiding premature abstraction. This is a balance, not an excuse to over-engineer.

The fourth principle is deployment independence inside source unity. One monorepo does not imply one deployment. The structure should allow multiple services and apps to be built from one repository without forcing them into a monolithic runtime model. Applications should remain distinct enough that they can be deployed where needed, even though they are developed together.

The fifth principle is AI-assisted developer friendliness. The founder is using AI coding tools and plain-English guidance to help build the system. This means the repository structure must be understandable at a glance. An AI tool should be able to infer where to work and where not to work without excessive ambiguity. The same should be true for a human reviewer. Folder structure is therefore part of the usability of the codebase.

The sixth principle is future extensibility without present bloat. The monorepo must be able to grow, but it should not be structured around speculative features that do not yet deserve implementation. This means it should reserve room for future services or packages where appropriate, but only create them when they serve the current build.

The seventh principle is strong boundary preservation with the external OpenClaw fork. The monorepo must never be structured in a way that blurs the fact that OpenClaw remains a separate codebase. The runtime wrapper may interact deeply with the fork, but the repository topology must continue to express that the proprietary platform owns system logic while the external fork remains an engine dependency.

These principles should be treated as repository-level rules. Whenever a new folder, app, or package is proposed, it should be judged against them before being added.

## **4.2 Root-Level Repository Structure**

At the highest level, the monorepo should be organized so that a reader can immediately understand the major categories of code and support assets in the system. The approved root-level structure is centered on `apps/`, `packages/`, `services/`, `infra/`, `docs/`, and the standard root configuration files needed for the Turborepo workspace. This structure is not arbitrary. Each root-level area exists to express a different kind of product ownership.

`apps/` is the home of deployable applications and services that represent first-class product surfaces inside the monorepo. These are codebases that can be built into running software units such as LiNKaios web, Zulip-Gateway, PRISM-Defender, and bot-runtime. A reader should be able to enter `apps/` and see the main executable product parts of the proprietary system.

`packages/` is the home of shared code that should not live inside one app only. These are reusable internal platform packages such as LiNKlogic SDK, database access abstractions, auth helpers, shared types, shared config handling, observability utilities, and shared UI primitives. `packages/` should not become a dumping ground for half-finished features. It should hold shared platform logic that multiple apps depend on or that defines central contracts important enough to deserve package-level ownership.

`services/` is reserved for system-level support components that are not necessarily top-level user-facing apps but may still need to exist as part of the broader monorepo system. In the current structure, this includes migration and seeding logic and may later include background workers where justified. The important point is that `services/` should remain clearly distinct from `apps/` and `packages/`.

`infra/` is the home of operational deployment support such as Dockerfiles, deployment configurations, and helper scripts related to environment setup or runtime orchestration. This folder is important because the monorepo must support multiple environments and deployment topologies, but infrastructure artifacts should not be scattered through product app folders unnecessarily.

`docs/` is the home of human-facing architecture, PRD, SOP, and system reference documents that belong to the monorepo product itself. It is not, by default, the live source of worker skills or memory. It is documentation for builders and operators unless the system later explicitly ingests selected documents into LiNKbrain or LiNKskills through a separate controlled process.

At the root, the repository should also contain the standard workspace files required for the monorepo to function: `turbo.json`, `package.json`, `pnpm-workspace.yaml`, shared linting or formatting configurations, and other top-level developer controls. These files are part of the workspace infrastructure and should remain clean and intentional.

This root-level design is important because it establishes the cognitive map of the codebase. If the root is clear, everything beneath it becomes easier to place correctly.

## **4.3 `apps/` Structure and Responsibilities**

The `apps/` folder is where the monorepo expresses its deployable product surfaces. Each app inside `apps/` should represent a coherent application or service with clear runtime purpose. The structure must not encourage mixing app-specific logic with general reusable package logic, and it must not hide deployable services inside ambiguous folders.

The current approved app set includes `linkaios-web`, `zulip-gateway`, `prism-defender`, and `bot-runtime`. A future optional `bot-manager` app may later be added if justified, but it should remain reserved rather than implemented prematurely.

`linkaios-web` is the operator-facing command-centre application. It is the most visible app in the system because it provides the central dashboard and administrative product surface through which the founder can inspect and control the architecture. It belongs in `apps/` because it is a standalone application, not just a package dependency.

`zulip-gateway` belongs in `apps/` because it is a deployable communication service. Its job is to bridge incoming and outgoing communication into mission-aware system behavior. Even if its code depends on shared packages, it remains its own runtime unit and therefore belongs in `apps/`.

`prism-defender` belongs in `apps/` because it is a distinct service-like runtime component with its own execution role and operational lifecycle. Although it behaves as a sidecar in deployment terms, it is still a first-class implementation target in the monorepo and should therefore be represented clearly as an app-level unit.

`bot-runtime` belongs in `apps/` because it is the monorepo-owned runtime wrapper around the external OpenClaw fork. It is the app that makes the LiNKbot runtime real on the proprietary side. This app is especially important because it is where the proprietary system and the separate engine boundary meet in runtime practice.

The general rule for `apps/` is that app folders own app-specific runtime assembly, service-specific orchestration, environment-specific startup logic, and product behavior unique to that app. They should consume shared packages rather than duplicating common types, common auth helpers, common observability logic, or common database abstraction code unless a strong app-specific reason exists.

Another important rule is that apps should not become internal monoliths. For example, `linkaios-web` should own the UI and web-specific product logic for the command centre, but not quietly absorb all shared data-access rules or all central observability contracts that other apps also need. Likewise, `bot-runtime` should own runtime wrapper behavior, but not become the hidden owner of mission truth or central identity semantics. If an app-specific implementation need appears repeatedly elsewhere, that is a signal to move the relevant logic into `packages/`.

The `apps/` structure should also make deployments easier to reason about. A service to be deployed should map clearly to a folder in `apps/`. This helps maintain the important distinction between source-code unity and runtime deployment modularity.

## **4.4 `packages/` Structure and Responsibilities**

The `packages/` folder is the shared internal platform layer of the monorepo. It is where reusable logic, shared contracts, and cross-app abstractions live when those things are important enough to deserve their own ownership and are used by more than one application or service. `packages/` is therefore critical to keeping the monorepo coherent, but it must be handled with discipline so that it does not become a generic dumping ground.

The current approved shared package set includes `linklogic-sdk`, `db`, `auth`, `shared-types`, `shared-config`, `observability`, and `ui`. Each of these exists because it captures a recurring need across multiple apps or expresses a central architectural contract.

`linklogic-sdk` is the shared runtime retrieval-and-enforcement package that multiple parts of the system may depend on, especially the worker-facing runtime layers. It belongs in `packages/` because it is a platform capability, not just one app’s helper code.

`db` is the shared package that provides database models, access helpers, query abstractions, and possibly schema-related interfaces used across the command centre, gateway, runtime layers, or support services. It should centralize data-access logic that should remain consistent across apps.

`auth` is the shared package for centrally reusable authentication and credential-access helpers where such centralization is justified. It may include session-related helpers, permission-checking helpers, or vault-access pathways used by multiple apps. It should not become an accidental business-logic package.

`shared-types` holds common type definitions for identities, missions, manifests, events, traces, skills, tools, and other cross-cutting concepts that need to stay semantically aligned across the product. This package is especially important in an architecture that wants strong contract consistency.

`shared-config` holds configuration parsing, environment rules, feature-flag helpers, and central constants. This package exists because configuration drift across apps can create subtle bugs and because environment-aware behavior is part of the architecture.

`observability` holds reusable logging formats, metrics helpers, trace structures, and common instrumentation logic that multiple apps should share. This helps keep the product’s observability semantics coherent.

`ui` holds shared UI components or styling primitives needed by the command-centre application and any future interface surfaces. It should remain a UI package rather than quietly becoming a generic front-end logic container.

The main rule for `packages/` is that packages must earn their existence. A package should not be created just because a developer suspects something might be reused someday. It should be created when centralization materially improves clarity, reuse, or architectural consistency. This is especially important in an AI-assisted build because over-abstracted package trees can quickly confuse both human and machine contributors.

Another important rule is that packages should remain bounded. A shared package should have a clear responsibility and not quietly absorb neighboring concerns because it is convenient. For example, `shared-types` should not become the home of database query logic, and `observability` should not become a generic utilities package. Bounded packages are easier to understand, test, and evolve.

## **4.5 `services/`, `infra/`, and `docs/` Structure**

The `services/`, `infra/`, and `docs/` root folders exist to support the product while keeping app and package boundaries clean. They should not be treated as secondary junk drawers. Each has a specific role in preserving monorepo clarity.

`services/` should contain system-level supporting code that is important to the platform but is not best expressed as one of the main top-level apps or one of the shared internal packages. In the current approved structure, this includes migration and seeding logic and may later include background workers or support services if they become justified. The key rule is that `services/` should hold supporting runtime or system functions, not random business logic that should actually live in `apps/` or `packages/`.

`infra/` should contain Dockerfiles, deployment templates, compose files where relevant, environment-specific deployment scaffolding, and scripts that are about how the system is run rather than what the product logic is. This distinction matters because infrastructure artifacts often grow organically and can easily become scattered across app folders. Centralizing them under `infra/` helps preserve app clarity and makes deployment topology easier to understand.

`docs/` should contain the monorepo’s human-facing documentation assets: architecture references, PRDs, SOPs, implementation notes, runbooks where later needed, and other project documents relevant to the proprietary product. By default, `docs/` is not the live runtime memory or skill source for workers. It belongs to builders and operators unless specific documents are deliberately ingested into governed system memory through a separate explicit process. This distinction prevents documentation folders from being mistaken for runtime truth.

These three root folders help keep the monorepo intellectually clean. `apps/` is for deployable product surfaces. `packages/` is for reusable platform logic. `services/` is for supporting system functions. `infra/` is for deployment and operational scaffolding. `docs/` is for human-facing documentation. Keeping those roles visible makes the whole product easier to maintain.

## **4.6 Rules for Shared Packages vs App-Owned Logic**

One of the most important practical rules in a monorepo is deciding what belongs in a shared package versus what belongs inside one app. This matters because poor decisions here produce either duplication or over-abstraction, and both can damage the product.

The first rule is that app-owned logic should remain with the app when it is tightly coupled to that app’s unique runtime behavior, UI surface, or service responsibilities. For example, LiNKaios web-specific page composition, its route-level behavior, and UI coordination logic belong to that app. Likewise, bot-runtime startup orchestration specific to wrapping the OpenClaw fork belongs to bot-runtime. Shared packages should not absorb app-specific runtime assembly just because some helper functions could theoretically be reused.

The second rule is that shared packages should own logic that is genuinely cross-cutting, architecturally central, or reused across more than one meaningful app. Shared mission types, identity shapes, manifest contracts, skill-resolution APIs, observability formats, database-access helpers, and auth patterns are strong candidates for packages because they represent core platform semantics that should remain consistent across the product.

The third rule is that the burden of proof is higher for creating a new package than for keeping code local. Shared packages create centralization benefits, but they also create navigation complexity and coupling. Therefore, code should move into `packages/` when it clearly reduces duplication or protects a cross-app contract—not merely because it might feel “cleaner” in the moment.

The fourth rule is that shared packages should expose stable, intentional interfaces. A package should not behave like a hidden internal copy of one app’s implementation details. If a package is shared, it should be designed to be consumed explicitly by multiple parts of the product.

The fifth rule is that apps should consume packages, not rewrite them privately. If a pattern is centralized in a package, app-specific code should respect that package rather than casually re-implementing its logic. Otherwise, the value of centralization disappears.

Applying these rules consistently is one of the main ways to keep the monorepo healthy over time.

## **4.7 Naming and Folder Conventions**

Naming and folder conventions matter because they shape how both humans and AI tools interpret the codebase. In a monorepo like LiNKtrend’s, good naming reduces ambiguity, improves navigation, and helps preserve boundaries.

The first naming rule is clarity over cleverness. Folder names should describe what the thing is, not use internal jokes or vague abstractions. Names like `linkaios-web`, `zulip-gateway`, `prism-defender`, `bot-runtime`, `shared-types`, and `observability` are good because they communicate function directly.

The second rule is consistency of style. Application folders should use a consistent naming convention, ideally kebab-case. Package folders should do the same. This reduces visual noise and makes command-line work and AI-assisted navigation easier.

The third rule is semantic accuracy. A folder should not be named in a way that hides its actual responsibility. For example, a package named `utils` or `common` tends to become a junk drawer. The monorepo should prefer names that tie directly to architectural responsibility. This encourages discipline in what code gets placed there.

The fourth rule is future-safe extensibility. Folder names should be narrow enough to remain meaningful when the monorepo grows. For instance, `db` is appropriate for shared database access abstractions, but a more ambiguous name might age badly once the product expands.

The fifth rule is documentation alignment. Folder names should match the terminology used in the PRDs and architecture documents where possible. This reduces translation overhead between documentation and code and makes the system easier to understand for new contributors.

Good naming does not solve architecture by itself, but bad naming creates unnecessary friction everywhere. For a solo founder using AI assistance, that friction compounds quickly. Clear naming is therefore part of product design, not merely style preference.

# **5\. Applications in the Monorepo**

## **5.1 `linkaios-web`**

`linkaios-web` is the central human-facing application in the monorepo. It is the command-centre product surface through which the operator can see, govern, and interact with the LiNKtrend system. This application is not a secondary convenience layer. It is one of the defining deliverables of the current build because the architecture depends on having a real, usable control plane rather than a theoretical central authority that exists only in database records and backend logic.

The primary purpose of `linkaios-web` is to make central system truth visible and governable. It should provide the operator with a coherent view into workers, identities, mission states, manifests, skills, memory structures, key traces, and system health. This means the app must not be designed as a generic admin dashboard with a few tables. It must express the actual architecture. If the architecture says identity is durable, then the interface should reflect durable identities. If the architecture says missions are central work units, then the interface should reflect mission-centric views. If the architecture says skills and memory are governed assets, the interface should make those assets visible and manageable.

Another major purpose of `linkaios-web` is to provide central control functions. It should allow the operator to inspect agent status, activate or deactivate workers, review mission linkage, inspect current skill versions, review memory structures, understand active statuses, and observe key system-level changes. It should also be the place where central actions such as revoking a manifest, reviewing a skill version, or inspecting traces become practical rather than requiring direct infrastructure access.

`linkaios-web` must also act as the product embodiment of the control-plane model. This means it cannot quietly own business logic that properly belongs in shared packages or central data-access layers. For example, core identity semantics, mission semantics, or shared type contracts should not be redefined inside the front-end app. Instead, the app should consume shared contracts from packages such as `shared-types`, `db`, and `observability`, while owning the web-specific interaction patterns, pages, and user experience needed to present those concepts meaningfully.

A further requirement is clarity of operator experience. The founder is a solo operator, not a dedicated internal enterprise admin team. This means `linkaios-web` must present information in a way that supports high-leverage understanding. It should not require the operator to mentally reconstruct the system from raw tables or deeply technical metrics. It should surface the right views and summaries so that important questions can be answered quickly: Which workers exist? Which are active? What missions are ongoing? What is failing? What changed? What skill version is current? What traces matter? Which cleanup or fail-closed events occurred?

The application should also be structured for future growth without current bloat. It needs enough architecture that later richer governance features can be added cleanly, but Version 1 must stay grounded in real current needs. That means the application should focus on delivering the core views and controls required by the present build, while keeping code organization clean enough that additional screens and flows can be introduced later without restructuring the entire app.

From a monorepo perspective, `linkaios-web` should own web-specific routing, page composition, UI interaction logic, state coordination at the application layer, and command-centre presentation concerns. It should not become the hidden home of unrelated backend logic or generic shared utilities simply because the UI needs them. This is especially important because dashboard apps often attract logic creep. The PRD should therefore be interpreted as explicitly limiting `linkaios-web` to what belongs in a command-centre web application.

Another important point is that `linkaios-web` is not just a read-only reporting surface. It is a product that must support central governance actions. That means the design must support both inspection and intervention. The app should let the operator not only see the system but also steer it in ways aligned with the current architecture.

In short, `linkaios-web` is the visual and operational centre of the monorepo product. If the rest of the product provides the architecture’s muscle and memory, `linkaios-web` provides the eyes and hands through which the founder actually governs the system.

## **5.2 `zulip-gateway`**

`zulip-gateway` is the communication service application inside the monorepo. Its responsibility is to translate between external communication activity and the architecture’s internal mission-aware, worker-aware system model. It exists because the LiNKtrend system cannot rely on raw chat alone as a meaningful operational substrate. Communication must be contextualized before it becomes useful to a governed worker architecture.

The first responsibility of `zulip-gateway` is message intake and routing. It should receive messages from the chosen communication environment, identify the relevant stream, topic, sender, and associated context, and transform that into an internal message object that can be understood by the rest of the architecture. This means the app is more than a simple webhook relay. It is a context-aware adapter.

The second responsibility is mission mapping. A raw message does not inherently know which mission it belongs to, which worker should receive it, what project history is relevant, or what current system state should shape the response. `zulip-gateway` must therefore map communication context to internal mission context. This may involve topic-to-mission resolution, sender association, thread or state pointers, or other structured links. Without this, workers would receive text without adequate situational grounding.

The third responsibility is message enrichment. Before a message reaches the worker-facing runtime path, it should be wrapped with enough metadata that the worker and retrieval layers can interpret it correctly. This can include sender identity, mission linkage, conversation context markers, timestamps, and other relevant information. The goal is not to overload the worker with communication noise, but to ensure that the message arrives as a meaningful part of the governed architecture rather than as naked text.

The fourth responsibility is presence and status reflection where appropriate. Since communication is one of the most visible operational surfaces, the gateway may help reflect whether workers appear active, unavailable, or otherwise present within communication channels. However, this presence behavior must remain subordinate to central system truth. The gateway reflects status. It does not define it.

The fifth responsibility is separation from durable truth. This is one of the most important architectural boundaries. `zulip-gateway` is not the memory layer, not the mission authority, not the identity registry, and not the skill owner. It is the communication adapter. It should consult or consume central truth where needed, but it must not quietly become the shadow owner of system state because messages happen to flow through it.

From the monorepo perspective, `zulip-gateway` should own communication-specific runtime behavior, inbound/outbound routing logic, platform-specific message transformation, and app-level message-processing coordination. Shared mission types, shared event schemas, shared auth helpers, and shared observability patterns should come from packages rather than being reinvented inside the gateway.

It is also important that `zulip-gateway` be deployable independently. It belongs in `apps/` because it is a service in its own right. Even though it depends on shared packages, it should remain a clear standalone runtime unit with a bounded responsibility.

Finally, the gateway should be designed for current value rather than speculative overreach. It does not need to solve every future communication scenario. It needs to perform the current architecture’s communication role well and cleanly. If it does that, it creates a stable base for future communication growth.

## **5.3 `prism-defender`**

`prism-defender` is the local cleanup and residue-reduction service application in the monorepo. It exists because the architecture deliberately takes worker-node risk seriously. Even with centralized memory, centralized skills, centralized secrets, and a command-centre model, the worker still executes live work in a real environment. Temporary runtime residue can appear. Controlled temporary paths may be used. Session-bound sensitive material may briefly exist. Logs or intermediate outputs may be produced before they are centrally persisted. Without an explicit local defensive layer, the architecture would have a major practical blind spot.

The primary responsibility of `prism-defender` is cleanup discipline. It should monitor the local runtime conditions or temp paths it is responsible for and ensure that temporary worker-side residues do not simply accumulate by default. Once important results have been successfully transmitted or no longer need local presence, `prism-defender` should support the reduction or removal of leftover local artifacts according to the architecture’s rules.

The second responsibility is support for fail-closed and controlled shutdown behavior. If the worker loses valid central authorization beyond threshold, if the system indicates it should shut down, or if certain defined conditions make continued local presence undesirable, `prism-defender` should participate in cleanup and containment. It does not define central policy, but it helps make central policy operationally real on the local node.

The third responsibility is observability of local defensive behavior. A system that claims to minimize local residue but has no way to surface cleanup behavior is difficult to trust. `prism-defender` should therefore emit useful signals or logs about its cleanup activity, failures, warnings, and relevant conditions so that the broader observability system can reflect what happened. This does not mean the sidecar becomes a giant telemetry engine. It means it should produce enough evidence that its job can be validated and improved.

The fourth responsibility is environment-aware posture. `prism-defender` may behave differently in local development, staging, and production, but those differences must be explicit and controlled. For example, development may be more permissive for diagnosis, while production should be stricter about cleanup and residue minimization. The application must support these distinctions without breaking the underlying security philosophy.

The fifth responsibility is architectural realism. `prism-defender` should never be documented or implemented as if it provides magical invisibility or perfect worker-node secrecy. It is a practical security and hygiene component. It materially improves local handling and containment posture. That is already valuable. The monorepo product should preserve this realism and resist turning the sidecar into a vague promise rather than a usable service.

Within the monorepo, `prism-defender` should own its own runtime logic and local cleanup behavior. It may consume shared configuration, observability utilities, and shared type definitions from packages, but it should remain a bounded app-level component rather than a diffuse set of scripts hidden in the runtime wrapper. Treating it as a proper app strengthens both maintainability and architectural clarity.

`prism-defender` is also one of the clearest examples of why the monorepo product is more than a dashboard plus some packages. It includes real runtime services that embody the architecture’s local discipline. If this app does not exist in meaningful form, the system’s security posture remains incomplete.

## **5.4 `bot-runtime`**

`bot-runtime` is the monorepo application that wraps and operationalizes the LiNKbot runtime pattern on the proprietary side. It is where the governed worker becomes a real deployable and executable product component. This app is especially important because it sits at the meeting point between the proprietary LiNKtrend platform and the separate OpenClaw fork. If `linkaios-web` is the visible command centre, `bot-runtime` is the practical worker-side orchestrator that turns central control into active execution.

The first responsibility of `bot-runtime` is startup orchestration. It must initialize a worker instance in a way that respects the architecture’s central governance rules. This includes preparing the runtime environment, handling the bootstrap authentication path, invoking the separate OpenClaw-based engine layer appropriately, and ensuring that the worker enters the system as an authorized participant rather than as a self-owning local process. This app therefore owns worker-side runtime assembly, not central policy itself.

The second responsibility is integration with the LiNKlogic runtime path. Workers need to retrieve identity context, mission context, approved skills, approved tools, and relevant memory fragments. `bot-runtime` should therefore work with the shared `linklogic-sdk` and related packages to make those retrieval and enforcement behaviors available during execution. It should not hardcode shadow versions of central contracts. It should consume the shared runtime platform logic properly.

The third responsibility is local operational coordination. During a worker session, `bot-runtime` needs to coordinate mission attachment, active session state, tool usage pathways, central result persistence hooks, and interaction with the cleanup sidecar. It should not itself become the owner of durable truth, but it must be the place where worker execution is assembled coherently enough that the architecture is actually usable.

The fourth responsibility is isolation from OpenClaw source ownership. `bot-runtime` must not become a hidden copy of the OpenClaw fork or a place where engine-level code is manually duplicated. Its role is to integrate with the separate fork, not to replace repository boundaries with convenience. This is a key product requirement because the architecture explicitly chose to keep OpenClaw separate.

The fifth responsibility is support for deployment flexibility. Since the architecture allows one worker on one VPS, many workers on one VPS, many workers across many VPSs, and local execution on a Mac mini, `bot-runtime` must be structured so that its deployment assumptions are not tied to one special machine setup. It should support environment-aware operation while still preserving the same conceptual worker model across deployment contexts.

The sixth responsibility is observability and status signaling. A worker runtime is only governable if it can report status, emit useful traces, participate in heartbeat logic, and shut down correctly when required. `bot-runtime` should therefore include the app-level coordination needed to make these behaviors real. It may rely on shared observability packages and shared status contracts, but it must implement them as part of its runtime behavior.

The seventh responsibility is restraint. Because `bot-runtime` sits close to the worker engine, it is at high risk of becoming a catch-all for anything related to workers. The PRD should therefore be read as a warning against that tendency. Central identity semantics, broad mission truth, central skill governance, or generic shared package code should not quietly migrate into this app just because the runtime needs them. `bot-runtime` is the worker assembly layer, not the whole system in disguise.

A correctly built `bot-runtime` is one of the clearest proofs that the monorepo product is working. It shows that the proprietary platform can actually bring a worker under central governance and let it act within approved boundaries.

## **5.5 `bot-manager` as Reserved but Optional Future App**

`bot-manager` is not part of the required current build, but it is a reserved future application that deserves explicit mention in the PRD. The reason to include it here is not to create scope creep. It is to make clear how the monorepo should think about future fleet or runtime management if and when a dedicated manager app becomes justified.

At present, the current architecture does not require a standalone `bot-manager` app because the current build is intentionally narrow and OpenClaw-first. The system needs LiNKaios as command centre, bot-runtime as worker wrapper, LiNKlogic as shared retrieval-and-enforcement logic, PRISM as cleanup sidecar, and Zulip-Gateway as communication bridge. That is already a serious product surface. Adding a separate manager app before there is a clear operational need would risk over-complicating the initial implementation.

However, there are plausible future conditions under which `bot-manager` would become useful. If the system evolves to support larger worker fleets, richer worker scheduling, dedicated assignment orchestration, worker pool management, more advanced runtime lifecycle control, or cross-environment worker coordination, then a dedicated app responsible for those concerns may become valuable. In that future, `bot-manager` would likely own functions that are too orchestration-specific to belong in LiNKaios web and too broad to be embedded inside each individual runtime wrapper.

By reserving `bot-manager` now, the monorepo keeps future growth pathways clearer. Developers can understand that if worker-fleet coordination needs become substantial, the architecture already has a natural place for that capability to land. This is better than allowing those features to accrete awkwardly inside `linkaios-web` or `bot-runtime` later.

The important product rule, however, is that reserved future scope is not current scope. No `bot-manager` app should be created in the monorepo unless the current build truly requires it or a later approved phase explicitly promotes it into scope. Placeholder thinking is acceptable; placeholder app bloat is not.

## **5.6 App-to-App Interaction Rules**

Because the monorepo contains multiple first-class applications, the product needs explicit rules for how apps interact. Without such rules, apps may gradually form ad hoc dependencies on each other’s internals, leading to tight coupling and hidden architecture violations.

The first rule is that apps should interact through shared contracts and shared packages where possible, not by importing each other’s internal implementation code casually. For example, `linkaios-web` may consume shared types, shared data-access layers, or shared observability contracts, but it should not directly reach into private implementation files of `bot-runtime` or `zulip-gateway`. This preserves app boundaries and keeps each app deployable and maintainable in its own right.

The second rule is that central concepts should be shared through packages, not invented by app-to-app negotiation. Identity shapes, mission models, manifest semantics, trace event types, and similar cross-cutting concepts should live in packages like `shared-types`, `db`, or `observability`. Apps should depend on these shared definitions rather than creating informal bilateral agreements with one another.

The third rule is that apps should not become implicit APIs to one another unless explicitly designed that way. For example, `linkaios-web` may interact with backend services or data access through intended interfaces, but it should not assume it can directly rely on internal runtime behavior of `prism-defender` or `bot-runtime` just because all the code lives in one repository. Monorepo proximity does not erase service boundaries.

The fourth rule is that responsibility should remain local even when coordination is required. For example, `bot-runtime` may rely on `linklogic-sdk` and shared config packages to do its job, but it remains the owner of runtime assembly. `zulip-gateway` may consume mission types and send central signals, but it remains the owner of communication mapping. Apps may collaborate, but they must not dissolve into each other.

The fifth rule is that future additions should respect the same pattern. If a future app such as `bot-manager` is added, it should enter the system through clear shared contracts, not by depending directly on accidental internals of existing apps.

These interaction rules are essential because the monorepo’s greatest strength—source-code unity—can also become a weakness if app boundaries are ignored. The product should therefore treat app separation as a deliberate architectural feature, not as an inconvenience.

# **6\. Shared Packages in the Monorepo**

## **6.1 `linklogic-sdk`**

`linklogic-sdk` is one of the most important shared packages in the monorepo because it embodies the proprietary runtime bridge between central system truth and worker execution. If LiNKaios is the command centre and `bot-runtime` is the worker-side runtime wrapper, then `linklogic-sdk` is the reusable internal package that lets workers retrieve governed context, apply runtime enforcement logic, and resolve approved skills and tools in a consistent way across the product.

The first responsibility of `linklogic-sdk` is governed retrieval. Workers need access to centrally stored identity-linked, mission-linked, and policy-constrained information such as manifests, mission context, skills, memory fragments, and approved tool references. This retrieval should not be implemented separately in every app that needs it. The system needs one shared package that defines how such retrieval works, what contracts it returns, and how central authority is represented at runtime. `linklogic-sdk` is that package.

The second responsibility is enforcement at the package-contract level. Retrieval is not enough. The architecture explicitly requires runtime enforcement of scope, permissions, manifest state, mission boundaries, and approved capability usage. The SDK therefore should not be a thin helper that merely fetches records. It should include the logic and interfaces necessary to support runtime checks that determine what a worker is allowed to retrieve and under what conditions a request should be denied or constrained. This does not mean every security rule is hardcoded into the package. It means the package should be the reusable place where governed retrieval and governed runtime interpretation come together.

The third responsibility is skill resolution. `linklogic-sdk` should define how centrally stored skills are requested, filtered, version-resolved, and returned to runtime consumers. Because skills are centrally governed and versioned, a worker should not have to implement custom logic each time to decide which version is current or whether access is permitted. The SDK should provide a stable interface for resolving the right skill in the right mission and identity context.

The fourth responsibility is approved tool resolution. Since the architecture separates skills from tools, the runtime needs a package that can interpret approved tool references and map them to controlled tool availability on the plugin/runtime side. `linklogic-sdk` should support this by exposing a stable way to retrieve, verify, and interpret tool metadata and by providing runtime-facing contracts that help the worker layer ask for the right executable capability without reverting to arbitrary code execution patterns.

The fifth responsibility is progressive memory retrieval support. LiNKbrain is designed around structured memory plus progressive disclosure, not around dumping the full memory base into every worker. The SDK should therefore support the retrieval flow that begins with mission-aware context and proceeds toward narrower deeper memory retrieval when needed. It should help enforce scope and preserve the distinction between root-level orientation context and deeper knowledge fragments.

The sixth responsibility is runtime caching support. The architecture already allows short-lived RAM-based policy and context caching so that workers do not have to query the central system for every small step. `linklogic-sdk` should define or support how such caching works without turning cached local data into durable source of truth. In other words, it should help with temporary efficiency while preserving architectural discipline.

The seventh responsibility is cross-app consistency. While `bot-runtime` is the most obvious consumer, other monorepo apps or services may also need to understand the same mission, skill, or runtime resolution rules. By placing these rules into `linklogic-sdk`, the monorepo avoids creating subtly different versions of the same runtime semantics across different codebases.

The eighth responsibility is to remain bounded. Because `linklogic-sdk` is central, it is at risk of becoming too large and too abstract. The package must not quietly become a generic catch-all for all backend logic. It should remain focused on runtime retrieval, runtime enforcement, skill resolution, tool resolution, and memory retrieval contracts. Other concerns—UI, app-specific orchestration, low-level deployment scripting, or unrelated utilities—belong elsewhere.

From a product perspective, `linklogic-sdk` is one of the clearest expressions of the monorepo’s value. It is not something that should live inside the external engine fork, nor should it be duplicated inside worker wrappers. It is proprietary system logic, and it deserves a first-class shared package.

## **6.2 `db`**

The `db` package is the shared data-access and database-contract layer of the monorepo. Its purpose is to centralize how applications and services interact with the system’s structured data model so that the monorepo does not drift into multiple inconsistent understandings of the same database concepts. Because the architecture centralizes durable truth in the Supabase-backed data layer, a clean shared database package is essential.

The first responsibility of `db` is to define reusable access patterns for the core entities of the system. This includes identities, missions, manifests, skill records, memory records, trace records, file references, and other structured data domains that the apps and services need to read from or write to. These access patterns should be coherent and explicit. The package should help apps work with system truth consistently instead of each app inventing its own database semantics.

The second responsibility is to centralize schema-facing knowledge. Even if the exact schema design evolves, the monorepo should not have database table details duplicated casually across apps. The `db` package should act as the shared layer that understands how the proprietary product talks to the central database. That includes queries, mutations, and mapping between raw stored forms and the internal models the product uses.

The third responsibility is to support data integrity through consistency. If one app interprets mission status one way and another app writes it differently, the architecture will drift. The `db` package reduces this risk by giving the product a reusable and intentional access layer. Apps should not treat it as optional when working with central entities that matter architecturally.

The fourth responsibility is to remain below the level of business-governance ownership. The `db` package is not the owner of mission policy, identity philosophy, or skill governance as concepts. It is the shared layer that accesses and persists those concepts correctly. This is an important distinction. The package should centralize data interaction, not replace higher-level product logic that belongs in apps or specialized packages such as `linklogic-sdk`.

The fifth responsibility is support for future schema clarity. Because the architecture expects one Supabase project with structured schema domains, the `db` package should remain semantically aligned with those domains. It should help keep data access understandable rather than obscuring everything behind a generic database helper layer.

The sixth responsibility is to work cleanly with both structured storage and file references. While object storage itself is separate from Postgres, the product will often need to relate mission records, skill records, or output records to file pointers. The `db` package should therefore support the metadata side of those relationships even when the actual file lives in storage buckets.

The `db` package is therefore not a convenience layer. It is a contract-preserving foundation for the monorepo product. Without it, central data ownership would remain conceptually centralized but implementation would quickly fragment.

## **6.3 `auth`**

The `auth` package is the shared authentication, authorization-support, and credential-access helper layer for the monorepo. Its purpose is not to become the owner of all security policy, but to centralize the reusable logic that multiple applications and services need in order to interact with the architecture’s identity and secret-governance model correctly.

The first responsibility of `auth` is to support common authentication flows where multiple apps need aligned behavior. For example, if both LiNKaios web and backend services need to interpret central identity sessions, validate privileged operator access, or consume centrally managed tokens in a consistent manner, the package should provide those shared helpers. This reduces repeated custom security logic across apps.

The second responsibility is to help mediate access to centrally governed secrets or secret-related runtime flows where reusable code is justified. The architecture already locked in centralized secret management and tiered access. The `auth` package should help applications and services interact with that model safely and consistently. This does not mean the package becomes a general secret store. It means it can expose helpers and interfaces for using the central secret model correctly.

The third responsibility is to support permission-related interpretation where common. If multiple apps need shared ways to interpret whether a user or system actor has certain classes of access, or whether a runtime identity is in a particular operational state, those helpers may belong here as long as they are truly cross-cutting and not app-specific policy logic.

The fourth responsibility is boundedness. Security-related code is particularly vulnerable to becoming a generic mess. The `auth` package should not become a vague “security stuff” folder. It should remain focused on shared auth/session/credential-access patterns that are reused across the monorepo.

In short, `auth` exists so that the product does not scatter fragile authentication and secret-access patterns across multiple apps. It is a package for consistent secure integration, not for replacing the architecture’s broader policy ownership.

## **6.4 `shared-types`**

`shared-types` is the semantic contract package of the monorepo. It should contain the common type definitions and data-shape declarations that multiple apps and packages rely on. In a system like LiNKtrend, where concepts such as identities, missions, manifests, skills, tools, traces, memory fragments, statuses, and events must mean the same thing across many parts of the product, a shared type package is not optional. It is one of the key ways the monorepo maintains conceptual integrity.

The first responsibility of `shared-types` is to define the major cross-cutting entities used throughout the system. If a mission means one thing in LiNKaios, another thing in Zulip-Gateway, and a slightly different thing in bot-runtime, the architecture begins to drift. `shared-types` helps prevent this by defining common mission shapes, identity structures, status types, event payloads, skill references, tool references, and other core data forms in one place.

The second responsibility is to support app/package interoperability. Applications and packages should be able to depend on common type contracts rather than negotiating meaning informally. This is especially important in an AI-assisted development workflow because AI tools often propagate whichever pattern they last observed. A strong central type package reduces the chance of duplicated or inconsistent concept definitions.

The third responsibility is semantic clarity. Types should be named and structured in a way that reflects the architecture honestly. The package should not degenerate into a pile of poorly named shared interfaces. Because it is one of the main semantic anchors of the product, it should preserve the terminology approved in the architecture and PRDs wherever possible.

The fourth responsibility is restraint. `shared-types` should contain shared type definitions, not arbitrary logic. If it begins to accumulate helper functions, data-access logic, or app-specific UI state, it loses its purpose. The monorepo must be disciplined here because “types” packages often attract unrelated code simply because many things import them.

The fifth responsibility is future-safe evolution. As the system grows, `shared-types` will likely expand. It should do so through well-bounded additions rather than through reactive clutter. The product should treat this package as an architectural asset, not as a convenience file bucket.

## **6.5 `shared-config`**

The `shared-config` package centralizes configuration parsing, environment interpretation, feature-flag handling, and system-wide configuration constants that should remain consistent across multiple monorepo apps and packages. In an architecture that explicitly distinguishes local development, staging, and production, shared configuration behavior is part of product correctness, not merely a developer convenience.

The first responsibility of `shared-config` is to provide one common interpretation of environment variables and runtime configuration for the proprietary system. Apps should not each invent their own subtly different way of parsing the same central base URL, environment mode, storage bucket name, or feature toggle if that value has system-wide meaning. The package should reduce this duplication.

The second responsibility is to support environment strategy. The architecture requires environment-aware behavior, especially around logging posture, cleanup strictness, deployment assumptions, and runtime validation rules. `shared-config` should help expose those distinctions in a structured and reusable way so that different apps can behave correctly without each carrying their own private environment interpretation.

The third responsibility is to centralize stable constants or shared configuration contracts. This may include names of central configuration keys, shared defaults, or structured environment settings that many apps need to consume in the same way.

The fourth responsibility is to remain focused. `shared-config` should not become a generalized utilities package. It is about configuration and environment behavior, not random helpers. This focus is important because configuration drift is easy to create and hard to debug.

The fifth responsibility is operator friendliness. Since the founder is a non-technical operator, consistent and predictable config handling matters. `shared-config` should help reduce the risk of each app requiring different mental models for similar settings.

## **6.6 `observability`**

The `observability` package is the shared instrumentation and event-shaping layer for logs, metrics, and trace-relevant structures across the monorepo. Its purpose is to help all major apps and services speak the same operational language so that the system produces one coherent observability surface rather than several incompatible ones.

The first responsibility of `observability` is logging consistency. Apps and services should use common log shapes, common identity and mission tagging approaches, and common event categories where appropriate. The package should help define those patterns so that a log emitted by `bot-runtime` can be interpreted coherently alongside a log emitted by `zulip-gateway` or `prism-defender`.

The second responsibility is metrics and health-event consistency. If different services expose health or status data, the package should help define the naming, shape, or interpretation of those shared signals. This improves the operator’s ability to understand the system through LiNKaios and related operational views.

The third responsibility is trace-event structure. Because the architecture values mission traces and auditability, the package should support shared structures for meaningful runtime events so that trace persistence remains easier to standardize. This does not mean every trace event is hardcoded in the package, but it does mean the package should help the system agree on how trace-worthy events are represented.

The fourth responsibility is support for future growth. As the system expands, observability can become one of the easiest places for chaos to emerge. A shared package helps keep observability disciplined early, which makes later growth easier.

The fifth responsibility is boundedness. The `observability` package should contain instrumentation logic, event schemas, metrics helpers, and related concerns—not general unrelated runtime helpers.

## **6.7 `ui`**

The `ui` package is the shared user-interface component layer for the monorepo. Its main current consumer is expected to be `linkaios-web`, but the package still deserves its own place because shared UI structure becomes important quickly in command-centre products and future interface surfaces may also benefit from it.

The first responsibility of `ui` is to centralize reusable presentation components such as cards, tables, panels, controls, status indicators, layout primitives, and other visual building blocks that the command centre is likely to use repeatedly. This helps keep the web application cleaner and prevents repeated reinvention of the same interface pieces.

The second responsibility is visual consistency. The command centre should feel like one product, not like a collection of unrelated screens. The `ui` package helps enforce a shared design vocabulary and shared component behavior across the app.

The third responsibility is separation of presentation from app-specific business logic. Shared UI components should not silently absorb mission semantics, identity rules, or dashboard-specific state machines that only make sense inside one page or flow. The package should provide reusable presentational or interaction primitives, not become a second copy of `linkaios-web`.

The fourth responsibility is future-proofing. Even though only one major operator-facing app exists in the current build, future internal views or additional UI surfaces may emerge. Keeping reusable UI patterns in a shared package now makes that future easier without forcing over-complexity into the app.

The fifth responsibility is discipline. UI packages often become a home for random front-end helpers or non-visual logic. This package should resist that drift.

## **6.8 Rules for Adding New Shared Packages**

Because shared packages can either strengthen or weaken a monorepo, the product needs explicit rules for when new shared packages should be added. Without such rules, the monorepo will tend to fragment into too many small abstractions or too many badly named generic buckets.

The first rule is necessity. A new shared package should only be created when there is a clear current need, not merely a speculative future possibility. If code is only used in one app and is likely to remain app-specific, it should stay local unless a later real reuse case emerges.

The second rule is repeated value. A shared package should centralize logic or contracts that are already proving cross-cutting value or are so central to the architecture that they deserve shared ownership from the beginning. Shared types and observability are good examples. Arbitrary one-off conveniences are not.

The third rule is semantic clarity. The proposed package must have a name and responsibility that can be explained in one sentence. If the only description is “miscellaneous helpers,” the package should not be created.

The fourth rule is boundary preservation. A package should not be created if doing so will blur app ownership or centralize logic that actually belongs in one specific product surface. Shared packaging should clarify ownership, not obscure it.

The fifth rule is architectural fit. The package should strengthen the proprietary platform and align with the approved architecture. If it creates a parallel structure or encourages hidden duplication, it should be rejected.

These rules help ensure that the package layer remains an asset rather than becoming a tax on future development.

# **7\. Product Requirements for LiNKaios Web**

## **7.1 Product Purpose of the Dashboard**

The primary purpose of `linkaios-web` is to function as the operational command centre of the LiNKtrend system. This is not a decorative dashboard, not a read-only monitoring page, and not a generic admin panel generated because “every platform needs one.” It is the central human-operable surface through which the founder sees, governs, and steers the proprietary system. If the worker layer is the body of execution and the central data platform is the durable mind, then `linkaios-web` is the place where the founder gains usable sight and control over that mind-body relationship.

The dashboard must therefore make the architecture legible. It should present the system as it actually exists: as identities, missions, skills, memory, manifests, traces, files, health signals, and operational states. It should not force the operator to mentally reconstruct those concepts from raw database tables or from low-level infrastructure details. Its product purpose is to translate central architectural truth into actionable human visibility.

A second core purpose is central intervention. The operator should be able not only to inspect the system but also to act on it. That means the dashboard must support product behaviors such as reviewing worker status, marking workers inactive, understanding mission linkage, reviewing current skill versions, seeing relevant traces, and taking central governance actions that the rest of the system will honor. Without this, the architecture’s claim to centralized authority remains abstract.

A third purpose is confidence and continuity. The founder is building a system intended to support increasing delegation to governed digital workers. That only becomes practical if the central dashboard provides enough confidence that the system can be understood and corrected when needed. `linkaios-web` should therefore become the first place the operator goes to answer practical questions such as:

- Which workers exist right now?  
- Which are active or inactive?  
- Which mission is each worker attached to?  
- What skill version is currently approved?  
- What memory or context exists for this mission?  
- What happened recently that matters?  
- Is anything failing or in an anomalous state?

A fourth purpose is to reduce operational dependence on raw infrastructure access. A founder should not have to log into servers, inspect raw temp directories, or manually grep through scattered logs just to know whether the system is behaving correctly. The dashboard should replace much of that need by surfacing the right central truth and the right summarized operational signals.

A fifth purpose is to preserve architectural discipline in interface form. The dashboard must reinforce the separation between durable central truth and temporary worker execution. It should not encourage the operator to think in terms of “go inspect the worker machine and see what it knows.” It should encourage the operator to think in terms of centrally governed entities, centrally visible state, centrally retained traces, and centrally controlled permissions.

A sixth purpose is future readiness without current bloat. The first version of the dashboard does not need every future governance feature or every future analytics screen. But it should be structured as a durable product surface that can later grow into richer mission control, policy management, trace analysis, and organizational oversight. In other words, it should be narrow in current scope but serious in product shape.

From this purpose follow several product requirements. The dashboard must be entity-aware, action-capable, operationally legible, and rooted in real system truth. It must also remain clear enough for a non-technical solo founder to use effectively. These requirements are not superficial UX preferences. They are central to whether the LiNKtrend architecture can actually be operated.

## **7.2 Required Core Screens and Views**

Version 1 of `linkaios-web` must include a set of core screens or views sufficient to make the current architecture operationally usable. These views should be shaped by the central entities and behaviors of the system rather than by generic admin-template thinking. The product does not need every imaginable screen at once, but it does need enough that the operator can understand and manage the system as it currently exists.

The first required view is a system overview or home view. This should act as the high-level cockpit of the platform. It should summarize current worker counts and statuses, active missions, recent important traces or alerts, and key health indicators. Its purpose is to help the operator understand the state of the system quickly without drilling into individual detail immediately. It should answer the question: “What is happening right now that I need to know?”

The second required view is an agent or worker management view. This screen should present the centrally governed worker identities, their active or inactive states, current mission associations, relevant status indicators, and other identity-linked operational facts. It should support inspecting a worker as a durable system entity rather than merely as a process. It should also support appropriate actions such as review, disablement, or status-related governance operations within the current build scope.

The third required view is a mission view. Missions are first-class work units in the architecture, so the dashboard must surface them directly. A mission view should show mission identity, status, assigned workers, relevant files or artifacts, key trace markers, and recent operational activity. It should make it possible for the operator to understand a mission as a real governed object rather than as a loosely inferred conversation thread.

The fourth required view is a skills view. Since centrally governed skills are one of the architecture’s most important assets, the dashboard must allow the operator to inspect which skills exist, what versions are current, what metadata attaches to them, and whether changes or promotions have occurred. A Version 1 skills view does not need to become a full authoring studio yet, but it must support meaningful visibility into the skill layer.

The fifth required view is a memory or knowledge view. Since LiNKbrain is central to the architecture, the dashboard must expose at least a usable way to inspect memory structures relevant to missions, durable facts, or knowledge fragments. The goal is not to dump raw vector internals to the operator. The goal is to make the existence and structure of centralized memory legible and reviewable.

The sixth required view is an observability and trace view. This should provide access to meaningful traces, recent important events, failures, worker-state changes, cleanup-related signals, or other centrally retained operational records. It should help the operator answer the question: “What happened, under what entity, and does it matter?”

The seventh required view is a settings or control view for central governance controls appropriate to Version 1\. This may include manifest visibility, environment-aware operational state, or other foundational central control information. It should not become an overbuilt policy lab in the first version, but the command centre must include at least the most basic central control surfaces needed by the architecture.

A final requirement across all these views is consistency. The same mission, identity, skill, or trace concepts should appear consistently across screens. The dashboard should not force the user to re-learn entity semantics on each page. This consistency depends heavily on the shared types and shared data contracts provided elsewhere in the monorepo.

## **7.3 Identity and Agent Management Requirements**

Identity and agent management are core product responsibilities of `linkaios-web`. Because the architecture is built on durable centrally governed identities, the dashboard must make those identities inspectable and actionable in a meaningful way. A weak identity-management surface would undermine the architecture’s broader control-plane claim.

The first requirement is that the dashboard must present centrally governed identities as first-class records. The operator should be able to see the canonical identity string or identity representation, relevant type or class information, current role metadata, lifecycle state, current active/inactive status, and other key properties that distinguish one worker from another. This presentation should reinforce the principle that identity is durable and distinct from current mission assignment.

The second requirement is that the dashboard must differentiate identity from current runtime state. A worker identity may exist even if no active runtime session is currently operating. Conversely, a runtime session should be interpretable as an active manifestation of a centrally governed identity rather than as a free-floating process. The dashboard should therefore clearly distinguish between durable identity status and transient runtime status where relevant.

The third requirement is lifecycle visibility. The operator should be able to understand whether a worker is active, inactive, suspended, retired, or otherwise in a defined lifecycle state. If the architecture supports reassignment or role changes over time, the dashboard should reflect current metadata while preserving the sense that the underlying identity remains continuous. This helps reinforce the DPR-aligned identity model.

The fourth requirement is identity-linked governance actions. At a minimum, the dashboard should allow the operator to review and where appropriate change certain central governance states such as activation status or other current-state controls relevant to the approved build. The product does not need a huge HR-like interface. It needs enough functionality to make identities governable rather than merely observable.

The fifth requirement is mission linkage visibility. The dashboard should allow the operator to see which mission or missions a worker is currently attached to or associated with. This is important because worker usefulness in this architecture is mission-bound. An identity screen or worker detail view that cannot connect the worker to its mission context would be incomplete.

The sixth requirement is traceability support. When the operator inspects a worker, the dashboard should make it possible to see relevant recent activity, significant traces, or operational history sufficient to understand that worker’s current and recent role in the system. This does not require full forensic depth on the main identity screen, but it does require a coherent path from identity to meaningful operational evidence.

The seventh requirement is future compatibility with external pathways without prematurely building them. Since the architecture reserves room for future external/client worker types, the identity-management product model should be compatible with eventual distinction between internal and external classes. However, Version 1 should remain internal-first and not overcomplicate the interface with premature client-management requirements.

In summary, identity and agent management in `linkaios-web` must make centrally governed workers visible, distinguish durable identity from transient runtime state, expose lifecycle and mission linkage, and support basic control. These are non-negotiable product requirements because the architecture cannot be governed without them.

## **7.4 Mission and Status Management Requirements**

Missions are one of the primary work-organizing concepts in the LiNKtrend architecture, so `linkaios-web` must treat mission management as a central product capability rather than an indirect or secondary concern. The dashboard should allow the operator to understand, inspect, and act on missions as structured work units with state, context, and relationships to workers, memory, files, and traces.

The first requirement is that missions must be directly visible as their own entity type. The operator should not have to infer missions indirectly from chat topics, worker labels, or storage artifacts. A mission should have a clear record, status, associated workers, relevant timestamps, and meaningful linked data. The dashboard should present this in a way that reflects mission centrality to the architecture.

The second requirement is mission status visibility. The operator must be able to see whether a mission is active, blocked, completed, inactive, under review, or in another defined state used by the product. The exact list of Version 1 statuses may evolve, but the principle does not: mission state must be visible and governed centrally.

The third requirement is relationship visibility. A mission view should show which workers are attached, what major files or artifacts are linked, what key traces are associated, and what relevant memory or central context exists. This does not mean every mission screen must become infinitely detailed. It means the mission screen must reflect the architecture’s relational structure rather than reducing missions to a title and a description.

The fourth requirement is mission continuity support. Since missions may persist beyond a single worker runtime and may later involve worker handoff or resumption, the dashboard must present missions as ongoing central entities rather than as ephemeral sessions. This helps the operator understand the system as a coordinated venture-factory platform rather than a set of isolated worker interactions.

The fifth requirement is mission-level action support where appropriate. The dashboard should support central mission control actions relevant to Version 1, such as review of status, central state updates where approved, or other actions needed to govern the system. The exact action surface may remain narrower in the first build, but purely passive mission display is not enough.

The sixth requirement is coherent status presentation across the dashboard. Worker status and mission status are related but not identical. The interface should reflect that clearly. A worker can be active while a mission is blocked, or a mission can be active while a particular worker is inactive. The product must preserve these distinctions cleanly.

The seventh requirement is trace and observability integration. The dashboard should allow the operator to move from a mission view into the relevant recent important traces or history that explain what has happened within that mission. This supports both operational oversight and trust in the central system.

These requirements ensure that missions become real governance objects inside the dashboard and not just an implementation detail hidden in database records.

## **7.5 Skill and Memory Management Requirements**

Because LiNKskills and LiNKbrain are centrally governed pillars of the architecture, `linkaios-web` must include meaningful product support for both skill visibility and memory visibility. These views do not have to become complete authoring platforms in Version 1, but they do need to make the central intelligence of the system inspectable and administratively usable.

For skills, the first requirement is inventory visibility. The dashboard should show which skills exist, what their names are, what metadata categories they belong to, and what their current version statuses are. The operator must be able to tell whether a skill exists centrally and which version is currently authoritative.

The second requirement is version visibility. Because the architecture depends on governed versioning, the dashboard must allow the operator to see current versus historical skill versions or at least enough status information to know what is current and what has changed. If the system is to improve over time, the operator must be able to inspect that improvement path.

The third requirement is metadata visibility. Skill records should expose at least the major fields relevant to governance, such as description, role or mission relevance, success criteria summaries, approved tool references, and other core metadata. The dashboard should not treat skills as opaque blobs of text.

The fourth requirement is the ability to inspect skill content at a useful level. Whether through detail pages or expandable views, the operator should be able to review what a skill actually says, not just its metadata wrapper. This is important because the central skill layer is one of the organization’s highest-value controlled assets.

For memory, the first requirement is memory-layer legibility. The dashboard should not expose raw storage in a confusing way. Instead, it should allow the operator to inspect mission-linked memory, durable fact records, or knowledge fragments through meaningful views. The operator should be able to understand that the memory layer is real and structured.

The second requirement is mission-memory linkage. A mission view and memory view should connect cleanly enough that the operator can inspect the context stored for a mission and understand what centralized knowledge exists around it. This is one of the main practical expressions of LiNKbrain’s value.

The third requirement is trace-derived visibility where relevant. If durable knowledge or summaries have emerged from mission traces, the dashboard should eventually make that visible in a useful way. Version 1 may keep this relatively narrow, but the memory product surface should already be shaped for that future.

The fourth requirement is bounded scope. The dashboard must not become a generic unstructured data browser. It should remain a governance-oriented interface for centrally meaningful skill and memory assets.

Together, these requirements ensure that the operator can see and trust the central intelligence layers rather than treating them as invisible backend abstractions.

## **7.6 Observability and Governance Reporting Requirements**

`linkaios-web` must include meaningful observability and governance reporting because without it the system cannot be governed effectively. The command centre should not depend on the founder inspecting raw infrastructure state manually to understand whether the system is healthy or whether something important has occurred.

The first requirement is recent-event visibility. The dashboard should surface meaningful recent system events such as worker status changes, mission changes, notable trace records, errors, fail-closed events, or other significant signals. This gives the operator a current operational pulse.

The second requirement is health-state visibility. The dashboard should show whether the major parts of the system appear healthy enough to operate: worker statuses, communication service state where available, mission counts, and other product-relevant health signals. This should not reduce the platform to infrastructure metrics alone; it should reflect architectural health.

The third requirement is trace access. The operator must be able to inspect meaningful traces or at least navigate to them from relevant identity or mission views. This supports review, debugging, and confidence in system behavior.

The fourth requirement is summarized operational reporting. The command centre should condense complexity into views the founder can use. It should not require constant reading of raw event feeds. Summaries of active issues, important recent changes, or system posture are part of the product requirement.

The fifth requirement is governance-oriented presentation. Observability must support control, not just awareness. The dashboard should make it easier to see which entity needs attention and how that relates to central authority.

## **7.7 Access Control and Operator Experience Requirements**

Because `linkaios-web` is the central governance surface, it must provide an operator experience that is secure enough to matter and clear enough to use. This is not merely a UI concern. It is part of product correctness.

The first requirement is appropriate operator access control. The current build is founder-operated, but the dashboard must still treat operator access as meaningful privileged access. It should not be designed as if any surface is safe to expose casually. Even if multi-operator features are future scope, the application should already reflect that command-centre actions are privileged.

The second requirement is clarity of navigation. A non-technical solo founder should be able to move between workers, missions, skills, memory, and traces without getting lost in developer-oriented information architecture. The dashboard should be structured around system entities and operator tasks, not around internal implementation quirks.

The third requirement is consistency of language. The interface should use the same terms as the architecture and PRDs where practical. If the system talks about missions, identities, manifests, and skills in documentation, the dashboard should not rename them arbitrarily in the UI. This reduces cognitive friction and improves AI-assisted support.

The fourth requirement is action safety. Where the dashboard supports central control actions, it should present them in ways that reduce accidental misuse. This does not require excessive ceremony, but it does require intentionality. Governance actions should feel deliberate and comprehensible.

The fifth requirement is future-ready structure. Even if Version 1 is founder-only and relatively narrow, the dashboard should be organized like a real product surface that can later grow. Good navigation, clear component boundaries, and consistent semantics are part of that requirement.

Taken together, these product requirements make `linkaios-web` a true command centre rather than a superficial dashboard. That is what the architecture requires, and that is what the monorepo product must deliver.

# **8\. Product Requirements for LiNKlogic SDK and Runtime Integration**

## **8.1 Retrieval Requirements**

The LiNKlogic SDK and its related runtime integration behavior exist to solve one of the most important product problems in the LiNKtrend system: how a worker retrieves the right centrally governed information at the right time without becoming a permanent local owner of that information. Because the architecture is built on centralized intelligence and governed distributed execution, the retrieval layer is not a convenience feature. It is one of the core product capabilities the monorepo must implement correctly.

The first retrieval requirement is identity-aware retrieval. The SDK must support retrieval flows that are explicitly tied to centrally governed worker identity. This means a worker does not simply ask for a skill or a memory fragment anonymously. It asks as a known identity operating under a current central status. The SDK should therefore expose retrieval methods that require or incorporate identity context so that the rest of the system can remain aligned with the architecture’s control model.

The second retrieval requirement is mission-aware retrieval. In the LiNKtrend system, workers do not operate in a context vacuum. They are attached to missions, and mission scope determines which memory, files, statuses, or context fragments are relevant. The SDK must therefore support mission-bound retrieval so that a worker can receive the right current mission context and avoid pulling unrelated system-wide data. This is critical both for relevance and for security.

The third retrieval requirement is manifest-aware retrieval. Because the architecture uses centrally governed permission and runtime policy bundles, the SDK must participate in the interpretation of those bundles during retrieval. If a worker is active for one class of operation but not another, or if certain capabilities are currently inactive, the retrieval path should reflect that. The SDK should not be a thin “fetch anything” client. It should be a governed retrieval layer.

The fourth retrieval requirement is bounded initial context retrieval. The worker should be able to load the minimum required context to begin useful work without requiring full project or mission memory immediately. This supports the progressive disclosure principle already embedded in the master architecture. The SDK should therefore expose a clean path for root-level or orienting context retrieval, distinct from deeper memory-fragment retrieval.

The fifth retrieval requirement is file and artifact reference retrieval. Some skills or missions may depend on centrally stored files, templates, or generated artifacts. The SDK should support retrieving the references or signed access pathways needed for the runtime to use those assets safely. It should not require each app or service to invent separate storage-resolution logic.

The sixth retrieval requirement is shared semantic consistency. If the worker runtime, communication gateway, and command centre all rely on central mission or skill semantics, the retrieval package should support those semantics in a reusable way rather than letting each app guess at them. This is a major reason `linklogic-sdk` is a product requirement rather than a local helper.

The seventh retrieval requirement is graceful handling of absence or denial. Sometimes a requested skill is inactive. Sometimes a memory fragment is out of scope. Sometimes the worker’s current policy state does not permit retrieval. The SDK must support these cases clearly. It should not force consumers into ambiguous behavior when governed retrieval fails or is denied.

Finally, retrieval behavior must remain explicit and observable. The product should not hide the fact that retrieval is happening or make it impossible to understand which central sources are being consulted. This matters for debugging and for trust in runtime behavior. The SDK should therefore be designed as a clear operational contract, not as a magical black box.

## **8.2 Enforcement Requirements**

Retrieval by itself is not sufficient for the LiNKtrend architecture. If the SDK simply provides convenient access to central records without applying the product’s runtime discipline, then the system quickly drifts toward over-permissive workers and incoherent local behavior. The LiNKlogic SDK must therefore include enforcement-oriented product requirements alongside retrieval requirements.

The first enforcement requirement is permission-bound behavior. When a worker asks for a skill, memory fragment, tool reference, or related operational resource, the SDK must support the product in determining whether that worker is actually allowed to access it in its current state. This means that retrieval requests should not be treated as neutral data lookups. They should be treated as governed access attempts mediated by current central policy.

The second requirement is mission-scope enforcement. Even if a worker is valid and active, it should not retrieve arbitrary mission context or arbitrary centralized memory outside the relevant current mission boundary. The SDK must therefore support mission-aware filtering and scoping in a way that is reusable and difficult to bypass casually through convenience code. This preserves both relevance and compartmentalization.

The third requirement is manifest-state enforcement. The architecture depends on the worker remaining centrally governed over time, not just at startup. The SDK should therefore be capable of interpreting or consuming current manifest state so that retrieval and runtime access remain aligned with central authorization. If the manifest is inactive or no longer valid, the SDK should support the broader runtime in moving toward denial, restriction, or shutdown rather than permissive continuation.

The fourth requirement is current-version enforcement for skills and approved tools. The worker should not be allowed to treat historical or deprecated versions as equally acceptable merely because they exist centrally. The SDK must help resolve what is current and approved, and must make it easy for the runtime to avoid stale or inactive versions unless there is an explicit architecture-approved reason to inspect history.

The fifth requirement is controlled fallback behavior. There will be cases where retrieval fails because the system is unavailable, the requested entity does not exist, or authorization cannot be confirmed. The SDK must not encourage unsafe fallback habits such as “use whatever local copy exists and continue.” Instead, it should support the architecture’s broader fail-closed posture by making retrieval failure and authorization failure explicit and actionable.

The sixth requirement is environment-aware enforcement behavior. The product may permit some differences in diagnostics or verbosity across local development, staging, and production, but the SDK should not invert the architecture’s core governance model depending on environment. The worker should remain a governed participant in every environment, even if development is slightly more inspectable.

The seventh requirement is observability of enforcement outcomes. The monorepo product should make it possible to know when enforcement permitted retrieval, denied retrieval, or encountered ambiguity. This does not mean every consumer needs a huge audit report, but it does mean the SDK should support structured signaling or trace emission around enforcement-relevant behavior.

Finally, enforcement must remain bounded to the SDK’s role. The package should not become the owner of all security policy in the system. It should provide the reusable runtime enforcement layer that apps and runtimes rely on, while central truth about identity, permissions, and manifests still belongs to LiNKaios-governed data. This distinction keeps the product clean.

## **8.3 Skill Resolution Requirements**

Skill resolution is one of the defining behaviors of the LiNKlogic SDK because the architecture depends on workers consuming centrally governed skills rather than file-based local prompt libraries. The monorepo product must therefore specify clearly how the SDK should support skill resolution as a first-class runtime capability.

The first requirement is that the SDK must resolve skills by stable identity, not by informal text matching. A skill should be a governed entity with a stable central identity and versioning structure. The SDK should make it possible for a worker or runtime consumer to request a skill in a way that leads to unambiguous central resolution.

The second requirement is current-version resolution. Where a skill has multiple versions, the SDK must be able to determine which version is currently active and appropriate for runtime use. It should not require each consuming app or service to independently decide what “current” means. This helps keep the product coherent and prevents stale skill drift.

The third requirement is metadata-aware resolution. Skill retrieval is not just about body text. The runtime may need metadata such as applicable role, mission phase, success criteria, dependency hints, approved tool references, or model-capability preferences. The SDK should therefore return or expose both the skill content and the structured metadata needed for the runtime to use it correctly.

The fourth requirement is access-aware resolution. A skill should not be treated as globally available simply because it exists. The SDK should support checks or filters that reflect whether the current worker, mission, or manifest context is allowed to retrieve and use that skill.

The fifth requirement is historical inspection support without normalizing runtime use of historical versions. The system may at times need to inspect previous versions for audit or review, but the runtime path should still strongly prefer the current approved version by default. The SDK should make this separation explicit.

The sixth requirement is content-shape consistency. Since skills are a core architectural asset, the SDK should expose them in a consistent runtime-ready structure rather than requiring each consumer to reinterpret raw database fields. This improves developer experience and reduces accidental misuse.

The seventh requirement is support for future evolution. The system may later expand skill taxonomy, metadata richness, or category logic. The SDK should be structured so that adding such fields or distinctions does not force a complete redesign of the skill-resolution interface.

## **8.4 Tool Resolution Requirements**

The architecture deliberately separates skills from tools, which means the LiNKlogic SDK must support tool resolution as a distinct product requirement. Tool resolution is the process by which a centrally governed skill reference to an executable capability becomes a controlled runtime-available tool package or module.

The first requirement is that the SDK must support reference-based tool resolution. A skill should refer to an approved tool by identity or metadata, and the SDK should help the runtime interpret what that reference means rather than forcing the worker to guess or improvise. This preserves the product’s distinction between method and executable capability.

The second requirement is approved-version resolution. If multiple versions of a tool exist, the runtime needs a clear way to know which one is approved for current use. The SDK should therefore expose tool metadata in a way that supports deterministic resolution rather than ad hoc tool selection.

The third requirement is package-verification support. Because the product avoids arbitrary database code execution as the normal pattern, tool resolution should include support for identifying and verifying the approved executable package or module that the runtime side should use. The SDK does not need to perform every low-level package-management act itself, but it should expose the information and contract needed for that process.

The fourth requirement is access and scope awareness. A worker should not necessarily be allowed to invoke every approved tool merely because the tools exist. The SDK should support the runtime in determining which tools are valid for the current mission, skill, and permission context.

The fifth requirement is separation from execution itself. The SDK should resolve and interpret tool availability, not become the place where tool internals are embedded or where full execution logic becomes entangled with retrieval logic. This keeps the product layered correctly.

The sixth requirement is fallback discipline. If a referenced tool is inactive, unavailable, or not authorized, the SDK should not encourage silent substitution with arbitrary alternatives. It should make failure or denial explicit so that the architecture remains governable.

The seventh requirement is observability support. Tool resolution should be traceable enough that the system can later answer which approved tool identity and version were made available to the worker under a given mission and skill context.

## **8.5 Memory Retrieval and Progressive Disclosure Requirements**

Because LiNKbrain is one of the central assets of the architecture, the LiNKlogic SDK must support memory retrieval in a way that preserves the product’s progressive disclosure model. The product should not reduce memory retrieval to “load as much history as possible,” nor should it make memory so inaccessible that workers cannot use centralized context effectively.

The first requirement is root-level orientation retrieval. The SDK must support an initial retrieval path that gives the worker enough mission or project orientation to know what kind of context exists and what broad facts are relevant without loading an overwhelming volume of detail. This is the first stage of progressive disclosure.

The second requirement is selective deeper retrieval. Once the worker identifies a need for specific detail, the SDK must support retrieval of narrower memory fragments, summaries, or durable facts that are relevant to the current mission and question. This retrieval should be scoped and should not collapse into “query the whole memory space” behavior.

The third requirement is hybrid retrieval support. Because the architecture combines structured and semantic memory access, the SDK should support both relational filtering and semantic retrieval pathways where appropriate. It does not need to expose raw low-level vector mechanics directly to every consumer, but it must make the memory system practically usable.

The fourth requirement is mission-bound filtering. The SDK should help ensure that memory retrieval respects current mission or context boundaries. A worker asking about one mission should not accidentally receive memory from an unrelated mission simply because the wording appears somewhat similar.

The fifth requirement is retrieval-shape consistency. Memory results should come back in predictable structures so that runtime consumers do not each invent their own interpretation of what a memory fragment is. This matters for both code quality and system understanding.

The sixth requirement is support for future memory enrichment. Over time, LiNKbrain may hold richer forms of summaries, lessons learned, promoted durable facts, and other memory types. The SDK should be designed so these can be introduced without breaking the core retrieval model.

## **8.6 Runtime Caching Rules**

The LiNKtrend architecture allows short-lived runtime caching in memory where it improves efficiency and does not compromise the distinction between central truth and worker-local temporary state. The LiNKlogic SDK and runtime integration therefore need clear rules for caching behavior.

The first rule is that cached data is not source of truth. Any policy, mission context, skill metadata, or memory data held in runtime cache remains a temporary convenience copy. The central system remains authoritative. The product must preserve this distinction strongly.

The second rule is that caching should be in-memory where practical. The architecture has already clarified that “in memory” means RAM, not a password-protected folder treated as pseudo-memory. The product should therefore prefer runtime memory caching over casual local disk persistence.

The third rule is that cached data should be short-lived and purpose-bound. A worker may cache policy or context so that it does not need to query the central system every few seconds, but that cache should be bounded to the current runtime session and current authorized context. It should not become a hidden local archive of centrally governed material.

The fourth rule is that cache invalidation must defer to central authority. If central manifest status changes, skill versions change, or mission context is invalidated, the worker should not continue indefinitely based on stale cache. The runtime should have clear ways to refresh or discard cached state when central validity requires it.

The fifth rule is that cache behavior should respect environment posture. Development may tolerate somewhat more diagnostic visibility, but production should remain strict about temporary state and should not encourage cache sprawl.

The sixth rule is that observability should include meaningful cache-relevant signaling where useful. This does not require noisy logging of every cache hit, but the product should be able to diagnose major caching-related failures or stale-state issues if they occur.

Together, these rules ensure that caching improves practical runtime efficiency without undermining the architecture’s core principle that central truth remains central.

# **9\. Product Requirements for PRISM-Defender**

## **9.1 Product Purpose and Scope**

`prism-defender` is the monorepo product component responsible for local residue reduction, cleanup discipline, and support for containment-oriented shutdown behavior on worker environments. Its purpose is not to replace the central security model, not to become the owner of worker authorization policy, and not to act as a magical invisibility shield. Its purpose is much narrower and much more practical: to reduce the amount of sensitive or high-value temporary material that remains on worker nodes after use, to help enforce the architecture’s best-effort ephemeral handling posture, and to support fail-closed behavior when the worker should no longer remain active.

This purpose matters because the broader architecture deliberately recognizes that worker nodes are higher-risk environments than the central control plane and central storage layers. During active execution, a worker may temporarily hold skill-derived context, mission-bound working material, tool outputs, transient logs, temporary files, or session-bound credentials. The architecture has already rejected two bad extremes: pretending that no such local state will ever exist, and accepting uncontrolled local persistence as a routine byproduct of execution. `prism-defender` is the practical component that helps the system live in the disciplined middle ground.

The scope of `prism-defender` is therefore local and bounded. It should monitor the local runtime conditions that are relevant to cleanup and containment, understand which temporary areas or residue classes fall under its responsibility, and participate in worker shutdown or cleanup flows according to centrally aligned rules. It should not become a second command centre, a second mission system, or a generic security suite that attempts to absorb every product concern. If its scope becomes too broad, it will either become unmaintainable or begin to collide with responsibilities that belong to LiNKaios, LiNKlogic, or the worker runtime itself.

Within the monorepo, `prism-defender` must be treated as a real product component, not as a loose collection of cleanup scripts. This is important because cleanup and containment often get neglected when they are implemented informally. By making PRISM a first-class app inside the monorepo, the architecture ensures that it receives explicit requirements, explicit observability, explicit deployment consideration, and explicit scope boundaries. That makes it more likely to remain aligned with the system instead of becoming an afterthought.

The scope of `prism-defender` includes:

- monitoring controlled temporary worker-side locations and relevant local runtime conditions,  
- participating in cleanup after successful central persistence or when temporary artifacts are no longer needed,  
- supporting fail-closed and controlled shutdown behavior when the central system or runtime conditions require it,  
- emitting useful signals about its own actions and failures,  
- behaving differently by environment when appropriate, while preserving the architecture’s core security posture.

Its scope does not include:

- owning central identity or mission authority,  
- defining which workers are active in principle,  
- defining the system of record for memory or traces,  
- becoming the main owner of secrets,  
- replacing runtime retrieval and enforcement logic,  
- or absorbing large unrelated operational automation concerns.

A final part of its scope is realism. `prism-defender` must be designed to provide real value without overclaiming. The product should not imply that the existence of a cleanup sidecar means nothing sensitive can ever exist on a worker node or that no privileged observer could ever inspect runtime state. Instead, it should state and deliver what is actually valuable: shorter local retention windows, less accidental worker-side accumulation, more systematic cleanup, and more reliable transition from active execution back toward a lean worker state. In the context of the current LiNKtrend build, that is already a highly worthwhile product outcome.

## **9.2 Cleanup and Residue-Reduction Requirements**

The most immediate and visible product responsibility of `prism-defender` is cleanup and residue reduction. The architecture already established that workers may need temporary runtime state during real execution, but that this temporary state should not quietly harden into a long-lived local archive of the organization’s prompts, methods, traces, or outputs. `prism-defender` is the product component that operationalizes that principle.

The first cleanup requirement is explicit target scope. PRISM must know which categories of local residue it is responsible for monitoring and reducing. These may include controlled temporary directories, runtime-generated intermediate files, persisted temporary payloads associated with approved tool execution, transient output buffers that have already been successfully transmitted centrally, or other architecture-approved classes of temporary worker-side data. The product should not rely on vague assumptions such as “clean up whatever looks temporary.” It should define a deliberate target set.

The second requirement is cleanup timing discipline. Cleanup should occur when the architecture says it is safe and appropriate, not simply whenever the local component happens to feel idle. In practice, this means PRISM should support cleanup after the worker runtime or related service confirms that meaningful outputs have been persisted centrally, or when a task/session ends and temporary material is no longer needed. This preserves the correct sequence: use locally only as long as needed, persist centrally what matters, then reduce local leftovers.

The third requirement is bounded cleanup behavior. PRISM should be able to act aggressively enough to reduce meaningful residue, but not so blindly that it destroys the system’s ability to function or erases operationally necessary data before that data has reached the central system. This means cleanup rules must be specific and architecture-aware, not indiscriminate. Cleanup is not the same thing as deleting everything in sight.

The fourth requirement is support for both file-system residue and process-adjacent temporary artifacts where practical. The architecture already prefers RAM over disk for temporary sensitive state where possible, but some controlled temporary file use may still occur. PRISM should help enforce the product’s rules around those locations. At the same time, it should not claim impossible reach into every form of runtime state. The product must remain honest about what cleanup can and cannot do.

The fifth requirement is repeatable operation. Cleanup should not be a one-time convenience action. It should be part of the normal operating rhythm of worker execution. If a worker repeatedly uses centrally retrieved skills and approved tools across multiple tasks, PRISM should repeatedly reduce unnecessary local leftovers rather than allowing them to accumulate until some manual intervention occurs. This repeatability is one of the reasons PRISM is a product component rather than a manual process.

The sixth requirement is observability on cleanup outcomes. When cleanup succeeds, fails, skips, or encounters ambiguity, the system should be able to know. This does not mean every deletion event needs a giant central trace, but it does mean PRISM should surface enough signals that the operator can trust that cleanup is actually happening and can investigate if it is not. Cleanup without observability is difficult to verify and therefore easy to neglect.

The seventh requirement is support for architecture-aligned minimal persistence. PRISM should reinforce the overall product strategy that the worker should return as closely as practical to a lean execution state after completing work. That means the product should favor leaving behind little more than what is strictly necessary for continued controlled operation.

The eighth requirement is compatibility with approved tool behavior. Since approved tools may need controlled working files or runtime directories, PRISM must be able to coexist with those tools rather than treating all non-empty temp paths as inherently invalid. The correct design is not blanket hostility to runtime execution, but disciplined post-use cleanup consistent with the approved tool model.

Together, these requirements define a clear product standard: PRISM must materially reduce worker-local accumulation of temporary operational residue in a controlled, repeatable, observable way.

## **9.3 Shutdown and Containment Requirements**

Beyond ordinary cleanup, `prism-defender` must also support shutdown and containment behavior when the worker should no longer continue normal operation. This is one of the major ways in which PRISM contributes to the architecture’s fail-closed posture. It is not the authority that decides system-wide status, but it is a key part of the local mechanism through which that authority becomes operationally real.

The first shutdown requirement is support for centrally initiated stop conditions. If the central system marks a worker inactive, revokes a relevant manifest, invalidates a mission relationship that should end current runtime activity, or otherwise indicates that the worker should stop, PRISM should participate in the resulting local shutdown flow. It should not make independent sovereignty decisions, but it should help turn central decisions into local cleanup and controlled termination behavior.

The second requirement is support for prolonged loss-of-validation containment. The architecture already rejects permissive continuation when central validation has been absent for too long. If the worker cannot confirm its continued valid relationship to the central system beyond the allowed threshold, PRISM should help support the move toward shutdown or restricted state. This makes the system more robust against silent drift into unauthorized continuation.

The third requirement is graceful-shutdown support where practical. Not every shutdown condition requires immediate hard termination. In many cases, the architecture benefits from a controlled sequence in which new work stops, important final outputs are given a chance to persist centrally, temporary state is cleaned, and then the worker exits. PRISM should be able to participate in that controlled process rather than being useful only in sudden emergency termination scenarios.

The fourth requirement is compatibility with forced termination paths. There may still be cases where the architecture determines that rapid stop is more important than graceful persistence of every in-flight convenience. PRISM should therefore also support a stronger containment posture when needed. The exact severity logic belongs to the broader system design, but the product must not assume only one kind of shutdown exists.

The fifth requirement is local-state reduction during or after shutdown. A shutdown that stops the process but leaves behind high-value temporary residue has only partially satisfied the architecture’s goals. PRISM should therefore treat shutdown as a key cleanup moment, reducing temporary traces and artifacts as far as the allowed sequence and local conditions make practical.

The sixth requirement is status-aware signaling. If shutdown or containment occurs, the broader observability system should be able to understand that it happened. This is important for operator trust and later debugging. PRISM does not need to produce verbose narrative reports every time it acts, but it must provide meaningful indication of what type of local defensive action occurred.

The seventh requirement is environment-sensitive strictness without architectural betrayal. Development may sometimes tolerate more inspectability or easier local debugging than production. However, even in development, the product should still be able to exercise and validate shutdown and containment flows. The existence of a more permissive dev posture should not become an excuse for never testing the architecture’s core defensive behaviors.

These requirements ensure that PRISM is not merely a janitor. It is also the local operational discipline layer that supports the architecture’s stance that central control must matter in practice, not only on paper.

## **9.4 Observability and Reporting Requirements**

Because `prism-defender` is a system component whose value depends heavily on trust in its behavior, it must include meaningful observability and reporting requirements. A cleanup or containment sidecar that acts silently and opaquely is hard to validate, hard to improve, and easy to ignore. The product must therefore make PRISM observable enough that its role in the system can be understood and governed.

The first requirement is local event visibility. PRISM should emit structured signals or logs when it performs meaningful cleanup, when it encounters a failure to clean, when it observes defined local conditions that matter, or when it enters a containment or shutdown-support path. These signals should integrate into the monorepo’s shared observability model rather than inventing their own unrelated formats.

The second requirement is compatibility with central trace retention where appropriate. Not every local cleanup action requires central durable persistence, but some actions may be important enough to feed into the broader trace or incident view of the system. PRISM should therefore be able to expose events in a way that the rest of the architecture can classify and persist if warranted.

The third requirement is enough detail for diagnosis without encouraging residue sprawl. This is an important balance. The product should not avoid observability in the name of security, nor should it dump large volumes of sensitive local detail into long-lived logs. PRISM should provide enough structured information to show what happened and why, while still aligning with the architecture’s general minimization posture.

The fourth requirement is service-health reporting. The operator should be able to tell, through the dashboard and observability layer, whether PRISM is running, whether it is healthy enough to perform its role, and whether it is repeatedly encountering cleanup problems or unexpected conditions. Since PRISM exists specifically to reduce a known risk area, lack of visibility into PRISM’s own health would weaken confidence in the overall product.

The fifth requirement is alignment with shared observability contracts. PRISM should use the monorepo’s shared observability package and shared types where relevant, especially for worker identity tagging, mission association where applicable, event categories, and status semantics. This ensures that PRISM’s signals can be understood alongside those from `bot-runtime`, `zulip-gateway`, and `linkaios-web`.

The sixth requirement is operator-meaningful surfacing. The product should allow important PRISM-related events to appear in the command centre in ways the founder can understand. For example, repeated cleanup failures, repeated shutdown-trigger events, or other meaningful anomalies should be visible at the dashboard level when they matter operationally. This does not require exposing every low-level detail in the UI, but it does require converting key sidecar behavior into governance-relevant visibility.

The seventh requirement is support for future hardening. As the system matures, PRISM observability may become richer. The current build should therefore avoid designing its signals in a way that would block more detailed future reporting or correlation if needed later.

These requirements make PRISM a trustworthy product component rather than an invisible helper. Observability is part of what turns cleanup and containment from aspiration into enforceable behavior.

## **9.5 Environment-Specific Behavior Requirements**

`prism-defender` must behave with environment awareness because the architecture explicitly distinguishes local development, staging, and production. However, environment-sensitive behavior must not become architectural inconsistency. The product needs a disciplined way to vary strictness and visibility across environments while preserving the same core model.

The first requirement is that production behavior should be the strictest. In production, PRISM should most strongly enforce cleanup discipline, support fail-closed shutdown behavior, and minimize unnecessary worker-side residue. Since production is where the system carries real operational weight, the product should apply its strongest practical posture there.

The second requirement is that staging should be realistic but diagnosable. In staging, PRISM should still perform its core functions and should be able to exercise cleanup and containment flows meaningfully, but it may allow somewhat more debugging visibility or slightly less aggressive cleanup timing if that materially helps validate the architecture. The key is that staging should test reality, not bypass it.

The third requirement is that local development may be more permissive in some respects but must still preserve architecture truth. For example, development may allow easier inspection of temporary behavior or simpler local debugging, but it should not invert the system into a completely residue-agnostic model. Developers still need to see how PRISM fits into the architecture. If development ignores PRISM entirely, the product risks treating local hygiene as something to bolt on later.

The fourth requirement is centralized configuration consistency. PRISM’s environment-sensitive behavior should be driven through the shared configuration model rather than through ad hoc local conditionals scattered across the app. This keeps the product consistent and easier to reason about.

The fifth requirement is clear documentation of behavior differences. If cleanup timing, shutdown strictness, or observability verbosity differs by environment, the product should make those differences understandable. Otherwise the operator or future builder may misinterpret behavior and lose trust in the system.

The sixth requirement is preservation of boundary semantics. Even if development is looser and production stricter, PRISM must remain the cleanup and containment sidecar in every environment. It should not become a completely different class of product depending on where it runs. The architecture depends on role consistency even when operational settings vary.

The seventh requirement is future-ready hardening support. The current environment distinction should leave room for stronger future hardening in production without requiring redesign of the entire PRISM product. This means environment controls should be structured and extensible from the beginning.

Together, these requirements ensure that PRISM remains a realistic, testable, and environment-aware product component that supports the architecture across all stages of the system lifecycle.

# **10\. Product Requirements for Zulip-Gateway**

## **10.1 Product Purpose and Boundaries**

`zulip-gateway` is the communication-service application in the monorepo that converts raw chat activity into mission-aware, architecture-aligned interaction. Its purpose is not to replace LiNKaios, not to become the memory system, and not to become a general-purpose messaging platform. Its role is narrower and highly specific: receive communication events, map them to the correct internal context, enrich them with the metadata the rest of the system needs, and route them into the governed runtime model in a structured way.

This matters because raw messages are not sufficient for a system like LiNKtrend. A line of text by itself does not tell the worker who sent it, which mission it belongs to, what project context should shape interpretation, what recent system state is relevant, or whether the worker is even the right recipient. Without a communication gateway that understands the architecture, the system would either become brittle or force every worker to reconstruct communication context by guesswork. `zulip-gateway` exists to solve that problem in one place.

The product boundary for `zulip-gateway` is therefore clear. It owns:

- communication intake and outbound delivery,  
- mapping communication constructs to internal mission constructs,  
- enrichment of messages with useful architecture-aware metadata,  
- mission-aware routing decisions,  
- reflection of worker presence/status where appropriate,  
- observability around communication-related failures and runtime behavior.

It does not own:

- the central truth of missions,  
- the central truth of identities,  
- the central truth of memory,  
- the central truth of skill definitions,  
- or the global policy model.

This boundary is critical because communication systems often drift into accidental control planes. Once messages become central to operation, there is a strong temptation to start treating the messaging layer as if it were the mission system, the task system, or the memory system. The LiNKtrend architecture explicitly rejects that drift. Communication is a gateway into the governed system, not the system itself.

Another important purpose of `zulip-gateway` is reducing ambiguity for the founder. A solo operator needs communication with the system to feel structured and reliable rather than mysterious. The founder should not have to wonder whether a message reached the right mission context or whether a response came from the right worker state. The gateway should therefore turn communication into something that behaves like part of the platform, not like a detached chat side channel.

The product must also support future evolution without current overreach. In the current build, Zulip is the chosen communication bridge. The gateway should be implemented seriously enough that it can support the current mission-aware system, but it should not become bloated with speculative support for every future communication platform or every future collaboration pattern. Its first job is to be an excellent gateway for the present architecture.

Finally, the gateway must remain a real application. It belongs in `apps/` because it is a deployable service, not just a helper package. Treating it as a first-class app helps preserve its responsibility boundary and makes it easier to operate, monitor, and improve over time.

## **10.2 Mission Mapping Requirements**

Mission mapping is the single most important requirement for `zulip-gateway`. The architecture depends on missions as centrally governed work units, and communication only becomes meaningful inside the system if it can be mapped to those missions correctly. A message without mission context is only partially useful. A message with the wrong mission context can be actively harmful.

The first mission-mapping requirement is that the gateway must be able to associate an incoming message with the correct mission record or mission context. This may happen through topic-to-mission mapping, stream conventions, explicit metadata, or another structured mapping pattern approved by the architecture. The exact technical mechanism may evolve, but the product requirement does not: messages must be mapped to missions deliberately, not implicitly by fragile guesswork.

The second requirement is that mission mapping must be architecture-aware rather than communication-platform-centric. In other words, the gateway should not let external chat structures define mission truth. It should use communication structures as routing hints into centrally governed mission records. This preserves the correct authority relationship: communication references missions; LiNKaios-governed central records define missions.

The third requirement is support for unambiguous mission association where possible and safe fallback where not. Some communication contexts may cleanly map to one mission. Others may require additional rules or may reveal ambiguity. The gateway should support handling such ambiguity explicitly rather than silently routing messages into whichever mission seems vaguely similar. A communication layer that guesses too aggressively undermines operator trust.

The fourth requirement is persistence of mapping logic in a governable way. Mission mapping should not live only as ad hoc runtime assumptions buried inside the gateway code. The system should be able to inspect, manage, or infer the mapping rules through centrally governed data and shared contracts where appropriate. This helps keep the communication model reviewable and maintainable.

The fifth requirement is continuity across time. A mission mapping should remain stable enough that a communication thread or topic continues to correspond to the intended mission context unless explicitly changed. If every new message requires rebuilding mission identity from scratch, the system becomes fragile and loses conversational continuity. The gateway should therefore preserve or consult stable mapping relationships where appropriate.

The sixth requirement is compatibility with future external pathways without prematurely implementing them. Since the broader architecture reserves external or tenant-isolated futures, mission mapping should not be designed in a way that assumes the system will only ever support one informal internal communication style. At the same time, the product should avoid overengineering for external multi-tenant complexity in Version 1\.

The seventh requirement is observability on mapping decisions. When a message is received and associated with a mission, the broader system should be able to understand that association at a meaningful level. This does not require noisy logging of every internal detail, but it does require traceability sufficient to investigate communication-related confusion or failure when needed.

Together, these requirements make the gateway a true mission-aware bridge instead of a thin message pipe.

## **10.3 Message Enrichment and Routing Requirements**

After mission mapping, the next most important responsibility of `zulip-gateway` is message enrichment and routing. A worker should not receive raw chat text stripped of context. The gateway must add the metadata and structure necessary for the message to function as an architecture-aware runtime input.

The first message-enrichment requirement is sender context. The gateway should package enough information about the sender that the receiving system can understand whether the message originated from the founder, another human participant if later relevant, or another system actor. This does not require revealing more than necessary, but it does require that the message not arrive as anonymous text.

The second requirement is mission linkage in the message envelope. Once mission mapping has occurred, that mission association should travel with the message into the rest of the runtime path. This allows the worker and retrieval layers to know which mission context should be used and which memory or skill scope is relevant.

The third requirement is state-aware context where useful. If the architecture maintains a notion of mission state, recent state pointer, or structured conversational continuity, the gateway should be able to include or reference that information in the message payload so that the worker runtime does not have to infer everything from the raw message body.

The fourth requirement is structured message representation. The gateway should not merely forward unstructured platform-native message blobs into the rest of the architecture. It should normalize incoming communication into a consistent internal message shape aligned with shared types and shared contracts. This makes the rest of the product easier to build and more consistent.

The fifth requirement is appropriate routing decisions. Once a message has been enriched, the gateway must route it toward the correct runtime path, worker relationship, or system handling flow. This may include directing it to the right worker context, worker identity, or mission processing path as defined by the architecture. The gateway should not treat all workers as identical recipients.

The sixth requirement is support for outbound structured communication. Communication is not only inbound. Workers or system layers may need to send outputs, updates, or mission-relevant responses back through the gateway into the messaging surface. The product should therefore support outbound shaping in a way that preserves context and keeps the communication environment usable rather than noisy or confusing.

The seventh requirement is boundedness. Even though the gateway enriches messages, it should not become a bloated context-engine that replicates full memory retrieval or skill resolution internally. It should add what is needed for communication to integrate with the architecture, and then let the proper central/runtime layers perform their own jobs.

The eighth requirement is consistency with shared packages. Message shapes, event structures, identity tags, mission references, and observability outputs should all align with the monorepo’s shared contracts rather than becoming bespoke gateway-only structures.

When these requirements are met, `zulip-gateway` becomes a real communication adapter that makes chat interactions operationally meaningful within the system.

## **10.4 Presence and Status Reflection Requirements**

Because communication is one of the most visible operational surfaces in the LiNKtrend system, `zulip-gateway` should support presence and status reflection where that adds useful clarity. However, this support must remain subordinate to central system truth. The gateway can reflect state. It must not invent or authoritatively define it.

The first requirement is that the gateway should be able to reflect worker availability or presence in a way that is useful to the operator. If a worker is active, recently connected, or centrally recognized as available, the communication surface may show that. If a worker is inactive or has been centrally disabled, the communication surface should not imply false availability. This helps communication feel integrated with the real system.

The second requirement is that reflected status must be grounded in central or centrally aligned state. The gateway should not infer “online” merely from a recent message if the worker has actually failed central validation or has been marked inactive. Presence reflection should align with the command-centre model rather than becoming a separate competing reality.

The third requirement is support for mission-contextual communication awareness. Presence may be more meaningful when interpreted relative to mission participation. For example, the operator may need to know not just that a worker exists, but that it is currently associated with the mission underlying the communication context. The gateway should preserve room for this kind of contextual status reflection where helpful.

The fourth requirement is graceful degradation. Communication systems can encounter temporary delays, disconnected worker sessions, or partial visibility. The gateway should therefore avoid overstating certainty when reflection is incomplete. It is better to show a clearly bounded status than to imply perfect real-time omniscience.

The fifth requirement is consistency with the rest of the observability model. Presence/status reflection inside communication should not invent a separate vocabulary for worker state that conflicts with LiNKaios. Shared status semantics matter because the founder should not have to reconcile two different operational truths across surfaces.

The sixth requirement is future extensibility. As the system grows, the communication layer may later support richer indicators or mission-aware worker collaboration cues. The current build does not need to implement all of that, but the product should not hardcode a simplistic status model that makes those future improvements awkward.

These requirements keep status reflection useful but disciplined. The gateway should improve operator understanding, not introduce a second confusing control plane inside chat.

## **10.5 Observability and Failure Handling Requirements**

`zulip-gateway` must also support clear observability and failure handling because communication problems can quickly undermine trust in the whole system. If messages fail to map, fail to route, or fail silently, the operator may experience the system as unreliable even when the core runtime and command-centre components are functioning correctly.

The first observability requirement is structured logging of meaningful communication events. The gateway should emit events for message receipt, mission mapping outcomes, routing actions, failures, retries where relevant, and outbound message delivery attempts. These events should align with the monorepo’s shared observability model so that they can be understood alongside the rest of the system.

The second requirement is failure classification. The gateway should distinguish between different classes of communication problems, such as mapping ambiguity, worker-unavailable routing failure, external platform delivery failure, malformed input, or internal processing error. This classification is valuable because it helps the founder understand whether a problem belongs to communication context, worker availability, or product logic.

The third requirement is traceability of important communication decisions. If a message was associated with a mission and routed to a worker path, the system should be able to reconstruct that at a meaningful level when needed. This supports debugging and trust.

The fourth requirement is graceful handling of ambiguity. If the gateway cannot confidently map a message to a mission or cannot determine the right routing path, it should fail in a controlled and observable way rather than making reckless guesses or silently dropping input. This is especially important in an architecture where mission context matters deeply.

The fifth requirement is compatibility with central operator visibility. Important communication failures or repeated anomalies should be visible through LiNKaios or related central observability surfaces so that the founder does not need to inspect the gateway in isolation to understand that communication is degraded.

The sixth requirement is resilience without architectural overreach. The gateway should be robust enough to handle communication issues sensibly, but it should not try to become a giant orchestration engine in order to compensate for every possible downstream runtime problem. It should remain a bounded communication product surface.

The seventh requirement is environment-aware handling. Local development, staging, and production may differ in verbosity, retry posture, or inspection friendliness, but the product should preserve the same essential communication contracts across environments.

When these requirements are satisfied, `zulip-gateway` becomes a reliable part of the monorepo product rather than a thin and fragile integration point. That is important because in practice, communication is often where the operator first experiences the system’s quality.

# **11\. Data and Storage Requirements**

## **11.1 Database Ownership Requirements**

The monorepo product must treat the central database as the authoritative structured system of record for the current LiNKtrend build. This is not a stylistic preference. It is a product requirement derived directly from the architecture’s commitment to centralized governance, centralized memory, and centrally governed skills. If the monorepo fails to embody this requirement clearly in its data layer, the product will drift toward file-based truth, runtime-local truth, or inconsistent multi-source truth, all of which the architecture explicitly rejects.

The first ownership requirement is that identity records belong centrally. The monorepo must implement the data-access and product logic needed to ensure that worker identities, lifecycle states, status markers, current role metadata, and related identity-linked records are treated as centrally owned data. Worker runtimes may consume identity state. They do not own it. The database-backed central system remains the authority.

The second requirement is that mission records belong centrally. The monorepo must implement mission-related data in a way that makes missions first-class central entities. This means mission identity, mission state, mission-worker relationships, mission-linked artifacts, and mission-relevant trace references must be stored and accessed as central records rather than being inferred informally from chat or local runtime assumptions. The product should reinforce that missions are not side effects. They are governed work objects.

The third requirement is that manifests and permissions belong centrally. Authorization state should not be distributed through ad hoc worker-local config files or hidden runtime defaults. The database-backed control plane must remain the place where the current system understands who is active, what manifest applies, what permissions exist, and what policy bundle is current. The monorepo’s data model and data-access patterns must therefore make these records central and explicit.

The fourth requirement is that skills and skill versions belong centrally. Because one of the most important product corrections is the move away from file-based worker-local skill truth, the monorepo must ensure that skill records, version states, metadata, and relationships to approved tools are centrally persisted and centrally resolved. Skill definitions must not become the accidental property of individual worker machines or app-local private stores.

The fifth requirement is that memory belongs centrally. LiNKbrain is a central architectural pillar, so the monorepo product must encode that by treating memory records, durable facts, mission summaries, knowledge fragments, and trace-derived retained knowledge as database-backed entities under central ownership. Workers may retrieve memory. They do not define the durable memory layer.

The sixth requirement is that trace and audit-worthy records belong centrally once classified for retention. The product should not treat worker-local logs as the valid long-term trace store. If something matters enough to retain, it should be persisted as part of the central system rather than left to survive accidentally on a worker node.

The seventh requirement is that file references and storage metadata belong centrally even when the file object itself lives in object storage. The database should know what the file is, how it relates to a mission or skill, and what its governance-relevant meaning is. The storage bucket stores the file. The central data model stores the file’s identity and role.

The eighth requirement is clear ownership boundaries between central records and runtime-temporary state. The product must enforce the distinction that worker RAM or controlled temp paths may hold temporary copies of data for execution, but those copies are not ownership. Central persistence remains ownership. This principle should be reflected both in code structure and in product behavior.

The ninth requirement is consistency of interpretation across the monorepo. Whether `linkaios-web`, `zulip-gateway`, `bot-runtime`, or `prism-defender` is interacting with central records, the same central data ownership model must remain true. No app should quietly create its own shadow ownership model because it happens to interact with the same data frequently.

The tenth requirement is future-safe multi-domain structure. Since the founder has explicitly chosen one Supabase project with multiple schemas or domains, the monorepo product must respect those boundaries and not flatten all central data into one undifferentiated mass. Central ownership does not mean conceptual chaos. It means governed data domains inside one official system of record.

## **11.2 Schema Domain Requirements**

The monorepo product must be designed around clear schema or data-domain boundaries within the reused Supabase project. This is important because the founder has chosen to reuse one project while separating concerns through schemas or structured domains rather than through many separate projects. The product must therefore implement that choice deliberately rather than letting the database become a crowded undifferentiated namespace.

The first schema-domain requirement is a governance-oriented data domain. This domain should contain the records that make LiNKaios a real control plane: identities, status states, manifests, permission records, central settings relevant to governance, mission state records, and other control-plane entities. Whether the exact schema naming follows previous conceptual names or a refined final naming convention, the product must preserve the distinction that some data exists primarily to govern the system.

The second requirement is a skills-oriented domain. The product must support a clear location for skill definitions, skill metadata, skill versions, approved tool references, and related operational-method records. This does not mean the skills domain becomes a generic dumping ground for arbitrary content. It means the skill layer has a dedicated place in the database model that reflects its importance and its separateness from worker-local execution.

The third requirement is a memory-oriented domain. The product must support a data domain for LiNKbrain-related records such as mission memory, durable facts, summaries, retrieval-ready fragments, and other centrally stored memory constructs. Because memory retrieval may combine relational filtering and semantic search, the product should also support whatever structural additions are needed for that use without obscuring the conceptual ownership of memory as its own domain.

The fourth requirement is a trace/audit-aware design. Trace-related central records may live inside a memory domain, a governance domain, or a dedicated trace-oriented structure depending on final schema organization, but the product must be explicit about where durable trace truth belongs. The architecture should not leave this to ad hoc implementation improvisation.

The fifth requirement is semantic clarity in naming. Schema and table naming should make the product easier to understand, not harder. Builders should be able to look at the data model and see that certain entities belong to governance, certain entities belong to skills, and certain entities belong to memory. This is especially valuable in an AI-assisted build environment because semantic names improve implementation guidance.

The sixth requirement is relationship support across domains. Even though schemas or domains separate concerns, the product must still support meaningful relationships across them. Missions may link to skills, identities may link to manifests, traces may link to missions, files may link to both missions and skills, and memory may link to mission history. Clear schema separation should improve comprehension, not block relational coherence.

The seventh requirement is version-friendly structure. Since both skills and potentially certain policy or configuration entities need version semantics, the schema design should support current-versus-historical distinction cleanly. This helps the product maintain auditability and operational confidence.

The eighth requirement is bootstrap clarity. Because the system begins with a one-time central bootstrap reset, the schema domains must be created intentionally from the start. The monorepo should not rely on emergent naming after ad hoc migrations have already blurred the structure. Initial schema setup is part of the product, not a hidden implementation afterthought.

The ninth requirement is future growth without current clutter. The product should reserve the ability to add future domains or richer structures later, but it should not create empty speculative schema domains that serve no present purpose. Current schema design should reflect current architectural needs with room for controlled extension.

The tenth requirement is package alignment. The shared `db` package and other data-access layers should understand and preserve these schema boundaries. They should not flatten the conceptual model into generic “database access” abstractions that erase the meaning of the domains they are accessing.

## **11.3 File Storage Requirements**

The monorepo product must implement a clear file-storage model based on centrally governed object storage rather than worker-local file ownership. In the current architecture, that means using Supabase Storage buckets as the object-storage layer. The product must treat these buckets as part of the central platform and must not allow file handling to regress into casual local-machine persistence.

The first file-storage requirement is that durable files must live centrally. Documents, templates, generated artifacts, uploaded files, images, PDFs, spreadsheets, and other file-like assets that need to survive beyond immediate execution must be stored in Supabase Storage rather than treated as durable worker-local files. This preserves central ownership and reduces dependence on any specific runtime environment.

The second requirement is metadata-backed storage. Files should not be treated as invisible objects whose meaning is understood only by humans or inferred from filenames. The product must support central metadata linking files to missions, skills, identities, or trace contexts as relevant. File storage and file meaning must therefore remain connected through the database-backed system of record.

The third requirement is mission-aware file use. Where a file belongs to a mission, the product should preserve that relationship cleanly. A mission may have supporting attachments, generated artifacts, or working references. The product should make those relationships queryable and visible through the command centre and runtime flows where appropriate.

The fourth requirement is skill-aware asset handling. Some skills may depend on templates, static assets, or reusable file-based resources. Those files should be centrally stored and centrally referenced, not bundled casually into worker-local runtime folders as if they were permanent private property of one runtime.

The fifth requirement is controlled runtime retrieval. Workers may need temporary access to files during execution, but the product must support that through governed retrieval rather than through hardcoded local paths assumed to exist forever. Temporary retrieval should not change the durable ownership of the file.

The sixth requirement is clear bucket strategy. The product should define or support a bucket organization that makes sense for current use cases, such as mission artifacts, skill assets, templates, or other relevant categories. The exact bucket breakdown may be modest in Version 1, but it should not be random or opaque.

The seventh requirement is observability and trace linkage where relevant. When files are important enough to appear in mission or trace context, the system should be able to reflect that. The product should not allow important generated artifacts to disappear into storage with no meaningful connection to the system’s central records.

The eighth requirement is future-safe expansion. Today’s file storage may be relatively simple, but the product should remain compatible with future richer asset libraries, larger mission-document sets, or additional controlled file classes. Good initial structure matters here.

## **11.4 Skill Storage Requirements**

Since one of the most important architectural corrections is the move away from worker-local file-based skills toward centrally governed skill storage, the monorepo product must define skill storage requirements with exceptional clarity. If the product is weak here, the system risks falling back into exactly the pattern it is meant to replace.

The first skill-storage requirement is centrality. Skill definitions must be stored centrally in the database-backed system, not treated as the permanent contents of a worker-local `/skills` folder. The monorepo product should encode this assumption in its data model, runtime retrieval flows, and dashboard behavior.

The second requirement is versioned storage. A skill is not just a body of text. It is a governed asset that evolves over time. The product must therefore support storing multiple versions of a skill in a way that clearly distinguishes current approved versions from historical or superseded versions. Version identity should be explicit, not inferred from ad hoc naming conventions.

The third requirement is metadata-rich storage. Skills should include structured metadata such as name, description, applicable context, success criteria, approved tool references, dependency references, capability-class hints, or other governance-relevant attributes. The product must store and expose these fields in a first-class way rather than reducing skills to opaque text blobs.

The fourth requirement is retrievability. Storing skills centrally is only useful if the product can retrieve them efficiently and correctly. This means the data model must support querying by identity, current status, role relevance, mission phase, or other relevant dimensions used by LiNKlogic and the command centre.

The fifth requirement is inspectability. Because skills are part of the organization’s central logic layer, the product must allow them to be reviewed through LiNKaios. This means the storage model should support clean display and interpretation, not just backend retrieval.

The sixth requirement is relationship support to approved tools and related assets. A skill may refer to approved tool capabilities and to stored assets or templates. The product must be able to persist these relationships in a way that supports runtime resolution later.

The seventh requirement is avoidance of arbitrary executable code normalization. Even if some migration-era materials once mixed prompts and scripts together, the product should now clearly store skill method separately from governed executable tool packaging. The skill storage model must reinforce that distinction.

The eighth requirement is migration compatibility. Since the founder already has prior ideas and possibly prior skill materials, the product should be able to ingest those into the new governed format where appropriate. However, that migration should map them into the proper central structure rather than preserving old file-first habits in disguise.

## **11.5 Memory Storage Requirements**

The monorepo product must also implement the central memory model in a way that preserves both usability and governance. LiNKbrain is not a decorative concept. It is one of the core reasons the system can improve over time, survive worker replacement, and avoid collapsing back into pure chat-session memory.

The first memory-storage requirement is that memory must be centrally persisted. Durable facts, mission summaries, retrieval-ready fragments, structured context, and trace-derived retained knowledge must live in the central data layer, not primarily in worker-local state. This is one of the architecture’s main commitments.

The second requirement is mission linkage. Memory records should be connectable to mission identity where relevant. If the system cannot relate memory to missions, projects, or other meaningful contexts, retrieval becomes weaker and auditability suffers.

The third requirement is support for multiple memory forms. Not all memory is the same. Some records may be root-level contextual summaries, some may be fine-grained knowledge fragments, some may be durable facts, and some may be trace-derived summaries. The product should be structured to support this diversity without flattening everything into one undifferentiated text table.

The fourth requirement is hybrid retrieval support. The storage model must be compatible with both structured filtering and semantic retrieval where appropriate. This means the product’s data design should support both relational metadata and semantic-access mechanisms without confusing their roles.

The fifth requirement is lifecycle-aware memory. Some memory may be current and highly relevant, some may be historical, some may be superseded but still worth retaining for traceability. The product should make room for these distinctions rather than treating all stored memory as equally current forever.

The sixth requirement is inspectability through the dashboard. Just as skills must be visible centrally, memory must be visible enough that the operator can understand what the system knows and how it relates to missions. The storage model should support that product need.

The seventh requirement is disciplined promotion of retained knowledge. The product should support the idea that not every runtime trace becomes memory automatically. There must be a path by which important outputs or trace insights become durable memory while noise does not overwhelm the system.

The eighth requirement is future expandability. Memory richness will likely grow over time. The storage model should support that growth without forcing a complete redesign of the current monorepo data-access layer.

## **11.6 Trace and Audit Storage Requirements**

The LiNKtrend architecture depends on traceability and auditability, which means the monorepo product must implement clear storage requirements for meaningful traces and audit records. Without these, the system would be harder to trust, harder to debug, and harder to improve.

The first trace-storage requirement is central retention of meaningful traces. If a runtime event is important enough to matter for mission continuity, debugging, governance, or learning, it should be persisted centrally rather than left as a worker-local accident. The monorepo must implement the pathways that make this possible.

The second requirement is identity and mission linkage. Trace records should be tied to the worker identity and mission context that produced them. This is what turns traces into audit-ready records rather than generic log fragments.

The third requirement is selective retention. The product should not turn every transient event into a permanent trace record. It must distinguish between ephemeral live coordination and durable trace-worthy information. This distinction should be reflected in data modeling and storage pathways.

The fourth requirement is support for observability and dashboard views. Trace records must be structured enough that LiNKaios can surface them meaningfully. The product should not store traces in a way that makes them durable but practically unusable.

The fifth requirement is support for future analysis and refinement. Trace storage is not only for looking backward in emergencies. It is also for identifying repeated failures, weak skills, problematic tool versions, or inefficient mission flows. The storage model should keep that future value in mind.

The sixth requirement is compatibility with cleanup principles. Durable central trace retention is the valid replacement for accidental worker-local persistence. The product should reinforce this by ensuring that traces worth keeping have a central home, while local residues remain temporary and reducible.

The seventh requirement is schema clarity. Trace records should live in a part of the data model where their purpose remains understandable, whether that is through a dedicated trace-oriented structure or a clearly bounded subdomain in a broader memory/audit domain. The architecture should not leave durable trace ownership semantically vague.

These requirements together ensure that the monorepo product supports central truth not only for current state, but also for remembered history.

# **12\. Security, Secrets, and Runtime Safety Requirements**

## **12.1 Security Goals for the Monorepo Product**

The monorepo product must implement a security posture that is realistic, centrally governed, and aligned with the architecture’s core principles. Security in this context is not a separate “module” added at the end. It is a cross-cutting product requirement that affects how apps are structured, how workers authenticate, how secrets are handled, how temporary runtime state is treated, how tools are resolved, and how observability is retained. The monorepo does not need to achieve perfect future-state hardening in Version 1, but it must implement the current build’s security model seriously enough that the system behaves like a governed platform rather than a convenience prototype.

The first security goal is central authority over identity, access, and control. The monorepo product must ensure that the central system remains the owner of worker status, manifest authority, mission-linked access, skill access, and other control-plane truths. This means no app in the monorepo should quietly redefine worker authority locally, and no runtime should rely on permissive fallback patterns that continue operation in the absence of valid central state. Central governance must be a real product property.

The second goal is reduced worker-node exposure. The architecture already recognizes that workers are higher-risk execution environments than the central control plane and central storage layers. The monorepo product must therefore implement best-effort ephemeral handling, cleanup support, and bounded runtime state so that the worker side of the platform does not quietly become a second long-term store of prompts, skills, traces, or secrets. This does not mean the product can prevent all momentary local exposure. It means the product must actively reduce avoidable local persistence.

The third goal is disciplined secret handling. The monorepo must never normalize the idea that secrets should be broadly copied into local worker files or long-lived environment sprawl simply because doing so is convenient. Instead, it must support the locked-in centralized and tiered secret model. This requires real product pathways for secret retrieval, temporary usage, and revocation-aware operation.

The fourth goal is runtime safety. The monorepo must support governed runtime behavior, which means workers should retrieve only what they are allowed to retrieve, resolve only approved tools, and continue operating only while their authorization remains valid. Runtime safety is the practical layer where central security assumptions become real.

The fifth goal is meaningful auditability. A secure system that cannot later explain what happened is only partially secure. The product must therefore preserve enough observability and traceability that central operators can understand important worker behavior, authorization changes, failures, and cleanup-related events.

The sixth goal is realistic documentation and claims. The monorepo product should not be built around magical assumptions such as “RAM means impossible to inspect” or “cleanup means no one could ever observe anything.” Instead, the product should be built around what can genuinely be enforced: central control, temporary local handling, cleanup, bounded capability resolution, and central retention of durable truth.

The seventh goal is future hardening compatibility. The current build must remain compatible with future stronger security controls such as richer attestation, stronger isolation, or more advanced anomaly handling. That does not mean those controls all belong in Version 1\. It means the monorepo should avoid architectural shortcuts that make later hardening awkward or structurally incompatible.

In summary, the monorepo product’s security goals are to centralize control, reduce avoidable worker exposure, handle secrets correctly, enforce runtime discipline, preserve auditability, remain honest about protection limits, and keep the path open for later stronger hardening.

## **12.2 Secret Management Requirements**

The monorepo product must implement secret handling according to the centrally governed, tiered model already locked into the architecture. This means secrets are not treated as casual app-local environment trivia or as values copied permanently into worker nodes because it is expedient. They are treated as centrally managed, selectively exposed, and operationally bounded resources.

The first secret-management requirement is central storage and authority. The monorepo must assume that authoritative secret storage belongs to centrally governed infrastructure, with Supabase Vault and the broader tiered model forming the current product direction. This means applications inside the monorepo should be built to consume centrally managed secrets and secret references rather than inventing their own shadow secret stores. No app should behave as if it is the final owner of platform secrets.

The second requirement is tier-aware handling. The architecture already distinguishes between bootstrap-level access, centrally governed platform/provider secrets, and more task- or domain-specific sensitive credentials. The product must reflect this distinction. The runtime path for a worker establishing its identity should not be the same as the path for a worker receiving narrowly scoped task-specific access. The monorepo should preserve this layered model rather than flattening all secrets into one generic retrieval path.

The third requirement is minimum necessary exposure. A worker or service should receive only the secret access needed for the current authorized operation. This means the product must avoid broad permanent distribution of credentials. If a specific capability or task does not need a secret, it should not receive one. If access is temporary, the product should support that temporariness.

The fourth requirement is RAM-first temporary usage where practical. When workers need secrets for active execution, the product should support temporary in-memory usage rather than encouraging storage in long-lived local files. This aligns with the broader best-effort ephemeral handling posture. If any temporary local material is unavoidable, it should remain controlled, short-lived, and cleanup-compatible.

The fifth requirement is revocation-aware behavior. Secret handling is not only about delivery. It is also about withdrawal. If a central secret is rotated, if a worker is deauthorized, or if a manifest change means a secret should no longer be available, the product must support the correct operational response. It must not assume that “already delivered once” means “safe to keep forever.”

The sixth requirement is shared-package support rather than app-by-app improvisation. Reusable secret-access and auth-related patterns should live in appropriate shared packages such as `auth` and shared configuration layers where relevant. This reduces the chance that each app invents its own inconsistent secret-handling behavior.

The seventh requirement is explicit separation between secret metadata and secret content. The product may store references, permissions, mappings, and secret-governance information in central structured records. That does not mean the product should casually treat secret values the same way as ordinary configuration fields. The architecture must preserve the difference between metadata about secrets and the secret contents themselves.

The eighth requirement is observability without leakage. The monorepo product should make it possible to know when secret retrieval or use failed, when rotation-related behavior matters, or when authorization blocked access, but it must do so without leaking the secret material into logs or traces.

The ninth requirement is founder usability. The system must be operable by a solo founder. This means secret handling must be secure enough to matter but not so labyrinthine that the product becomes impossible to maintain. The product should therefore prefer a clean, centralized, repeatable model over a sprawling maze of ad hoc secret pathways.

## **12.3 Worker-Side Temporary Data Rules**

The monorepo product must implement explicit worker-side temporary data rules because the architecture is clear that workers may temporarily hold some centrally retrieved material during execution, but must not become long-term repositories of that material. These rules are an essential bridge between security theory and runtime product behavior.

The first rule is that temporary worker-side data exists only to support current execution. If a worker holds mission context, skill content, memory fragments, approved tool references, session-bound credentials, or intermediate outputs locally, that local presence must be justified by immediate operational need. The product should not normalize “keep it around because it might be useful later” as a worker-side default.

The second rule is that temporary worker-side data should prefer RAM where practical. The architecture has already clarified that “in memory” means RAM, not a password-protected local folder treated as pseudo-memory. The monorepo product should therefore support runtime flows that keep temporary sensitive material in memory whenever reasonably possible.

The third rule is that if controlled temporary file use is unavoidable, it must be bounded. The product should define controlled temporary paths or working areas for such data rather than allowing arbitrary spill across the worker environment. This is important because cleanup, observability, and containment become much harder if the product has no structured understanding of where temporary data may exist.

The fourth rule is that local temporary data is not a second source of truth. The worker may hold a cached skill, context fragment, or manifest interpretation briefly, but the central system remains authoritative. The product must preserve this in code structure and in runtime behavior. For example, stale local state should not outrank central invalidation.

The fifth rule is that temporary data should be removed or reduced after successful central persistence or after the end of the relevant execution need. This is where `prism-defender` and runtime cooperation matter. The product must support actual cleanup, not merely good intentions.

The sixth rule is that worker-side temporary data handling should be environment-aware without architectural betrayal. Development may be more inspectable, but the product should still preserve the same conceptual rules about what is temporary and what is durable. Otherwise, development becomes misleading and later promotion to production becomes riskier.

The seventh rule is that observability must be sufficient to diagnose problems without turning temporary worker-side data handling into a new long-term logging surface. This means the product should be able to observe cleanup and residue-related problems without keeping every temporary detail forever.

The eighth rule is that approved tools must operate inside these constraints. The product should not create a conflict between “use approved tool packages” and “minimize local persistence.” Instead, the runtime and PRISM rules should define how tools can work in a controlled temporary environment without turning every execution into a residue explosion.

These rules ensure that worker-side temporary state remains what it is supposed to be: temporary, bounded, purposeful, and reducible.

## **12.4 Fail-Closed Requirements**

The monorepo product must implement fail-closed behavior as an actual runtime property, not as a rhetorical security aspiration. This means that when central authorization cannot be confirmed, when active status is revoked, or when critical governance conditions fail, the system should move toward restriction or shutdown rather than permissive continuation.

The first fail-closed requirement is bootstrap dependence on central validation. A worker should not become fully operational simply because a process starts. The product must require successful central authentication and authorization before the runtime is treated as active. This begins the fail-closed model at startup.

The second requirement is ongoing validation support. The architecture already depends on continued status awareness, heartbeats, and manifest-aligned runtime operation. The monorepo product must therefore make it possible for workers to determine whether they remain valid governed participants over time, not only at the start of the session.

The third requirement is denial of unauthorized retrieval. If a worker asks for a skill, memory fragment, or approved tool reference outside its current allowed scope, the product must support denial rather than permissive fallback. This is one of the clearest ways fail-closed behavior appears in normal runtime use.

The fourth requirement is shutdown participation when central status says stop. If the central system revokes a worker, disables a manifest, or otherwise indicates that the worker should no longer operate, the runtime stack—including `bot-runtime`, `linklogic-sdk`, and `prism-defender`—must support the move toward controlled shutdown. Central control must be operationally real.

The fifth requirement is timeout discipline. If the worker loses central validation beyond the allowed threshold, the product must support the architecture’s rule that continuation is not the default. The system may allow some bounded grace, but it must not drift into indefinite unsupervised runtime operation.

The sixth requirement is environment consistency. The product may expose more diagnostics in development or staging, but it must still preserve fail-closed logic as a real behavior that can be exercised and validated. Development must not quietly become “fail-open forever” because it feels easier.

The seventh requirement is observability of fail-closed outcomes. The monorepo product must let the operator understand when retrieval was denied, when validation failed, or when a worker transitioned toward inactive state because central authority required it. This helps transform fail-closed behavior into something the founder can govern and trust.

The eighth requirement is compatibility with graceful and forced paths. Fail-closed does not always mean immediate kill with no sequencing. Sometimes the correct response is controlled shutdown with final central persistence and cleanup. Other times rapid containment is appropriate. The product should support the architecture’s need for both.

## **12.5 Tool Safety Requirements**

Because the architecture deliberately rejects routine arbitrary database code execution, the monorepo product must implement clear tool safety requirements. These requirements are essential to preserving the distinction between centrally governed skill method and approved executable capability.

The first tool-safety requirement is approved identity and versioning. A tool used by the worker must be identifiable as an approved capability with a stable identity and a specific version. The product should not normalize tool use where the system cannot later say what exactly ran.

The second requirement is centrally governed metadata. The product must support central records that describe the approved tool reference, its version, and its allowed use context. Runtime consumers should not be left to infer tool legitimacy informally.

The third requirement is runtime-side resolution rather than arbitrary direct execution of database-stored code strings. The monorepo product must support a flow where the runtime resolves approved tool packages or modules through controlled references. This is one of the biggest product safety corrections in the architecture.

The fourth requirement is verification support. The runtime should have the ability to confirm that the tool package or module it is about to expose or use corresponds to the approved reference and version expected by the central system. The exact verification mechanics may evolve, but the product must support the concept.

The fifth requirement is mission- and permission-aware invocation. Even if a tool exists and is approved in principle, the worker should not necessarily invoke it in any context. The product must support checking that the current worker, mission, and manifest state make the invocation appropriate.

The sixth requirement is bounded execution environment compatibility. Approved tools may require temporary local working areas, but the product should keep that compatible with cleanup rules and residue-reduction posture. Tool safety therefore includes execution-context discipline, not only central metadata discipline.

The seventh requirement is observability. If a tool is resolved, invoked, denied, or fails, the product should preserve enough central visibility to understand which tool identity and version were involved. This helps both debugging and governance.

The eighth requirement is future-proofing. As the platform grows, some tools may need stronger packaging, stronger attestation, or stricter isolation. The current product should remain compatible with those stronger future controls by avoiding a loose or overly improvised tool model now.

## **12.6 Security Logging and Audit Requirements**

The monorepo product must support security-relevant logging and audit behavior without turning those logs into a new uncontrolled leakage surface. Security logging is necessary because the architecture relies on central governance, fail-closed behavior, cleanup discipline, and approved runtime capability use. If the system cannot observe meaningful security-relevant events, it becomes difficult to trust or improve.

The first requirement is logging of meaningful authorization events. This includes authentication success or failure, manifest-related access outcomes, retrieval denials, fail-closed transitions, and other major runtime authorization decisions. These records should be structured enough to support audit and diagnosis.

The second requirement is logging of significant cleanup or containment behavior. If `prism-defender` performs important cleanup, encounters repeated failure, or supports a shutdown path triggered by governance state, the broader system should be able to observe that at a useful level.

The third requirement is central retention of audit-worthy events. Security-relevant records that matter for later review should not remain only as local worker-side artifacts. If they are meaningful enough to retain, the monorepo product should persist them centrally in an audit-compatible form.

The fourth requirement is identity and mission linkage for retained security events. The operator should be able to understand not just that an event occurred, but under which worker identity and which mission context it occurred where relevant. This preserves audit usefulness.

The fifth requirement is bounded content. Security logs should help explain security-relevant behavior without casually dumping secret values, skill bodies, or other sensitive raw contents into central retention unnecessarily. Good security logging is selective and structured.

The sixth requirement is compatibility with the dashboard. LiNKaios should be able to surface meaningful security-relevant summaries or incident-like events in ways that help the founder govern the system. The command centre does not need to become a SOC dashboard, but it must not be blind to important security-relevant product behavior.

The seventh requirement is environment-aware policy. Development may allow slightly richer diagnostic visibility, but the product should still preserve the same conceptual distinctions between temporary local detail and durable central audit records across environments.

Together, these requirements ensure that the monorepo product’s security posture is observable, reviewable, and aligned with the rest of the architecture.

# **13\. Environment, Build, and Deployment Requirements**

## **13.1 Local Development Requirements**

The monorepo product must support a local development environment that is fast enough for iterative work, clear enough for a non-technical solo founder to operate with AI assistance, and realistic enough that local implementation does not drift away from the approved architecture. Local development is not a disposable afterthought. It is the environment in which the monorepo will most often be changed, tested, and understood. If the product is hard to run locally, the build process slows down; if it behaves too differently locally from the intended architecture, implementation errors will accumulate.

The first local development requirement is that each major app in the monorepo must be runnable in development without requiring the full production topology every time. This means `linkaios-web`, `zulip-gateway`, `prism-defender`, and `bot-runtime` should each be capable of development-mode operation in ways appropriate to their role. Some may run continuously, some may run only during targeted testing, and some may use local stubs or development-safe central services where necessary. What matters is that the founder and AI tools can work on one part of the system without having to stand up the entire world for every small change.

The second requirement is that local development must preserve the architecture’s conceptual boundaries. Even if everything is run on one laptop or one Mac mini during development, the monorepo must not encourage the false idea that all parts of the system are therefore the same thing. `linkaios-web` is still the command centre. `bot-runtime` is still a worker runtime wrapper. `prism-defender` is still the cleanup sidecar. The development environment may collapse deployment topology onto one machine for convenience, but it must not collapse the conceptual architecture.

The third requirement is shared package usability. Local development must make it easy to work across apps and packages in one monorepo workflow. Changes to shared types, observability structures, database helpers, or configuration packages should propagate in a predictable way through the workspace. One of the main benefits of the monorepo is precisely this shared-development efficiency, and the product must preserve it in the actual developer experience.

The fourth requirement is safe handling of the reused central Supabase project. Since the architecture uses one existing Supabase project with a one-time bootstrap reset, local development must be careful not to normalize destructive central changes after bootstrap. The product should support local work in a way that distinguishes between normal application testing and dangerous central reset behavior. A founder working locally should not be one mistaken command away from destroying the central system of record because the environment design blurred those concerns.

The fifth requirement is developer-observable behavior. The local environment should expose logs, status signals, and enough visibility that the founder can understand whether a given app or package is behaving correctly. This is especially important in an AI-assisted workflow, where implementation often proceeds through many short cycles of change and validation. The system should not require deep infrastructure expertise just to see whether a local app is running as expected.

The sixth requirement is environment realism around central truth. Local development should still respect that skills, memory, and mission truth are centralized. It should not encourage “just keep a local copy in files for now” as a development habit. Even if certain local shortcuts are allowed for speed, they must not undermine the product’s core design assumptions.

The seventh requirement is support for the separate OpenClaw fork in development. Since `bot-runtime` depends on the external engine boundary, the local environment must make that integration practical without erasing the repository boundary. The founder should be able to work on the runtime wrapper and its interactions with OpenClaw without needing to pretend they are one codebase.

The eighth requirement is compatibility with the founder’s actual hardware context. Because the founder uses a MacBook and a Mac mini, the product should prefer a development posture that can operate sensibly in those environments without requiring enterprise-scale infrastructure assumptions. Local development must be serious, but it must also be realistically operable.

In short, the local development requirements exist to make the monorepo truly buildable: fast enough to work with, structured enough to stay aligned, and safe enough not to corrupt the central product through convenience.

## **13.2 Staging/Test Requirements**

The monorepo product must support a staging or test environment in which the major components of the system can be validated together under conditions closer to real operation than local development provides. This environment is necessary because many of the most important product behaviors in LiNKtrend only become visible when the apps, shared packages, central storage, worker runtime, sidecar logic, and communication gateway interact as a system rather than as isolated code units.

The first staging requirement is integrated runtime validation. The product should support a staging environment where `linkaios-web`, `bot-runtime`, `prism-defender`, `zulip-gateway`, and the relevant shared package pathways can be exercised together. This is where the system proves that bootstrap, mission attachment, skill retrieval, tool resolution, cleanup support, communication mapping, and observability all work as intended across service boundaries.

The second requirement is realistic central-storage usage. Staging should validate the monorepo against a central database and storage posture close enough to real operation that mission records, skill records, memory retrieval, and artifact storage behavior can be tested meaningfully. A purely fake local-only test environment is not sufficient to validate the architecture’s central truth model.

The third requirement is diagnosability. Staging should preserve realism while still allowing enough visibility to debug integration failures. This may mean clearer logs, slightly richer observability, or other testing-oriented instrumentation. However, staging should not become so permissive or fake that it stops exercising the product’s real architecture.

The fourth requirement is deployment-path validation. Since the monorepo produces multiple deployable apps and services, staging must prove that these can actually be built and run in the intended separate deployment shapes. It should validate that source-code unity does not imply runtime monolith and that the product can operate across its intended service boundaries.

The fifth requirement is fail-closed and cleanup-path validation. Staging should test not just the happy path of worker execution, but also what happens when central validation is lost, when shutdown is triggered, or when cleanup needs to occur. If staging never exercises these conditions, the product may appear healthy while hiding some of its most important risks.

The sixth requirement is mission-aware communication validation. The communication bridge should be tested in staging with enough realism that mission mapping, message enrichment, and outbound/inbound communication patterns are not merely theoretical. Since operator trust often depends heavily on communication behavior, this matters more than it might in a purely backend system.

The seventh requirement is environment-separation clarity. The product should make it difficult to confuse staging with production or staging with local experimental development. Configuration, deployment pathways, and observability should help preserve that distinction.

The eighth requirement is controlled readiness for promotion. A good staging environment allows the founder to know whether a given monorepo change is merely coded or actually integrated and ready for production use. This is a product-level requirement because the founder needs confidence before promoting changes to the live system.

## **13.3 Production Requirements**

The monorepo product must be able to run in production as a real governed platform, not merely as a successful development artifact. Production requirements therefore concern not only whether the apps can run, but whether they can run in a way that preserves the architecture’s central promises: central control, governed execution, central truth, minimized worker persistence, usable observability, and operational stability.

The first production requirement is that `linkaios-web` must function as a stable command-centre application. In production, the dashboard is not a design prototype. It is the founder’s main operational surface. This means it must be deployable, accessible in the intended environment, and connected to the central system of record in a reliable way.

The second requirement is that `bot-runtime` must support real worker operation under central governance. This includes successful central authentication, mission-bound context loading, governed skill and memory retrieval, approved tool resolution, status reporting, and fail-closed response to invalidation conditions. Production runtime behavior must match the architecture, not a simplified demo mode.

The third requirement is that `prism-defender` must operate with its stricter posture in production. Cleanup, residue reduction, and containment-support behavior should be strongest in this environment because production is where the product’s real operational and security posture matters most.

The fourth requirement is that `zulip-gateway` must provide reliable mission-aware communication in production. Since communication is one of the founder’s most visible interfaces with the system, failures here undermine trust quickly. The gateway must therefore be production-serious even if its scope remains bounded.

The fifth requirement is central persistence integrity. Production services must operate against the central system of record in a disciplined way. The monorepo product should not blur production with experimentation in a way that makes central skills, missions, memory, or trace records unreliable.

The sixth requirement is observability strong enough for real operation. Production must expose enough health, trace, and failure visibility that the founder can actually govern the system. A production platform that runs silently until something breaks badly is not acceptable.

The seventh requirement is environment-appropriate configuration and secret handling. Production must consume central configuration and centrally governed secrets in the intended secure way, not through ad hoc hardcoded convenience pathways that may have been tolerated temporarily during prototyping.

The eighth requirement is bounded operational complexity. Even though the product is serious, it must remain realistically operable by the founder. Production cannot depend on a giant human ops team. The monorepo should therefore favor a production posture that is disciplined without becoming practically unusable.

## **13.4 Build Pipeline Requirements**

The monorepo product must support a build pipeline that can reliably turn shared source into deployable apps and services while preserving the intended app/package boundaries. This matters because the monorepo is valuable partly because it centralizes code ownership, but that value disappears if builds are brittle, ambiguous, or tightly coupled in ways that make deployment unreliable.

The first build-pipeline requirement is workspace-aware builds. The monorepo must be able to build individual apps and shared packages in a way that respects dependencies without forcing every app to be rebuilt unnecessarily for every change. This is one of the main practical benefits of a Turborepo-style structure and must be part of the product’s implementation quality.

The second requirement is dependency correctness. Shared packages such as `shared-types`, `db`, `shared-config`, `auth`, `observability`, and `linklogic-sdk` must build in a way that downstream apps can consume them reliably. The pipeline should make contract breakage visible rather than allowing invalid shared interfaces to drift into runtime failure later.

The third requirement is selective build capability. Since not every deployment target uses every app simultaneously, the product should support building only the relevant app and the packages it depends on when needed. This improves development speed and deployment clarity.

The fourth requirement is environment-sensitive build correctness. The pipeline should support the monorepo’s configuration and environment model so that local, staging, and production builds are interpretable and consistent. This does not necessarily mean separate build systems for each environment, but it does mean build outputs should not depend on accidental environment assumptions.

The fifth requirement is compatibility with AI-assisted coding workflows. The founder will often work through incremental changes across shared packages and apps. The build pipeline should therefore provide feedback that is understandable and usable in that workflow rather than assuming a large traditional engineering team.

The sixth requirement is support for quality gates. Since this PRD later defines acceptance criteria, the build pipeline should be capable of participating in those gates through linting, type checking, packaging correctness, or other validation mechanisms where appropriate. The monorepo should not treat build success as merely “it compiled somehow.”

The seventh requirement is future extensibility. As the product grows, additional apps or packages may be added. The build pipeline should remain structured enough that such additions do not require redesigning the whole build model.

## **13.5 Service Deployment Requirements**

The monorepo product must support deployment of its applications and services as distinct runtime units where appropriate. This is one of the clearest practical consequences of the architecture’s decision to use one monorepo without collapsing into one monolithic deployment.

The first service-deployment requirement is that `linkaios-web` be deployable independently as the command-centre application. It should not require bundling the worker runtime or communication gateway into the same process simply because they share a repository. The dashboard is its own product surface and must be deployable as such.

The second requirement is that `zulip-gateway` be deployable as its own communication service. This preserves the architecture’s boundary between messaging adaptation and central dashboard logic. It also makes it easier to operate communication-specific runtime behavior independently.

The third requirement is that `prism-defender` be deployable alongside worker runtime environments in the role of a sidecar or local companion component. It should not be forced into the dashboard deployment simply because it lives in the same source tree.

The fourth requirement is that `bot-runtime` be deployable independently onto worker-hosting environments such as one VPS, multiple VPSs, or a Mac mini. This is central to the architecture’s distributed-execution model. The monorepo product must therefore support building and deploying runtime wrappers as their own unit.

The fifth requirement is that deployment choices remain topology-aware. One environment may run one worker stack. Another may run many worker stacks. A central environment may run the command centre and communication service. The product should support these variations without requiring different codebases.

The sixth requirement is that deployment artifacts remain traceable to monorepo apps and versions. Since one repository produces multiple services, the product should make it reasonably clear which deployed service came from which app build and which package-contract state.

The seventh requirement is that deployment logic respects the external OpenClaw boundary. Deploying `bot-runtime` must not be treated as equivalent to deploying the entire proprietary platform. The runtime wrapper still depends on the separate engine boundary.

## **13.6 Configuration Management Requirements**

The monorepo product must support disciplined configuration management because environment handling, service behavior, central URLs, storage references, feature switches, and other runtime assumptions are too important to leave fragmented across apps. Configuration drift is one of the most common causes of operational confusion in multi-app systems, and the product must address that directly.

The first configuration requirement is shared interpretation of common settings. If multiple apps depend on the same central base URL, environment mode, project-level feature flag, or observability setting, the product should expose that through shared configuration handling rather than letting each app parse it differently.

The second requirement is environment clarity. The product must support configuration that clearly differentiates local development, staging, and production behavior. This includes logging posture, cleanup strictness, service endpoints, and related environment-sensitive behavior.

The third requirement is support for secure secret references. Configuration should distinguish between ordinary non-sensitive settings and values that are secret-governed or vault-backed. The product must not blur these concerns into one flat settings model.

The fourth requirement is app-specific extensibility without shared chaos. Some apps will need configuration unique to their role. The product should allow this while still preserving a shared core configuration discipline. In other words, configuration should be partly shared and partly app-bounded, not universally centralized or universally fragmented.

The fifth requirement is developer usability. Since the founder is operating the system personally, configuration should be understandable and documented. The product should reduce the chance that one environment works only because of hidden local settings no one remembers later.

The sixth requirement is package support. Shared configuration logic should live in `shared-config` and related package contracts where appropriate, reinforcing the monorepo’s structural discipline.

The seventh requirement is future readiness. As the product grows, configuration complexity may increase. The initial configuration model should therefore be clean and extensible rather than improvised from the start.

These requirements make configuration management part of the product architecture, not merely an operational detail.

# **14\. Observability and Operational Requirements**

## **14.1 Logging Requirements**

The monorepo product must provide logging that is structured enough to support governance, debugging, operational understanding, and later system refinement. Logging is not optional in a system like LiNKtrend because the product coordinates multiple applications, central retrieval logic, runtime workers, cleanup sidecars, and communication flows. Without disciplined logging, the operator would be forced to infer behavior from symptoms rather than being able to inspect it directly.

The first logging requirement is that all major apps and services must emit structured logs rather than relying only on ad hoc free-text console output. This is especially important because the system includes several distinct runtime units—`linkaios-web`, `bot-runtime`, `prism-defender`, and `zulip-gateway`—that need to contribute to one coherent operational picture. Structured logging helps keep those outputs comparable and machine-usable.

The second requirement is entity linkage. Logs should, where relevant, include clear association with worker identity, mission identity, event type, and timestamp. A runtime event that cannot be tied to the entity it concerns is often much less useful operationally. The monorepo should therefore centralize or strongly encourage common tagging and event-shaping patterns.

The third requirement is significance layering. The product should distinguish between routine informational logs, warning conditions, failures, and trace-worthy events. This matters because not every internal event deserves the same operational weight. If all logs are treated identically, either the operator is flooded with noise or meaningful events are hidden in clutter.

The fourth requirement is alignment with the architecture’s central-trace model. Logging should support the identification of events that belong only in transient operational observability and those that should also become durable central traces. The product should not force every app to invent this distinction independently.

The fifth requirement is runtime-safety alignment. Since the architecture minimizes worker-side persistence, the product must avoid logging practices that casually leak sensitive or high-value material into durable local logs. Logging should remain useful without turning itself into a new residue problem. This is especially relevant for `bot-runtime` and `prism-defender`.

The sixth requirement is package-level reuse. Common logging patterns should be centralized through the `observability` package or equivalent shared structures, not copied separately across apps. This reduces drift and makes the command centre’s observability views easier to build.

The seventh requirement is operator readability. The founder needs to be able to understand what is happening without reading excessively technical or inconsistent log streams. While logs may still be technically rich, the product should ensure they remain interpretable enough that useful summaries and dashboard views can be built from them.

The eighth requirement is environment-sensitive behavior. Development may allow more verbose logs, while production may prefer more selective central retention and lower-noise operational views. However, all environments should still preserve the same conceptual logging model.

The ninth requirement is support for future growth. As the system evolves, richer logging categories may appear. The product should keep logging contracts stable enough that this growth remains manageable.

In short, the monorepo product must produce logs that are structured, entity-aware, significance-aware, centrally interpretable, and aligned with the broader security and traceability model of the architecture.

## **14.2 Metrics Requirements**

The monorepo product must also provide metrics and quantitative health signals that complement logging. Logs explain specific events. Metrics help the operator understand patterns, current posture, and whether the system is behaving normally over time. In a platform like LiNKtrend, this is essential because health is not only about whether a process is alive. It is also about whether the architecture is functioning as intended.

The first metrics requirement is worker-health visibility. The product should support metrics or health signals showing whether workers are active, how recently they validated or checked in, whether they are failing repeatedly, and whether worker availability aligns with central system expectations. These signals should feed into LiNKaios in a usable way.

The second requirement is mission-flow visibility. The system should be able to show how many missions are active, completed, blocked, or failing to progress. Even if the first version of this is simple, mission throughput and mission state visibility are product-level needs, not future luxuries.

The third requirement is skill and tool usage visibility. The monorepo should support enough metrics that the operator can understand which skills are being used, how often certain approved tools are invoked, and whether certain patterns appear to correlate with repeated problems or high activity. This is useful both operationally and strategically because it helps refine the platform over time.

The fourth requirement is runtime retrieval visibility. Since the architecture depends heavily on central retrieval of skills, memory, and policy, the product should support metrics around retrieval success/failure and possibly retrieval latency or retrieval frequency where useful. The goal is not to create a giant performance-analytics suite in Version 1, but the product should not be blind to retrieval behavior either.

The fifth requirement is cleanup and containment posture visibility. `prism-defender` exists for a reason, and the product should surface enough metrics or counts that the operator can tell whether cleanup behavior is happening, whether failures are recurring, and whether containment-related events are becoming unusually frequent.

The sixth requirement is communication health visibility. Since the system depends on mission-aware messaging, the product should include useful metrics or signals around gateway activity, routing success, and communication anomalies where practical.

The seventh requirement is cost/efficiency awareness where feasible. The broader LiNKtrend strategy values leverage and efficient operation. The product should therefore remain capable of exposing basic efficiency signals—such as repeated costly runtime patterns or excessive retrieval frequency—even if full cost analytics are not a Version 1 priority.

The eighth requirement is dashboard usability. Metrics are only useful if they can be surfaced meaningfully. The command centre should not require the founder to query raw metrics manually. The product must support turning metrics into understandable operational views.

The ninth requirement is consistency with shared contracts. Just like logging, metrics should use stable naming and event semantics across apps so that the system can present one coherent operational picture.

## **14.3 Traceability Requirements**

Traceability is the bridge between operational observability and durable system governance. The monorepo product must support traceability because the architecture relies on being able to understand what happened, under which identity, under which mission, using which skill and tool context, and with what outcome. Without this, the system becomes difficult to trust and difficult to refine.

The first traceability requirement is that meaningful worker actions must be connectable to centrally governed identities. This means a trace-worthy event should not float in abstraction. It should be attributable to the worker identity that performed it or the system actor that caused it.

The second requirement is mission linkage. Traceability should preserve the connection between significant events and the mission context in which they occurred. A central mission record without meaningful connected traces is only partially useful, and a trace without mission context is often difficult to interpret in the venture-factory model.

The third requirement is skill/tool version traceability. Since one of the architectural goals is deterministic, auditable execution, the monorepo product should support retaining enough information that future review can determine which centrally governed skill and which approved tool version were involved in significant execution where relevant.

The fourth requirement is control-event traceability. Central actions such as status changes, deactivations, manifest shifts, or other operator-meaningful control-plane actions should be traceable in a way that makes the system’s governance decisions visible over time.

The fifth requirement is communication-path traceability where it matters. Not every message needs full durable trace treatment, but when a communication event materially shapes a mission or worker action, the product should preserve enough context that later review can understand that relationship.

The sixth requirement is central retention of meaningful traces. The product should not rely on local app logs or worker leftovers as its actual trace model. If something is important enough to count as a trace, it should have a path into central retention and into dashboard-level visibility where appropriate.

The seventh requirement is boundedness. Traceability does not mean keeping every microscopic low-level event forever. The product must distinguish meaningful trace-worthy records from ordinary runtime chatter. Good traceability is selective and useful.

The eighth requirement is future analytical value. Retained traces should support later debugging, audit review, skill refinement, and mission-process improvement. This means the product should store them in shapes that remain useful rather than just durable.

## **14.4 Alerting Requirements**

The monorepo product must support alerting or at least strong warning visibility for important operational problems. In a system run by a solo founder, alerting does not need to imitate a large enterprise incident-management platform, but it must still elevate conditions that materially threaten governance, execution quality, or system trust.

The first alerting requirement is that governance-threatening conditions must be surfaced. This includes repeated loss of worker validation, repeated mission-routing failure, central retrieval denial patterns that indicate misconfiguration, recurring cleanup failures, or major service unavailability affecting the command-centre model.

The second requirement is that alert-worthy conditions must be distinguishable from ordinary informational noise. The product should not flatten all anomalies into one undifferentiated feed. It should make it possible for the operator to tell what is urgent, what is concerning but non-urgent, and what is purely informational.

The third requirement is that alerting should tie back to system entities. A useful alert should tell the operator which worker, which mission, which service, or which central process is affected. This preserves actionability.

The fourth requirement is that alerting should appear in or be consumable by LiNKaios. The command centre should surface important warnings in a way that helps the founder know where attention is needed. Alerting that exists only in an isolated service log is much less useful.

The fifth requirement is that communication issues must be alertable when they matter. Since the system depends on the communication gateway, repeated routing or mapping failures should not remain invisible.

The sixth requirement is that cleanup and fail-closed anomalies must be visible. If the product is serious about worker-side discipline, then problems in that discipline must be elevated appropriately rather than hidden.

The seventh requirement is environment-sensitive alert posture. Development may emphasize debugging visibility; production may emphasize operational significance. The product should preserve alerting logic across environments while adjusting thresholds or presentation sensibly.

The eighth requirement is bounded scope. The product should not attempt to become a full universal alerting system for every conceivable future service. It should focus on the operational conditions that matter for the current architecture.

## **14.5 Dashboard Visibility Requirements**

The monorepo product must support dashboard visibility in a way that makes observability and governance actually usable. This requirement exists because logs, metrics, traces, and alerts are only partly useful unless they can be surfaced coherently through LiNKaios.

The first visibility requirement is that the command centre must surface high-level system posture. The founder should be able to see overall worker status, mission counts or states, important recent events, and major health indicators from a central overview.

The second requirement is entity-linked drill-down. From high-level views, the dashboard should allow the operator to move into more detailed identity, mission, skill, memory, or trace views without losing context. This makes observability actionable instead of decorative.

The third requirement is operational summary over raw volume. The dashboard should summarize complexity into usable views rather than forcing the founder to read all raw logs or all low-level metrics directly. This is especially important in a solo-founder operating model.

The fourth requirement is alignment with product semantics. Dashboard visibility should be organized around the architecture’s real entities and statuses, not only around infrastructure metrics. The founder needs to understand “mission blocked,” “worker inactive,” or “skill version changed,” not only CPU graphs and HTTP status counts.

The fifth requirement is support for security- and governance-relevant visibility. Cleanup failures, central status mismatches, manifest-related problems, or repeated unauthorized retrieval attempts should be visible in ways that support action.

The sixth requirement is consistency across apps. Since observability data is produced by multiple services, the dashboard must present it as one coherent system rather than as several disconnected app-specific worlds.

The seventh requirement is future extensibility. As the system grows, richer dashboard visibility will likely be valuable. The product should structure dashboard observability in a way that can expand without needing to replace the whole command-centre model.

Together, these observability and operational requirements ensure that the monorepo product is not only functional, but actually governable and operable in real use.

# **15\. Initial Build Plan and Delivery Order**

## **15.1 Foundational Build Sequence**

The monorepo product must be built in a deliberate sequence rather than as a flat collection of parallel coding tasks. This is especially important because the product contains central shared packages, multiple deployable apps, environment-specific behavior, and a strong dependency on central data truth. If the build order is wrong, later work will either be blocked by missing foundations or built on fragile assumptions that must later be reworked. The purpose of this section is to define the intended foundational build sequence so implementation proceeds from stable base layers toward higher-level product surfaces.

The first build stage is repository and workspace foundation. Before any serious application work begins, the monorepo must exist as a functioning Turborepo workspace with the correct root structure, workspace files, app/package boundaries, and baseline development tooling. This includes the root folder layout, workspace configuration, package management configuration, and the initial skeletons for the apps and shared packages already approved in scope. The point of this stage is not feature delivery. The point is to create a coherent product shell in which later feature work can land correctly.

The second stage is shared-contract foundation. This means the first serious coding work should focus on `shared-types`, `shared-config`, and the early form of `db` and `observability`. These packages are foundational because later applications need stable shared semantics, stable environment interpretation, stable central data-access assumptions, and stable observability contracts. If these shared contracts are not established early enough, the apps will begin by inventing their own local meanings and later require cleanup.

The third stage is central data and bootstrap support. Once the shared contract layer exists, the monorepo should focus on the code needed to support the one-time central bootstrap of the reused Supabase project. This includes migration and seed scaffolding, initial schema/domain setup support, initial storage-bucket assumptions, and the first identity/manifest/skill seed pathways. This stage matters because the command centre and worker runtime should not be built on the assumption of an undefined or drifting central data layer.

The fourth stage is LiNKlogic foundation. Once the central data layer and shared contracts are stable enough, the product should build the first serious version of `linklogic-sdk`. This stage is essential because many later product capabilities—worker bootstrap, mission context loading, skill retrieval, tool resolution, and memory access—depend on the runtime retrieval and enforcement layer. Building the command centre first without the runtime bridge would produce a UI-heavy product with no governed execution path. Building workers first without the bridge would produce runtime experiments without architectural discipline. LiNKlogic is therefore one of the earliest true functional cores.

The fifth stage is bot-runtime baseline integration. With early LiNKlogic in place, the product should build the first working `bot-runtime` flow that can authenticate, retrieve mission-bound context, resolve at least one skill, and operate as a governed runtime wrapper around the separate OpenClaw fork. This is the first stage where the product proves that the worker-side architecture is real rather than only documented. It is also where the separation between proprietary monorepo and external engine becomes practical.

The sixth stage is PRISM baseline implementation. Once the worker runtime exists in a meaningful way, the system should add `prism-defender` in its first functional form. PRISM does not need to be maximally sophisticated from the first moment, but it must become real early enough that worker execution and cleanup are validated together. If cleanup is deferred too long, the product may build bad worker-local habits into its workflows.

The seventh stage is LiNKaios web. Although the command centre is central to the system, it is often more effective to build its first real product surface after the main data contracts, runtime bridge, and initial worker flows exist. This allows the dashboard to be built around real entities and behaviors rather than imagined placeholders. The first command-centre version should then expose the foundational operational surfaces required by the architecture: workers, missions, status, skills, memory, and meaningful traces.

The eighth stage is Zulip-Gateway. The communication gateway should be integrated after the core worker and control-plane pathways are meaningful enough to receive mission-aware communication properly. This keeps the product from building a chat bridge before the system knows how to attach messages to governed mission and worker context.

The ninth stage is observability hardening and end-to-end integration. Once the core product parts exist, the monorepo should strengthen logging, metrics, traces, dashboard visibility, failure-path behavior, and environment distinctions. This is where the product stops being a set of individually meaningful components and becomes a genuinely operable platform.

This sequence is the intended implementation backbone of the monorepo. It prioritizes contracts first, central truth second, runtime bridge third, worker execution fourth, cleanup fifth, command centre sixth, communication seventh, and integrated operational maturity eighth. Deviating from this order is possible in small ways, but the closer implementation stays to this sequence, the less architectural rework is likely to be needed.

## **15.2 Minimum Usable Milestone**

The monorepo product needs a defined minimum usable milestone so that the founder can tell when the platform has crossed from “in progress architecture build” into “real system with meaningful utility.” Without a clear milestone, it becomes too easy to keep adding features indefinitely without ever validating whether the product already satisfies its core purpose.

The minimum usable milestone for the current monorepo build is the smallest product state in which the LiNKtrend architecture becomes meaningfully operational as a centrally governed worker system. This milestone should not require every future enhancement, but it must include enough of the product that the core architecture is actually alive.

The first condition of the minimum usable milestone is a functioning `linkaios-web` command-centre surface. This does not require every dashboard view, but it does require a usable central interface that can show workers, missions, statuses, at least basic skill visibility, and enough trace/health information that the founder can understand what the system is doing. If no such command-centre surface exists, the platform is still too invisible to count as minimally usable.

The second condition is a functioning worker runtime path. At least one `bot-runtime` instance must be able to authenticate through the central system, receive mission-bound context, resolve a centrally stored skill, and perform a controlled run under central authority. This is the most important proof that the monorepo product is more than a dashboard wrapped around storage.

The third condition is working LiNKlogic-based retrieval and enforcement. The worker should not be using hardcoded local skills or direct engine-side assumptions as a substitute for the architecture. It must retrieve governed context and approved skill/tool references through the monorepo’s shared runtime bridge in a way that reflects the architecture’s centralization principles.

The fourth condition is meaningful central persistence. Identity records, mission records, at least initial skill records, and runtime-relevant traces or outputs must be persisting centrally through the intended product pathways. A worker run that cannot leave behind meaningful centrally retained truth is not enough.

The fifth condition is a real first version of PRISM behavior. The sidecar does not have to be perfect, but the product must show that cleanup and residue reduction are real parts of worker operation. Otherwise, the system is still ignoring one of its main worker-side disciplines.

The sixth condition is at least one functioning mission-aware communication path or a clearly integrated gateway stub that proves communication can enter the architecture in a structured way. Since communication is one of the founder’s most important interaction surfaces, the minimum usable product should not leave it entirely abstract.

The seventh condition is enough observability that the founder can verify the previous six conditions without manually inspecting every runtime by hand. A product is not minimally usable if proving it works requires jumping constantly between low-level logs, infrastructure consoles, and database tables.

When these conditions are met, the monorepo product crosses the threshold into something real. It may still be incomplete. It may still have many future sections of the PRD left to fully implement. But it becomes a platform that the founder can begin using, validating, and improving on the basis of actual operation rather than only documentation and code structure.

## **15.3 Recommended Build Order by App and Package**

To make the foundational sequence concrete, this section translates the product strategy into a recommended build order by app and package. The purpose is not to impose rigid inflexibility, but to give the founder and AI-assisted implementation process a sensible path that minimizes rework and maximizes early architectural alignment.

The first set of packages to create and stabilize should be `shared-types`, `shared-config`, and the first usable version of `db`. These form the semantic and infrastructural substrate of the monorepo. `shared-types` ensures the system’s central concepts stay aligned. `shared-config` ensures environment handling begins with consistency instead of drift. `db` provides the first shared central-data access layer needed by almost every other serious part of the product.

The second package to focus on should be `observability`, at least in its baseline form. Even early build stages benefit from structured logs and event contracts, and it is easier to keep observability coherent from the start than to retrofit it after several apps have invented their own patterns.

The third package should be `auth`, once the product reaches the point where central auth/session and secret-access helpers are actually needed in multiple places. This package does not need to be overbuilt on day one, but it should be created before different apps begin improvising their own auth behavior.

The fourth foundational package should be `linklogic-sdk`. This package should be brought up once the shared semantic and data layers are stable enough that runtime retrieval and enforcement paths can be defined with confidence. It is one of the highest-value packages in the monorepo because many app-level product behaviors depend on it.

The fifth package should be `ui`, but only when `linkaios-web` reaches the point where shared UI primitives will actually reduce duplication. It should not be overdesigned too early, but it should arrive before the command-centre app accumulates inconsistent repeated interface components.

On the app side, the first app to create structurally may be `linkaios-web`, but the first app to make deeply functional should probably be `bot-runtime` once the foundational packages are ready. This is because a command centre built before there is anything real to govern can become overly speculative, whereas a worker runtime built before the dashboard exists can at least validate the core architecture. The product should therefore build the shell of `linkaios-web` early, but allow much of its meaningful function to mature in parallel with or after the first real worker runtime.

`bot-runtime` should be the first app to become functionally significant. It is the place where the monorepo proves it can wrap the external OpenClaw engine, authenticate centrally, attach to a mission, retrieve a centrally governed skill, and produce meaningful outputs under control. This is the first major executable proof of the architecture.

`prism-defender` should be the next app to become functionally significant. It should follow closely behind `bot-runtime`, because the product should validate worker execution and cleanup together rather than treating cleanup as a late concern. Even a baseline PRISM implementation improves architecture truthfulness early.

`linkaios-web` should become the next major product focus. Once the worker path and central retrieval model are real, the dashboard can be built against actual runtime behaviors and central records rather than imagined placeholders. This usually produces a more useful and more honest command-centre application.

`zulip-gateway` should follow once missions, workers, and command-centre concepts are real enough that incoming and outgoing messages have somewhere meaningful to land. This makes the communication layer a structured extension of the product rather than the premature driver of product logic.

`services/` work such as migrations and seeds should run in parallel where needed, but always in support of the app/package build order rather than as disconnected infrastructure work. Likewise, `infra/` artifacts should grow as actual deployment needs appear, not as speculative over-documentation before the product has meaningful services to deploy.

This build order ensures that the founder gets early proof of central contracts, then early proof of governed worker execution, then cleanup, then command-centre utility, then communication layering. That is the most sensible sequence for this product.

## **15.4 Validation Gates Between Milestones**

The monorepo product should not move from one major build milestone to the next without passing basic validation gates. These gates are not bureaucratic overhead. They are protection against building later layers on top of assumptions that have not been proven. Because the founder is a solo operator using AI-assisted development, such gates are especially valuable: they turn a long complex build into a series of smaller truth tests.

The first validation gate is the workspace and package gate. Before serious app logic begins, the monorepo must prove that the workspace structure is functioning, that shared packages can be built and consumed, that root-level configuration is stable, and that basic development workflows are workable. If the repository cannot support clean package/app interaction, all later work is at risk.

The second gate is the central-data gate. Before runtime logic becomes serious, the monorepo must prove that the central database/storage integration is stable enough to support identities, missions, skills, and basic central records in a governed way. This includes successful bootstrap/setup behavior, a stable data-access layer, and initial seed viability. If the central truth layer is not coherent, worker and dashboard work will drift.

The third gate is the runtime-retrieval gate. Before the platform is considered to have meaningful worker functionality, the product must prove that `linklogic-sdk` can retrieve and enforce mission- and identity-aware central context correctly. This includes at least one skill resolution path and one memory or mission-context retrieval path that reflects the architecture rather than bypassing it.

The fourth gate is the worker-execution gate. `bot-runtime` must prove it can authenticate, attach to a mission, retrieve governed context, and run meaningfully as a LiNKbot wrapper around the separate OpenClaw fork. If worker execution still depends on ungoverned local shortcuts at this stage, the gate is not passed.

The fifth gate is the cleanup gate. Before worker execution is treated as operationally serious, PRISM must prove that cleanup and containment-support behavior is real. This does not require final future-state hardening, but it does require meaningful worker-local residue reduction and at least one validated shutdown/cleanup pathway.

The sixth gate is the command-centre gate. Before the product is treated as minimally governable, `linkaios-web` must prove that it can expose the system’s key entities and statuses meaningfully enough that the founder can inspect and steer the architecture through the dashboard rather than mainly through raw infrastructure access.

The seventh gate is the communication gate. Before the platform is treated as founder-usable in the intended operating model, `zulip-gateway` must prove that messages can map to missions and flow through the system in a structured way that the rest of the architecture can consume.

The eighth gate is the integrated observability gate. Before the system is promoted into meaningful production use, the founder must be able to observe the main flows—worker status, mission behavior, retrieval outcomes, cleanup behavior, and important traces—without excessive manual detective work. This is the point at which the monorepo product becomes genuinely operable.

These gates should be treated as build-quality checkpoints. If a gate fails, the product should improve the relevant layer before proceeding further.

## **15.5 Common Build Risks and Mitigations**

The monorepo build has several predictable risks. These risks are not signs that the architecture is wrong. They are normal hazards in building a platform that combines central governance, worker execution, shared contracts, and environment-specific behavior. What matters is that the product anticipates them and gives the founder a way to control them.

The first common risk is premature dashboard-centric development. Because `linkaios-web` is visually tangible, there is a temptation to over-focus on interface building before the underlying runtime and data contracts are stable. This can produce a beautiful but speculative control plane that later needs rework once real worker behavior appears. The mitigation is to let central contracts and real worker-runtime flows shape the dashboard rather than inventing too much ahead of them.

The second risk is worker-side shortcutting. During early runtime work, it may feel easier to place skills locally, hardcode certain contexts, bypass central permission checks, or store temporary state in persistent local files. These shortcuts can make early demos easier while quietly violating the product’s most important architecture rules. The mitigation is to treat the runtime-retrieval gate and cleanup gate seriously and refuse to normalize these shortcuts as if they were acceptable foundations.

The third risk is over-abstraction in packages. Because the monorepo includes several shared packages, there is a risk of turning `packages/` into a forest of abstractions before reuse is proven. This makes the product harder to navigate and implement. The mitigation is to follow the package-addition rules: centralize what truly reduces duplication or protects contracts, and keep other logic local until reuse is real.

The fourth risk is under-abstraction in packages. The opposite problem is also real: multiple apps may each invent their own mission shape, status naming, or retrieval behavior because shared packages were not taken seriously enough. This leads to drift and expensive cleanup later. The mitigation is to build `shared-types`, `shared-config`, `db`, `observability`, and `linklogic-sdk` early and require apps to consume them.

The fifth risk is central-data ambiguity. Because the system reuses an existing Supabase project, there is a risk that old assumptions, partial migrations, or poorly named structures bleed into the new product. The mitigation is the one-time bootstrap reset, clear schema-domain design, and the discipline of treating the reused project as a newly governed central platform rather than a legacy sandbox.

The sixth risk is weak environment separation. If local development, staging, and production become too blurred, the founder may struggle to know whether a behavior is a real production truth or merely a permissive development artifact. The mitigation is to centralize config interpretation, document environment posture, and validate fail-closed and cleanup behavior outside development-only paths.

The seventh risk is communication being implemented too early or too late. If `zulip-gateway` is built too early, it may drive architecture through message convenience instead of mission truth. If it is built too late, the founder may not be able to use the product in the intended operating style. The mitigation is to place it after the worker/runtime and command-centre layers are meaningful but before declaring the platform founder-usable.

The eighth risk is treating observability as a finishing touch. In a system like LiNKtrend, waiting too long to build common logs, traces, and dashboard visibility creates blind spots and makes later debugging much harder. The mitigation is to establish `observability` early and strengthen integrated observability before production-like operation begins.

The ninth risk is misusing the separate OpenClaw boundary. It may be tempting to blur the runtime wrapper and the engine fork into one mental model or one pseudo-codebase. The mitigation is to keep `bot-runtime` and the external fork strictly conceptually distinct throughout implementation.

The tenth risk is founder overload through too much scope at once. The architecture is ambitious, and the monorepo can easily absorb more ideas than the current phase can support. The mitigation is to follow the build order, use the validation gates, and judge every new addition against current product scope.

These risks and mitigations are part of the PRD because product quality is not just about features. It is also about sequencing, discipline, and avoiding the predictable mistakes that can derail a platform before it matures.

# **16\. Acceptance Criteria and Quality Gates**

## **16.1 Functional Acceptance Criteria**

The monorepo product should only be considered functionally acceptable when it can demonstrate the core end-to-end behaviors that the current LiNKtrend architecture requires. Functional acceptance is not the same as “the code compiles” or “the screens render.” A platform like this is functionally acceptable only when the main architectural flows exist in working form and can be exercised reliably enough that the founder can treat the system as a real operating substrate rather than an ongoing experiment.

The first functional acceptance criterion is that the command-centre application exists and is meaningfully usable. `linkaios-web` must be able to present at least the core entity views required by the current build: workers or identities, missions, statuses, skills, memory visibility, and important recent traces or alerts. A simple shell or static dashboard is not sufficient. The operator must be able to inspect live centrally governed system information through the app.

The second criterion is that a worker runtime can authenticate successfully through the central system. `bot-runtime` must prove that it can start as a governed runtime, identify itself correctly, receive or validate central authorization, and enter operation only when central authority permits it. If a worker can only run through hardcoded development bypasses, the product is not functionally acceptable.

The third criterion is mission-bound operation. A worker must be able to attach to a centrally governed mission, receive mission-aware context, and operate with that mission as a structured work unit. The product should not require the founder to treat all worker activity as context-free or infer mission behavior from informal conventions.

The fourth criterion is governed skill retrieval. The worker must be able to retrieve a centrally stored skill through the intended runtime path rather than through a worker-local file library as its source of truth. This is one of the clearest practical tests of whether the new architecture has actually displaced the older file-first pattern.

The fifth criterion is approved tool resolution. At least one meaningful runtime flow must prove that a centrally governed skill can lead to resolution of an approved tool or capability through the proper product pathway rather than through arbitrary raw code execution. The product does not need a massive tool catalog in Version 1, but it must prove the correct pattern.

The sixth criterion is meaningful central persistence of results. A worker run must be able to produce an output, trace, or state change that the product persists centrally in the correct system of record rather than leaving only local traces behind. This is one of the most important tests of whether the system compounds rather than forgetting.

The seventh criterion is cleanup behavior. `prism-defender` must be able to perform at least a meaningful first version of cleanup or residue-reduction behavior tied to runtime execution so that the product does not leave worker nodes as ungoverned accumulation points. If cleanup remains entirely conceptual, the functional acceptance bar is not met.

The eighth criterion is communication integration. `zulip-gateway` must be able to receive at least a meaningful class of communication event, map it to the appropriate mission context, and route it into the architecture in a structured way. The communication path does not need every future feature, but it must be real enough to support the current operating model.

The ninth criterion is observability of the previous eight behaviors. The founder must be able to verify that these flows occurred through the dashboard and/or structured observability outputs without resorting entirely to ad hoc low-level infrastructure inspection.

When these functional acceptance criteria are met together, the monorepo can reasonably be considered to have achieved a usable Version 1 functional state.

## **16.2 Architectural Acceptance Criteria**

Functional success alone is not enough for this product. Because the LiNKtrend monorepo exists specifically to implement a deliberate architecture, the codebase must also satisfy architectural acceptance criteria. These criteria determine whether the product was built in a way that preserves the intended structure rather than merely simulating the intended behavior through shortcuts.

The first architectural acceptance criterion is central truth preservation. Skills, memory, identities, missions, manifests, and related durable system entities must be centrally governed in practice, not only in theory. If any of these have effectively become worker-local or app-local source of truth, the architecture has been violated.

The second criterion is separation between proprietary platform and OpenClaw fork. The monorepo must remain the home of proprietary system logic, while OpenClaw remains a separate fork with minimal required integration hooks. If the monorepo has quietly absorbed engine internals or if the fork has quietly become the owner of proprietary governance logic, the architecture is no longer clean.

The third criterion is correct app/package boundary discipline. Code should be located according to the responsibility model defined in this PRD. `apps/` should contain app-specific runtime or UI behavior. `packages/` should contain genuinely shared platform logic and shared contracts. If the repository has become structurally blurry, it has failed an architectural acceptance test even if some features appear to work.

The fourth criterion is skills-tools separation. The monorepo must preserve the distinction between centrally governed skill logic and approved executable tool capabilities. If skills have become containers for arbitrary live executable code as the normal operating pattern, the architecture has drifted.

The fifth criterion is runtime-governance preservation. Workers must remain governed participants rather than becoming semi-independent local systems. This means bootstrap, retrieval, permission, status, and fail-closed logic must all preserve central control rather than hiding permissive local fallbacks.

The sixth criterion is distributed execution with centralized governance. The monorepo must support the architecture’s deployment model in which source-code unity coexists with deployment modularity. If the product can only function when everything is collapsed into one local development machine assumption, it has failed to implement a key architectural principle.

The seventh criterion is schema and data-domain clarity. The monorepo’s data layer should reflect intentional governance, skills, memory, and related data domains rather than flattening everything into an incoherent structure. This matters because the architecture depends on semantic data ownership, not just storage.

The eighth criterion is observability alignment. Logging, metrics, traces, and dashboard views should reinforce the architecture’s central concepts rather than presenting disconnected or contradictory operational realities across apps.

The ninth criterion is future-safe structure without current overbuild. The monorepo should preserve reserved future pathways without polluting the Version 1 product with speculative abstractions or unused services. This criterion tests discipline as much as design.

These architectural acceptance criteria ensure that the product is not only working, but working as the approved architecture intended.

## **16.3 Security Acceptance Criteria**

Security acceptance for the monorepo product is based on whether the current build’s realistic security goals are actually implemented in behavior, structure, and central control. This is not a requirement for perfect future hardening. It is a requirement that the current system already behave like a serious centrally governed platform.

The first security acceptance criterion is central secret governance. The product must demonstrate that secret handling follows the approved centralized and tiered model rather than relying on broad uncontrolled local secret sprawl. Apps and runtimes may consume secrets temporarily, but they should not become permanent shadow vaults.

The second criterion is minimized worker persistence. The product must demonstrate that workers do not retain centrally governed skills, mission context, outputs, or sensitive execution artifacts unnecessarily after use. This does not require impossible total invisibility, but it does require real best-effort ephemeral handling and real cleanup discipline.

The third criterion is working PRISM behavior. `prism-defender` must provide meaningful local cleanup/residue-reduction behavior and participate in containment or shutdown-related flows where appropriate. Security acceptance cannot be granted if PRISM remains only nominal.

The fourth criterion is fail-closed behavior under meaningful conditions. Workers must not continue indefinitely in unauthorized or central-validation-lost states as if nothing changed. The monorepo product must prove that denial, restriction, or shutdown behavior occurs under the conditions defined by the architecture.

The fifth criterion is controlled tool execution. The product must show that approved tool resolution is the runtime norm and that arbitrary database code execution is not the default execution path. This is one of the most important safety corrections in the architecture.

The sixth criterion is security-relevant auditability. Important authorization failures, cleanup failures, shutdown triggers, or other meaningful security-relevant events must be observable through the central system in a useful way. A security posture that cannot be reviewed is incomplete.

The seventh criterion is environment-aware security posture. Production behavior must be stricter where intended, and staging/local behavior must still preserve the architecture’s truth even if they are somewhat more diagnosable. If development shortcuts have effectively replaced the real security model, the acceptance bar is not met.

The eighth criterion is honest product posture. The product should not depend on exaggerated assumptions such as “RAM means untouchable” or “cleanup means guaranteed non-recoverability.” Security acceptance includes the requirement that the implemented system match the documented realistic claims.

These criteria ensure that the monorepo product is already materially safer and more governable than a naive agent stack, even before later advanced hardening phases.

## **16.4 Operational Acceptance Criteria**

The monorepo product must also satisfy operational acceptance criteria. A platform can be functionally correct and architecturally well-structured yet still fail if it is too opaque, too fragile, or too confusing for the founder to operate. Since LiNKtrend is designed for a solo founder using AI assistance, operational acceptability is a central product requirement.

The first operational acceptance criterion is that the founder can inspect system status through LiNKaios without relying primarily on raw infrastructure access. The command centre should provide enough visibility into workers, missions, statuses, skills, memory, traces, and alerts that the founder can understand the system’s posture from the dashboard.

The second criterion is meaningful observability across all main runtime units. `linkaios-web`, `bot-runtime`, `prism-defender`, and `zulip-gateway` must emit logs and relevant metrics or traces in ways that can be understood together rather than as four isolated operational worlds.

The third criterion is meaningful troubleshooting capability. If a worker fails to authenticate, if a mission fails to map, if a skill cannot be retrieved, if a cleanup flow fails, or if communication routing breaks, the product should expose enough information that the founder can determine roughly what went wrong and where it belongs.

The fourth criterion is workable deployment posture. The founder should be able to understand which apps deploy where and why, rather than being trapped in one repository that only works under one over-simplified topology. One monorepo must still be operationally modular.

The fifth criterion is clear environment separation. The founder should be able to distinguish local development, staging/test, and production in practice. If the environment model is too blurry, operational mistakes become more likely.

The sixth criterion is repeatable system startup and use. A real platform should not require rediscovering the boot sequence or environment assumptions every time it is used. The monorepo should support a repeatable path to start the relevant services and validate the current product milestone.

The seventh criterion is bounded operational burden. The founder should not need enterprise-scale ops discipline just to keep the current product running. The system should be serious, but it should also remain realistically operable in the founder’s actual working context.

Together, these operational acceptance criteria ensure that the product is not only well built, but genuinely usable as a platform.

## **16.5 Documentation Acceptance Criteria**

Because the founder is using AI-assisted development and because the product depends heavily on structure and central meaning, documentation is part of the product’s acceptance criteria, not a secondary nicety. The monorepo is not acceptable if it can only be understood by reading the source code in detail and reconstructing the architecture by inference.

The first documentation acceptance criterion is that the monorepo’s actual structure matches the PRD closely enough that the PRD remains truthful. If the code has drifted so far that the PRD no longer describes reality, the product is not adequately documented.

The second criterion is that the key apps and shared packages are documented clearly enough that a future contributor can understand their role, boundaries, and main dependencies. This does not require enormous prose inside every folder, but it does require enough clarity that the repository remains navigable.

The third criterion is that environment, build, and deployment expectations are documented clearly enough that the founder can continue operating and evolving the system without rediscovering basics every time. A working platform with undocumented operational assumptions is fragile.

The fourth criterion is that the relationship between the monorepo and the separate OpenClaw fork remains documented and clear. This boundary is too important to leave implicit.

The fifth criterion is that the product preserves a documentation habit consistent with AI-assisted development: clear enough structure, explicit enough terminology, and stable enough contracts that future work can continue efficiently.

These criteria ensure that the monorepo remains governable not only in runtime, but also in human understanding.

# **17\. Appendices and Formal Product Matrices**

## **17.1 App Responsibility Matrix**

The monorepo product includes several first-class applications, each of which exists because the architecture requires a distinct deployable surface with its own responsibility. This matrix exists to define those app-level responsibilities formally so that the product remains coherent as implementation grows. Without this matrix, app boundaries can easily blur, especially in a monorepo where code proximity may tempt developers to cross responsibilities for convenience.

`linkaios-web` owns the operator-facing command-centre experience. Its formal responsibilities include presenting centrally governed entities such as workers, missions, skills, memory views, statuses, traces, and health information; supporting central control interactions appropriate to Version 1; and acting as the human-usable surface through which the founder sees and steers the system. It does not own worker execution, skill retrieval logic, cleanup logic, or communication transport internals. It consumes shared packages and central data-access layers, but it remains a web application, not the hidden owner of the entire backend.

`bot-runtime` owns runtime assembly on the proprietary side of the worker model. Its formal responsibilities include worker bootstrap orchestration, central authentication participation, mission-bound runtime attachment, integration with `linklogic-sdk`, use of approved tool resolution pathways, interaction with the separate OpenClaw fork, and correct runtime participation in status, observability, cleanup, and shutdown flows. It does not own central identity truth, central mission truth, central memory truth, or central skill governance. It is the execution wrapper, not the central system.

`prism-defender` owns cleanup discipline, residue reduction, and support for local containment-oriented behavior. Its formal responsibilities include watching architecture-approved temporary paths or runtime conditions, reducing worker-local residue after use, helping support fail-closed and shutdown flows, and emitting observability signals about its own actions and failures. It does not own central authorization policy, mission state, or skill/memory governance. It is the local defensive sidecar.

`zulip-gateway` owns mission-aware communication adaptation. Its formal responsibilities include receiving communication events, mapping them to mission context, enriching them with structured metadata, routing them into the governed architecture, handling outbound communication shaping, and contributing relevant communication observability. It does not own central mission truth, central memory, central skills, or central policy authority. It is the communication adapter, not the core system.

A future optional `bot-manager` app, if ever promoted into scope, would own worker-fleet or runtime management behaviors that are too orchestration-specific for `linkaios-web` and too broad to belong inside `bot-runtime`. However, because it is not current scope, it has no current product responsibility and should not yet distort the existing app boundaries.

This matrix exists to preserve product integrity. If future implementation starts moving mission logic into the gateway, cleanup behavior into the dashboard, or central identity authority into the runtime wrapper, the product is drifting. The matrix should therefore be treated as a direct product-governance tool, not merely as documentation prose.

## **17.2 Package Responsibility Matrix**

The shared packages in the monorepo exist to centralize platform-level logic and shared contracts that would otherwise be duplicated or drift across applications. This matrix defines what each approved package is formally responsible for so that the package layer remains useful rather than becoming a generic abstraction jungle.

`linklogic-sdk` owns reusable runtime retrieval and enforcement logic. Its responsibilities include mission-aware and identity-aware retrieval, manifest-aware access mediation, skill resolution, approved tool reference resolution support, progressive memory-retrieval support, and runtime caching contracts consistent with central truth. It does not own app-specific runtime orchestration or central policy authorship. It is the runtime bridge package.

`db` owns shared central-data access logic and schema-aware interaction patterns. Its responsibilities include exposing consistent access paths to centrally stored identities, missions, manifests, skills, memory, traces, and related records. It does not own product semantics at the conceptual level or front-end state composition. It is the shared database-access layer.

`auth` owns shared authentication/session helpers and reusable secret-access or permission-helper patterns where those are cross-cutting. It does not own the entire security model or arbitrary business rules. It is the reusable auth/support layer.

`shared-types` owns the central cross-app type contracts for entities such as workers, identities, missions, manifests, skills, tools, traces, memory shapes, statuses, and event envelopes. It does not own behavior or data-access code. It is the semantic contract package.

`shared-config` owns consistent interpretation of configuration, environment modes, central URLs, shared constants, and feature flags used across apps. It does not own arbitrary utilities or domain logic. It is the configuration contract package.

`observability` owns shared logging/event shapes, metrics helpers, trace-related structures, and instrumentation conventions. It does not own the business decisions that create events, only the reusable structures that keep those events coherent across the monorepo.

`ui` owns reusable presentational and interaction components for `linkaios-web` and future internal UI surfaces. It does not own dashboard business logic, data loading behavior, or cross-domain business semantics. It is the shared presentation layer.

The matrix matters because packages that lack clear purpose tend to absorb unrelated logic over time. This monorepo cannot afford that drift because its value depends heavily on stable shared contracts. When evaluating future code placement, developers should ask whether the code belongs inside one app’s local responsibility or whether it truly strengthens one of the package roles defined here.

## **17.3 Data Ownership Matrix**

This product matrix defines which parts of the monorepo and central platform own which categories of data. It is related to the architectural source-of-truth model, but expressed here in monorepo product terms so builders know where responsibility lies in implementation.

Identity data is centrally owned by the LiNKaios-governed system of record and exposed through the `db` package and shared contracts. `linkaios-web` presents it. `bot-runtime` consumes it during authorized operation. No worker runtime owns durable identity truth.

Mission data is centrally owned by the command-centre and central-data model. The `db` package mediates structured access. `linkaios-web` presents and acts on it. `zulip-gateway` references it for communication mapping. `bot-runtime` consumes mission-bound context. Mission ownership remains central.

Skill data is centrally owned by the LiNKskills layer and stored in the central data model. `linklogic-sdk` resolves it for runtime use. `linkaios-web` presents it for governance visibility. Workers do not own the durable skill library.

Memory data is centrally owned by LiNKbrain and its associated central records. `linklogic-sdk` retrieves it, `linkaios-web` presents meaningful portions of it, and workers consume it temporarily as runtime context. Durable memory ownership remains central.

Approved tool metadata is centrally owned as part of the central system’s governed capability model. `linklogic-sdk` and runtime-side code interpret and resolve it. The worker uses approved capabilities but does not own the approval model.

Temporary runtime state is owned only locally and temporarily by the worker/runtime stack for the duration of active execution. This includes in-RAM context, temporary working files, and session-bound materials. This ownership is operational, not durable. PRISM helps reduce or clear it after use.

File objects are durably owned in central storage buckets, with their meaning governed by central metadata. The `db` package and dashboard views expose that meaning. Workers may retrieve or create files transiently, but they do not become the permanent owners of those files.

Trace and audit-worthy records are centrally owned once retained. Apps may emit the events that become traces, but durable ownership belongs to the central retention model and central control-plane views.

This matrix should help prevent one of the easiest product errors in agentic systems: confusing temporary use with durable ownership. The monorepo must preserve the distinction rigorously.

## **17.4 Runtime Interaction Matrix**

The monorepo product also needs a formal understanding of how its major apps and packages interact during live operation. This matrix focuses on runtime cooperation rather than static ownership and is intended to make system behavior easier to reason about.

During worker bootstrap, `bot-runtime` starts the worker-side flow, `auth`/shared configuration help interpret the startup context, `linklogic-sdk` participates in retrieving governed authorization state, and the central data model confirms validity. If validity is confirmed, the worker becomes active; if not, runtime continuation is denied or constrained.

During mission attachment, `bot-runtime` requests or receives mission-bound context, `linklogic-sdk` resolves that context through central records, `db` provides the data-access pathways, and `shared-types` ensures mission semantics remain consistent across the flow. `linkaios-web` later presents the resulting mission state centrally.

During skill usage, `bot-runtime` invokes the runtime flow, `linklogic-sdk` resolves the correct centrally governed skill and any approved tool references, `db` and central storage provide the relevant records and assets, and `observability` structures the emitted events and traces.

During communication handling, `zulip-gateway` receives messages, maps them to missions using central records and shared contracts, enriches them with structured metadata, and routes them toward the runtime path. The gateway may also send outbound messages based on runtime outputs or central-state-aware communication logic.

During cleanup, `bot-runtime` cooperates with the end-of-task or end-of-session rules, `prism-defender` handles local residue-reduction responsibilities, and `observability` captures relevant events. If the shutdown is centrally triggered, the runtime stack must respond under the authority of central status and manifest state.

During dashboard use, `linkaios-web` consumes data via shared packages and central records, uses `ui` for presentation, and relies on shared observability/event models to surface the system’s operational picture coherently.

The purpose of this matrix is to make clear that apps collaborate through defined shared packages and central records rather than by reaching arbitrarily into each other’s internals. This is one of the monorepo’s most important product-quality rules.

## **17.5 Current vs Future Scope Matrix**

The monorepo product should distinguish clearly between current build responsibilities and future reserved pathways. This matrix exists to preserve that distinction at the product level so future contributors do not misread architectural openness as immediate implementation requirement.

Current product scope includes:

- `linkaios-web` as command centre,  
- `bot-runtime` as the runtime wrapper around the separate OpenClaw fork,  
- `prism-defender` as cleanup/containment sidecar,  
- `zulip-gateway` as mission-aware communication bridge,  
- the approved shared packages (`linklogic-sdk`, `db`, `auth`, `shared-types`, `shared-config`, `observability`, `ui`),  
- centralized data/storage integration with the reused Supabase project,  
- realistic security behavior, fail-closed runtime participation, cleanup discipline, and command-centre observability,  
- internal-first operation.

Reserved future scope includes:

- a dedicated `bot-manager` app if worker-fleet complexity later justifies it,  
- additional worker-engine families beyond the current OpenClaw-first runtime model,  
- richer external/client-isolated deployment models,  
- more advanced governance and policy-management interfaces,  
- stronger future security hardening such as richer attestation/isolation,  
- broader automation/orchestration integrations,  
- richer multi-role organizational surfaces.

Not in current scope are:

- absorbing the OpenClaw fork into the monorepo,  
- building a universal multi-engine orchestration platform now,  
- implementing full external client productization now,  
- restoring worker-local file-based skills as primary truth,  
- normalizing arbitrary database-stored executable code as the default tool model.

This matrix should be applied whenever someone proposes a new app, package, or large feature. If the proposal belongs to reserved future scope, it should remain reserved unless the founder intentionally promotes it into the active build plan.

## **17.6 Final Product Summary**

The monorepo product defined in this PRD is the proprietary implementation platform of the current LiNKtrend architecture. It is where the command centre, worker runtime wrapper, communication gateway, cleanup sidecar, shared runtime retrieval logic, shared contracts, data-access pathways, and observability structures come together as one owned software product. It is not merely a repository choice. It is the main code asset through which LiNKtrend’s differentiated operating model becomes real.

The product’s defining characteristics are:

- one Turborepo monorepo for the proprietary platform,  
- explicit separation from the external OpenClaw fork,  
- centralized truth for identities, missions, skills, memory, and retained traces,  
- governed runtime behavior through `linklogic-sdk`,  
- a real command centre through `linkaios-web`,  
- real worker-side cleanup discipline through `prism-defender`,  
- real mission-aware communication through `zulip-gateway`,  
- strong package/app boundaries,  
- environment-aware operation,  
- realistic security posture,  
- and observability sufficient for founder governance.

The monorepo succeeds if it becomes both structurally clean and operationally real. It must not only look well organized in source control. It must allow the founder to govern workers, missions, skills, memory, and traces through a central dashboard; run workers under central authority; retrieve centrally governed logic and memory; use approved tools safely; clean up worker-side residue meaningfully; and understand the system through traces, metrics, and alerts.

This PRD should therefore be used as the product-level source of truth for implementing the proprietary monorepo. Once the product described here exists in meaningful form, the broader LiNKtrend system will have a real owned platform around which future expansion can happen without re-deriving the entire architecture from scratch.

This concludes the monorepo product requirements document.

