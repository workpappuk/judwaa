# ADR-0003: Plugin Execution Isolation Model

- Status: Accepted
- Date: 2026-07-10
- Deciders: Platform Architecture Team
- Technical Story: Define safe execution boundaries for pluggable extensions in the render pipeline

## Context
The platform relies on plugin-based extension points across pipeline stages. Unbounded plugin execution can introduce instability, data leakage, tenant isolation risks, and non-deterministic behavior.

A formal isolation model is required to preserve platform safety while retaining plugin flexibility.

## Decision
Adopt a constrained plugin execution model with explicit isolation, capability controls, and failure containment:

1. Plugins execute in isolated runtime boundaries from core engine logic.
2. Plugins must declare capabilities, required inputs, and side-effect permissions.
3. Default plugin mode is read-only; mutating operations require explicit approval and scoped capability grants.
4. Every plugin invocation enforces CPU/time/memory limits and execution timeout.
5. Plugin failures are contained per invocation and must not crash the pipeline.
6. Plugin outputs are schema-validated before re-entering core pipeline flow.
7. Cross-tenant access is denied by default; tenant context is mandatory and immutable.
8. Plugin invocations emit structured audit and telemetry events with correlation IDs.

## Consequences
### Positive
- Stronger safety and tenant isolation guarantees.
- Improved system resilience under plugin faults.
- Better auditability and operational debugging.
- Clear extension boundaries for plugin developers.

### Negative
- Additional runtime overhead for isolation and validation.
- More complex plugin developer experience and onboarding.
- Extra platform investment in sandboxing and capability management.

### Neutral
- Plugin certification and review process becomes part of release governance.
- Some high-performance use cases may need specialized bypass review.

## Alternatives Considered
1. In-process plugins without hard isolation.
2. Fully external plugin services only.

Why not chosen:
- In-process only model increases blast radius for failures and security issues.
- External-only model adds significant latency and operational complexity for all extension types.

## Rollout and Validation Plan
1. Define plugin manifest schema for capability declaration and limits.
2. Implement plugin sandbox runtime with timeout, memory, and policy enforcement.
3. Add pre-deployment plugin verification and compatibility tests.
4. Add per-plugin error budget dashboards and alerting.
5. Introduce progressive rollout by tenant ring and plugin allowlist.
6. Run fault-injection tests to verify containment guarantees.

## Follow-up Actions
- [x] Define plugin trust tiers and approval workflow.
- [x] Implement automated static and dynamic plugin security scans.
- [x] Define standard SDK wrappers for telemetry and contract validation.

## Related Documents
- ../04_PLUGIN_SYSTEM.md
- ../05_SECURITY_MODEL.md
- ../09_EVENT_MODEL.md
- ../11_MULTI_TENANCY.md
- ../12_OBSERVABILITY.md
- ../16_PLUGIN_TRUST_TIERS_AND_APPROVAL.md
- ../17_PLUGIN_SECURITY_SCANNING.md
- ../18_PLUGIN_SDK_WRAPPERS.md
- ADR-0001-backend-driven-ui-composition.md
