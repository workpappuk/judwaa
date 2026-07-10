# Plugin SDK Wrappers for Telemetry and Contract Validation

## Purpose
Define standard SDK wrappers that every plugin uses to guarantee consistent telemetry, validation, and safety behavior.

## Design Principles
- Secure by default.
- Consistent developer ergonomics across languages.
- No bypass of validation or telemetry hooks.
- Backward-compatible evolution of wrapper APIs.

## Wrapper Set

### Invocation Wrapper
Responsibilities:
- Attach correlation ID, tenant context, route context, and plugin metadata.
- Enforce invocation deadline and cancellation propagation.
- Emit invocation started and completed events.

### Input Contract Wrapper
Responsibilities:
- Validate input payload against versioned schema.
- Validate mandatory context fields.
- Reject unknown forbidden fields in strict mode.

### Output Contract Wrapper
Responsibilities:
- Validate response payload against output schema.
- Enforce size and type constraints.
- Reject data that violates tenant or policy constraints.

### Telemetry Wrapper
Responsibilities:
- Emit structured logs with stable event names.
- Emit metrics for latency, success/failure, timeout, and retries.
- Emit traces with stage and plugin span attributes.

### Error Handling Wrapper
Responsibilities:
- Normalize plugin errors into typed error envelopes.
- Prevent sensitive data leakage in error messages.
- Emit standardized failure telemetry.

## Required Telemetry Fields
- correlationId
- tenantId
- pluginId
- pluginVersion
- pluginTier
- capabilitySet
- stageName
- outcome
- latencyMs

## Validation Modes
- Strict mode: reject unknown fields, hard fail on schema mismatch.
- Compatible mode: allow additive fields while recording compatibility warning.

## SDK Compliance Rules
- All plugins must use SDK wrappers for invocation entry and exit.
- Direct logging and ad-hoc telemetry formats are prohibited.
- Contract validation cannot be disabled in production.

## Rollout Plan
1. Publish SDK reference implementation and examples.
2. Add conformance tests to plugin CI templates.
3. Enforce wrapper usage checks during plugin registration.
4. Add migration guide for existing plugins.

## Success Metrics
- Wrapper adoption rate by plugin count.
- Contract validation failure trend.
- Missing telemetry field rate.
- Mean time to diagnose plugin incidents.
