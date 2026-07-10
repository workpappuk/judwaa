# Multi-Tenancy

## Goal
Guarantee strict tenant isolation while preserving shared platform efficiency.

## Isolation Dimensions
- Identity and access control.
- Data isolation.
- Configuration isolation.
- Plugin allowlists and capabilities.
- Observability segmentation.

## Tenant Context
RenderContext must include:
- Tenant ID.
- Environment.
- Entitlements/capabilities.
- Locale and policy scope.

## Safety Controls
- Mandatory tenant scoping in all queries.
- Deny cross-tenant references by default.
- Automated checks for isolation regressions.

## Operational Model
- Tenant onboarding workflow.
- Per-tenant feature rollout.
- Tenant-specific SLIs and error budgets.
