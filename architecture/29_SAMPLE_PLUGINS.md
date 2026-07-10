# Sample Plugins

## Purpose
Provide reference plugin patterns aligned with capability, isolation, and observability rules.

## Sample 1: Node Decoration Plugin
- Capability: `node.decorate`
- Behavior: Adds non-sensitive badge metadata to specific node types.
- Constraints: Read-only input, no outbound network.

## Sample 2: Data Enrichment Plugin
- Capability: `data.enrich.read`
- Behavior: Enriches data payload with derived fields from approved provider.
- Constraints: Strict output schema validation, per-call timeout.

## Sample 3: Localization Transform Plugin
- Capability: `content.localize`
- Behavior: Applies locale-aware text substitutions after data resolution.
- Constraints: No policy bypass, tenant locale scope enforced.

## Sample 4: Telemetry Annotation Plugin
- Capability: `telemetry.annotate`
- Behavior: Adds controlled dimensions for diagnostic events.
- Constraints: PII-safe annotations only.

## Required Structure
- Manifest with tier, capabilities, and resource budgets.
- SDK wrapper usage for validation and telemetry.
- Contract tests and security scan baseline.
