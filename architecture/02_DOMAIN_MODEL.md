# Domain Model

## Purpose
Define the core entities and value objects that represent UI composition, routing, policy, data dependencies, and runtime context.

## Core Aggregates
- Application
- Route
- NodeTree
- Node
- PolicyBinding
- DataBinding
- ConfigurationProfile
- FeatureFlagSet
- LocalizationBundle

## Shared Value Objects
- NodeId
- NodeType
- TenantId
- Locale
- RenderContextId
- Version
- Capability

## Invariants
- RenderContext is immutable after construction.
- Node definitions are declarative metadata.
- Runtime evaluation must not mutate source metadata.
- Authorization and policy checks are deterministic for a given context.

## Lifecycle
1. Author metadata.
2. Validate schema and capabilities.
3. Publish version.
4. Resolve at request time.
5. Observe and audit outcomes.

## Open Questions
- Which entities require event-sourced history?
- What is the canonical metadata storage model?
