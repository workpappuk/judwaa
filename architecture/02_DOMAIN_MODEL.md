# Domain Model

## Purpose
Define the core entities and value objects that represent UI composition, routing, policy, data dependencies, and runtime context.

## Ubiquitous Language
- Application: Top-level product surface composed of routes and node trees.
- Route: Addressable entry point resolved from request context.
- Node: Declarative UI metadata unit.
- NodeTree: Ordered composition graph rooted at a page node.
- RenderContext: Immutable request-scoped runtime envelope.
- PolicyBinding: Declarative authorization attachment for route, node, or data scope.
- DataBinding: Declarative data dependency attached to nodes.

## Core Aggregates

### Application (Aggregate Root)
- Identity: ApplicationId, Version.
- Contains: Route definitions, default configuration profile references.
- Invariants:
	- Application version must reference compatible route schema versions.
	- Routes within an application must have unique route keys.

### Route (Aggregate Root)
- Identity: RouteId, RouteKey.
- Contains: Route metadata, root NodeTree reference, policy bindings.
- Invariants:
	- Route must resolve to exactly one root NodeTree.
	- Route policy bindings must be valid for declared actions.

### NodeTree (Aggregate Root)
- Identity: NodeTreeId, SchemaVersion.
- Contains: Root Node and child composition graph.
- Invariants:
	- Tree must be acyclic.
	- Child node type must be allowed by parent composition rules.

### Node (Entity)
- Identity: NodeId, NodeType.
- Contains: Props, children, data bindings, policy bindings, feature flag references.
- Invariants:
	- Node type contract must validate against schema version.
	- Node cannot declare undeclared or unknown capabilities.

### ConfigurationProfile (Aggregate Root)
- Identity: ConfigurationProfileId, Version.
- Contains: Layered key/value settings, environment and tenant overlays.
- Invariants:
	- Resolved profile must produce deterministic output for same inputs.

### FeatureFlagSet (Aggregate Root)
- Identity: FeatureFlagSetId, Version.
- Contains: Flag definitions, targeting and rollout rules.
- Invariants:
	- Every flag has owner and expiry metadata.

### LocalizationBundle (Aggregate Root)
- Identity: LocalizationBundleId, Locale, Version.
- Contains: Localized resources and fallback rules.
- Invariants:
	- Missing key fallback path must be explicit.

### PluginDescriptor (Aggregate Root)
- Identity: PluginId, PluginVersion, TrustTier.
- Contains: Capability declarations, execution limits, compatibility ranges.
- Invariants:
	- Declared capabilities must be authorized by trust tier policy.

## Supporting Entities and Value Objects
- DataBinding: ProviderId, QueryTemplate, TransformKey.
- PolicyBinding: PolicyId, Scope, ActionSet.
- CapabilityGrant: CapabilityName, Scope, ConstraintSet.
- TenantContext: TenantId, Environment, Entitlements.
- IdentityContext: SubjectId, Roles, Attributes.
- VersionRange: MinVersion, MaxVersion.

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
- All externalized contracts are versioned and validated at publish and runtime boundaries.
- Cross-tenant data access is denied by default.

## Aggregate Relationships
- Application references many Routes.
- Route references one NodeTree.
- NodeTree contains many Nodes.
- Node references zero or more DataBindings and PolicyBindings.
- RenderContext references TenantContext, IdentityContext, resolved ConfigurationProfile, and FeatureFlagSet.
- PluginDescriptor references capability constraints applied during plugin invocation.

## Domain Services
- CompositionService: Resolves route to node tree and applies composition rules.
- PolicyService: Evaluates policy bindings with deny-first semantics.
- DataResolutionService: Resolves declared data dependencies deterministically.
- ConfigurationResolutionService: Resolves layered configuration and feature flags.
- PluginExecutionService: Executes plugins under isolation and capability enforcement.

## Domain Events
- RouteResolved
- TreeResolved
- PolicyEvaluated
- DataResolved
- PluginInvoked
- PluginRejected
- RenderCompleted
- RenderFailed

## Bounded Context Alignment
- Composition Context: Application, Route, NodeTree, Node.
- Policy and Authorization Context: PolicyBinding, decision outcomes.
- Data Orchestration Context: DataBinding and provider contracts.
- Configuration Context: ConfigurationProfile and FeatureFlagSet.
- Plugin Runtime Context: PluginDescriptor and capability controls.

## Lifecycle
1. Author metadata.
2. Validate schema and capabilities.
3. Publish version.
4. Resolve at request time.
5. Observe and audit outcomes.

## Open Questions
- Which entities require event-sourced history?
- What is the canonical metadata storage model?
