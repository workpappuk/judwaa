# ADR-0002: Node Schema and Contract Versioning Strategy

- Status: Accepted
- Date: 2026-07-10
- Deciders: Platform Architecture Team
- Technical Story: Define compatibility and evolution rules for Node metadata and platform contracts

## Context
The platform represents UI composition as metadata-defined Nodes and resolves behavior through engine contracts. Without explicit versioning rules, schema evolution can break route resolution, plugin compatibility, frontend rendering, and tenant-specific configurations.

We need a deterministic versioning strategy covering Node schemas and related runtime contracts so new capabilities can be introduced safely while preserving backward compatibility.

## Decision
Adopt semantic versioning and compatibility guarantees for Node schemas and runtime contracts with the following rules:

1. Every Node definition includes a mandatory `schemaVersion` field.
2. Node schema artifacts use semantic versioning: MAJOR.MINOR.PATCH.
3. Backward-compatible changes are additive only for MINOR and PATCH releases.
4. Breaking changes require a MAJOR version increment and migration path.
5. Render pipeline stages and plugin contracts must declare supported version ranges.
6. Configuration and policy bindings referencing nodes must validate against versioned schemas at publish time.
7. Deprecated fields require at least one full minor release cycle before removal unless a security exception is approved.

## Consequences
### Positive
- Predictable contract evolution and safer releases.
- Stronger compatibility guarantees across backend, plugins, and renderer.
- Easier tenant ring-rollouts and rollback decisions.
- Better observability of schema drift and compatibility failures.

### Negative
- Increased governance overhead for schema lifecycle management.
- Additional validation and migration tooling required.
- Temporary dual-version support increases implementation complexity.

### Neutral
- Documentation and developer workflow must include version review checkpoints.
- Contract tests become mandatory for version boundary changes.

## Alternatives Considered
1. Single global schema version for the whole platform.
2. Date-based versioning without compatibility semantics.

Why not chosen:
- A single global schema version forces broad upgrades for local changes and reduces team autonomy.
- Date-based versioning does not communicate compatibility intent and complicates automated validation.

## Rollout and Validation Plan
1. Define and publish JSON schema bundles for each Node type and version.
2. Add publish-time validators for schema compatibility and deprecation policy.
3. Add contract tests that run old metadata against new runtime versions and vice versa.
4. Add compatibility matrix docs for renderer, plugin, and pipeline contracts.
5. Instrument version mismatch metrics and release quality gates.
6. Review policy effectiveness after two release cycles.

## Follow-up Actions
- [ ] Create schema registry and discovery API for internal tooling.
- [ ] Add automated migration tooling for major Node schema upgrades.
- [ ] Define emergency override policy for critical security schema changes.

## Related Documents
- ../02_DOMAIN_MODEL.md
- ../03_RENDER_PIPELINE.md
- ../06_COMPONENT_MODEL.md
- ../10_VERSIONING.md
- ADR-0001-backend-driven-ui-composition.md
