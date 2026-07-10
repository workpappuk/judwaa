# ADR-0001: Backend-Driven UI Composition Platform

- Status: Accepted
- Date: 2026-07-10
- Deciders: Platform Architecture Team
- Technical Story: Establish foundational architecture direction for Judwaa platform

## Context
The platform must support fast product iteration, policy-safe delivery, tenant-aware behavior, and consistent user experiences across channels. Traditional frontend-heavy architectures distribute business logic across clients, making authorization, configuration, feature rollout, and observability harder to control and audit.

The platform constitution defines a backend-first model where UI is described as metadata and rendered by a dumb frontend engine. We need a formal decision record to make this architectural direction explicit, durable, and enforceable.

## Decision
Adopt a backend-driven UI composition architecture with these mandatory constraints:

1. Backend owns composition, route resolution, authorization, data orchestration, configuration, localization, and feature flags.
2. Frontend is render-only and contains no business logic.
3. UI is serialized as JSON from immutable, metadata-defined Node trees.
4. Components declare data dependencies and policy bindings; they do not call APIs directly.
5. Request handling follows a staged render pipeline with engine-based boundaries.

## Consequences
### Positive
- Centralized policy and permission enforcement.
- Consistent behavior across frontend clients.
- Faster rollout of UI changes through metadata and configuration.
- Stronger tenant isolation and auditability.
- Clear extension points via plugins and events.

### Negative
- Higher backend responsibility and complexity.
- Requires strict schema/version governance for metadata contracts.
- Potential backend latency pressure if caching and orchestration are weak.
- Frontend teams must adapt to renderer-centric workflows.

### Neutral
- Engine ownership and contracts must be explicitly maintained.
- Observability becomes a non-optional architecture requirement.

## Alternatives Considered
1. Frontend-driven architecture with backend APIs only.
2. Hybrid model with business logic split between frontend and backend.

Why not chosen:
- Frontend-driven model weakens central policy enforcement and increases logic drift across clients.
- Hybrid model introduces ownership ambiguity, inconsistent authorization behavior, and harder debugging.

## Rollout and Validation Plan
1. Define versioned schemas for Node, policy, and data dependency contracts.
2. Implement the render pipeline stages and stage-level observability.
3. Enforce no-business-logic frontend rule via architecture checks and code review gates.
4. Add policy, tenant isolation, and compatibility tests for each engine.
5. Publish extension contracts and plugin safety requirements.
6. Review outcomes after first production rollout and update ADR if assumptions change.

## Follow-up Actions
- [x] Create ADR-0002 for Node schema and contract versioning strategy.
- [x] Create ADR-0003 for plugin execution isolation model.
- [ ] Define architecture fitness functions to enforce frontend and pipeline constraints.

## Related Documents
- ../01_PLATFORM_CONSTITUTION.md
- ../00_PLATFORM_VISION.md
- ../03_RENDER_PIPELINE.md
- ../04_PLUGIN_SYSTEM.md
- ../10_VERSIONING.md
