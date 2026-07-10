# Platform Constitution

## Vision
Build a backend-driven UI Composition Platform where the backend owns composition, routing, authorization, data orchestration, configuration, localization, and feature flags. The frontend is a render-only engine.

## Core Principles
1. Backend-first; UI contains no business logic.
2. Everything is metadata.
3. Everything is a Node (Page, Header, Grid, Card, Chart, etc.).
4. Components describe themselves; they never render themselves.
5. Components declare data dependencies; they never call APIs directly.
6. Authorization is enforced by Policy/Permission engines.
7. RenderContext is immutable.
8. Prefer Engines over God Services.
9. Everything flows through a pipeline.
10. Everything is pluggable.
11. Prefer composition over inheritance.
12. Immutable domain objects.
13. Event-driven extension points.
14. Layered configuration.
15. Capabilities instead of application-specific assumptions.

## Render Pipeline
HTTP Request -> Authentication -> Build immutable RenderContext -> Resolve Application -> Resolve Route -> Resolve Component Tree -> Evaluate Policies -> Resolve Configuration -> Resolve Data -> Apply Plugins -> Serialize UI JSON -> Frontend Renderer

## Engines
- Composition Engine
- Permission Engine
- Policy Engine
- Data Engine
- API Orchestration Engine
- Theme Engine
- Localization Engine
- Navigation Engine
- Configuration Engine
- Validation Engine
- Workflow Engine
- Event Engine
- Cache Engine

## Coding Checklist
Before implementing any feature:
- Is it metadata?
- Is it immutable?
- Can it be a plugin?
- Can it be a strategy?
- Can it be an event?
- Can it be a pipeline stage?
- Is it versionable?
- Is it tenant-aware?
- Is it observable?
- Does it keep the UI dumb?
