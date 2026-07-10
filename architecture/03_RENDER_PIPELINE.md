# Render Pipeline

## Goal
Transform an authenticated request into a policy-compliant UI JSON payload.

## Stages
1. Request intake and correlation setup.
2. Authentication and identity enrichment.
3. Immutable RenderContext creation.
4. Application and route resolution.
5. Component tree resolution.
6. Policy and permission evaluation.
7. Layered configuration resolution.
8. Data dependency resolution.
9. Plugin execution.
10. UI serialization.
11. Response emission and telemetry flush.

## Stage Contracts
Each stage must define:
- Input contract.
- Output contract.
- Failure modes.
- Latency budget.
- Observability events.

## Error Handling
- Fail closed for policy failures.
- Return typed, user-safe errors.
- Include correlation IDs for traceability.

## Performance Targets
- p95 end-to-end render latency.
- Per-stage p95 and p99 latency.
- Cache hit ratio by stage.
