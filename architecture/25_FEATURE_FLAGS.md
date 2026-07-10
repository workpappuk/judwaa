# Feature Flags

## Purpose
Control feature rollout safely by tenant, route, component, and user cohort.

## Flag Types
- Release flags.
- Experiment flags.
- Operational kill switches.
- Permission-coupled flags.

## Targeting Dimensions
- Tenant.
- Environment.
- Route and component.
- User segments and attributes.
- Time windows.

## Evaluation Rules
- Evaluate using immutable RenderContext.
- Deterministic evaluation for same context and version.
- No direct frontend-side business logic branching.

## Governance
- Every flag has owner, intent, and expiry date.
- Expired flags trigger cleanup tasks.
- Flag changes emit audit and rollout events.

## Safety
- Global kill switch for emergency disable.
- Ring-based rollout and instant rollback.
- Observability on flag impact to latency and errors.
