# Event Model

## Objective
Use events to decouple core engines, extension points, and cross-cutting concerns.

## Event Categories
- Lifecycle events (request started/completed).
- Pipeline events (stage entered/exited/failed).
- Domain events (route resolved, policy evaluated, data resolved).
- Governance events (configuration published, plugin registered).

## Event Bus Topology
- In-process event dispatcher for low-latency lifecycle hooks.
- Durable message bus for asynchronous domain and governance events.
- Separate topics/streams for:
	- Pipeline telemetry events.
	- Domain business events.
	- Governance and audit events.
- Tenant-aware partitioning strategy for scale and isolation.

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

## Ordering and Consistency
- Preserve per-correlation ordering for pipeline events when required.
- Preserve per-aggregate ordering for domain events where consistency is required.
- Use outbox pattern for reliable publish from state-changing operations.

## Reliability
- Dead-letter handling.
- Retry policies.
- Consumer observability and lag tracking.
- Poison message quarantine and remediation workflow.
- Replay support for diagnostics and recovery use cases.
