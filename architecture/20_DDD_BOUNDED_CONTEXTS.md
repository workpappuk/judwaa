# DDD Bounded Contexts

## Purpose
Define bounded contexts, ownership boundaries, and context mapping for the platform domain.

## Bounded Contexts

### Composition Context
- Owns: Application, Route, NodeTree, Node composition rules.
- Publishes: RouteResolved, TreeResolved events.
- Depends on: Policy, Configuration, Data contexts.

### Policy and Authorization Context
- Owns: Policies, permissions, policy evaluation outcomes.
- Publishes: PolicyEvaluated, AccessDenied events.
- Depends on: Identity and tenant context.

### Configuration and Feature Flag Context
- Owns: Layered config profiles, feature flag definitions, rollout rules.
- Publishes: ConfigPublished, FlagRolloutChanged events.

### Data Orchestration Context
- Owns: Data dependency graph, provider orchestration, response shaping.
- Publishes: DataResolved, ProviderFailed events.

### Plugin Runtime Context
- Owns: Plugin lifecycle, capability grants, isolation enforcement.
- Publishes: PluginInvoked, PluginRejected, PluginFailed events.

### Observability Context
- Owns: Telemetry schema, trace conventions, diagnostics aggregation.
- Consumes all platform events.

## Context Map
- Composition is the orchestrating context.
- Policy is an upstream gatekeeper for Composition and Data.
- Configuration is an upstream provider for Composition and Data.
- Data is a downstream provider for Composition.
- Plugin Runtime is a supporting context around pipeline stages.
- Observability is a shared kernel for telemetry contracts.

## Anti-Corruption Rules
- External APIs and partner plugins must pass through typed adapters.
- No direct dependency from frontend renderer to internal domain entities.
- Cross-context communication should occur through events or explicit contracts.

## Ownership Rules
- One owning team per bounded context.
- Shared contracts versioned and reviewed via ADR if breaking.
- Cross-context behavior changes require compatibility tests.
