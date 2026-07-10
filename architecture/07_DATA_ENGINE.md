# Data Engine

## Purpose
Resolve declared component data dependencies in a secure, observable, and cache-aware manner.

## Responsibilities
- Resolve dependency graph per request.
- Execute data fetch plans with policy guardrails.
- Normalize and shape data for UI JSON serialization.
- Apply retries, timeouts, and circuit breakers.

## Data Dependency Model
- Components declare `dataDependencies`.
- Dependencies resolve through named providers.
- Providers expose typed contracts and capability metadata.

## Execution Strategy
- Topological resolution of dependency graph.
- Parallel fetch where dependencies permit.
- Deterministic merge order.

## Resilience
- Per-provider failure policies.
- Partial data support when explicitly allowed.
- Stale-while-revalidate for selected datasets.

## Observability
- Provider-level latency and error metrics.
- Data dependency graph diagnostics.
- Correlation IDs carried through all provider calls.
