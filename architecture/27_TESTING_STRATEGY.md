# Testing Strategy

## Goal
Validate architecture, contracts, behavior, performance, and security across the full render pipeline.

## Test Pyramid
- Unit tests for domain rules and policy predicates.
- Contract tests for schema and plugin/runtime interfaces.
- Integration tests for pipeline stage interactions.
- End-to-end tests for rendered UI JSON outcomes.
- Resilience and chaos tests for failure containment.

## Core Suites
- Domain model invariant tests.
- Authorization and policy regression tests.
- Multi-tenant isolation tests.
- Feature flag evaluation tests.
- Plugin isolation and capability enforcement tests.
- Caching correctness and staleness tests.
- Performance tests (p95, p99 latency and throughput).

## Environment Strategy
- Local deterministic test fixtures.
- Ephemeral CI environments for integration and e2e.
- Staging parity environment for pre-prod validation.

## Release Gates
- Required pass for critical suites.
- No open critical security findings.
- SLO regression checks before production rollout.

## Evidence
- Store test artifacts with build metadata.
- Track flaky tests and enforce remediation SLAs.
