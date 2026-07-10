# C4 Diagrams

## Purpose
Provide aligned C4 views for context, containers, components, and code-level structure.

## Level 1: System Context
```mermaid
flowchart LR
  EndUser[End User]
  Admin[Platform Admin]
  Frontend[Frontend Renderer]
  Platform[UI Composition Platform]
  IdP[Identity Provider]
  Services[Business Services]

  EndUser --> Frontend
  Admin --> Platform
  Frontend --> Platform
  Platform --> IdP
  Platform --> Services
```

## Level 2: Container Diagram
```mermaid
flowchart TB
  FE[Frontend Renderer]
  API[Gateway and BFF API]
  Compose[Composition Engine]
  Policy[Policy and Permission Engines]
  Data[Data and API Orchestration Engines]
  Config[Configuration and Feature Flag Engine]
  EventBus[Event Bus]
  Cache[Cache Layer]
  Store[Metadata and Config Store]
  Obs[Observability Stack]

  FE --> API
  API --> Compose
  Compose --> Policy
  Compose --> Config
  Compose --> Data
  Data --> Cache
  Data --> Store
  Compose --> EventBus
  Data --> EventBus
  API --> Obs
  Compose --> Obs
  Policy --> Obs
  Data --> Obs
```

## Level 3: Component Diagram (Backend)
```mermaid
flowchart LR
  Req[Request Handler] --> Auth[Auth Adapter]
  Auth --> RC[RenderContext Builder]
  RC --> Route[Route Resolver]
  Route --> Tree[Component Tree Resolver]
  Tree --> PE[Policy Evaluator]
  PE --> CE[Config Resolver]
  CE --> DE[Data Resolver]
  DE --> PX[Plugin Executor]
  PX --> SZ[UI Serializer]
  SZ --> Resp[Response Writer]
```

## Level 4: Code Diagram (Illustrative Package View)
```mermaid
flowchart TB
  subgraph api
    controller[RenderController]
    middleware[AuthMiddleware]
  end

  subgraph application
    pipeline[RenderPipeline]
    commands[RenderCommand]
  end

  subgraph domain
    model[Node Route Policy DataBinding]
    services[PolicyService CompositionService]
  end

  subgraph infrastructure
    repo[MetadataRepository]
    plugins[PluginRuntime]
    events[EventPublisher]
    telemetry[TelemetryAdapter]
  end

  controller --> pipeline
  pipeline --> services
  services --> model
  pipeline --> plugins
  pipeline --> events
  services --> repo
  pipeline --> telemetry
```

## Diagram Maintenance Rules
- Update diagrams when engine boundaries or stage ordering changes.
- Include version/date metadata in pull requests touching architecture.
- Keep names consistent with ADR and domain model documents.
