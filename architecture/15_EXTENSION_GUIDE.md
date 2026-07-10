# Extension Guide

## Goal
Provide a consistent process for adding new capabilities without breaking core platform guarantees.

## Extension Paths
- New plugin type.
- New pipeline stage.
- New node schema/type.
- New data provider.
- New policy evaluator.

## Required Checklist
1. Define capability and boundaries.
2. Publish contract and schema.
3. Add versioning and compatibility metadata.
4. Add observability hooks.
5. Add security and tenant isolation validation.
6. Add rollback strategy.

## Delivery Workflow
1. Design proposal (ADR).
2. Contract tests and negative tests.
3. Staged rollout (ring or tenant-based).
4. Post-release monitoring and review.

## Do Not
- Embed business logic in frontend renderer.
- Bypass policy/permission engines.
- Introduce mutable global request state.

## Plugin Governance References
- 16_PLUGIN_TRUST_TIERS_AND_APPROVAL.md
- 17_PLUGIN_SECURITY_SCANNING.md
- 18_PLUGIN_SDK_WRAPPERS.md
