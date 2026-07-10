# Component Model

## Purpose
Define how UI components are represented as backend metadata Nodes.

## Node Taxonomy
- Structural: Page, Section, Layout, Grid.
- Informational: Text, Metric, Badge.
- Interactive descriptors: Action, Form, WorkflowTrigger.
- Data visualization: Chart, Table, Timeline.

## Node Contract
- `id`, `type`, `version`.
- `props` (render metadata only).
- `children`.
- `dataDependencies`.
- `policyBindings`.
- `featureFlags`.

## Composition Rules
- Nodes are declarative.
- No imperative UI logic in node definitions.
- Child composition validated by schema and capabilities.

## Validation
- Schema validation by Node type.
- Cross-node reference integrity checks.
- Policy/data dependency declaration checks.
