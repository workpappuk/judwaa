# Event Model

## Objective
Use events to decouple core engines, extension points, and cross-cutting concerns.

## Event Categories
- Lifecycle events (request started/completed).
- Pipeline events (stage entered/exited/failed).
- Domain events (route resolved, policy evaluated, data resolved).
- Governance events (configuration published, plugin registered).

## Event Contract
- Event name and version.
- Occurred-at timestamp.
- Correlation and causation IDs.
- Tenant and actor context.
- Typed payload schema.

## Delivery Model
- In-process for low-latency hooks.
- Asynchronous bus for integrations and analytics.
- At-least-once semantics with idempotent consumers.

## Reliability
- Dead-letter handling.
- Retry policies.
- Consumer observability and lag tracking.
