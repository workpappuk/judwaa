# Coding Standards

## Purpose
Define implementation standards that preserve platform principles and architectural integrity.

## General Rules
- Prefer composition over inheritance.
- Keep domain objects immutable.
- Keep frontend render-only and free of business logic.
- Avoid hidden side effects in pipeline stages.

## Contract and Schema Rules
- Version all public contracts.
- Validate inputs and outputs at boundaries.
- Reject ambiguous or partially valid payloads in strict paths.

## Security Rules
- Deny by default.
- Never log secrets or sensitive raw payloads.
- Enforce tenant scoping in all data access paths.

## Observability Rules
- Emit structured logs, metrics, and traces for every stage.
- Include correlation ID and tenant ID in telemetry.
- Use stable event names and reason codes.

## Reliability Rules
- Define timeout and retry policy per external call.
- Use circuit breakers for unstable dependencies.
- Add graceful degradation only where policy-safe.

## Testing Rules
- Add unit and contract tests for all new architecture contracts.
- Add integration tests for stage interaction changes.
- Add regression tests for any production incident fixes.

## Documentation Rules
- Update architecture docs and ADRs for significant design changes.
- Document feature flag intent and expiry at creation time.
