# Versioning

## Purpose
Define versioning strategy for metadata, APIs, plugins, and platform contracts.

## Principles
- Use semantic versioning for public contracts.
- Prefer additive changes for backward compatibility.
- Deprecate before removal with clear timelines.

## Versioned Artifacts
- Node schemas.
- Render pipeline contracts.
- Plugin interfaces.
- Data provider contracts.
- Configuration schemas.

## Compatibility Policy
- Major: breaking changes.
- Minor: backward-compatible features.
- Patch: backward-compatible fixes.

## Upgrade Playbook
1. Publish compatibility notes.
2. Validate with contract tests.
3. Roll out by tenant or environment rings.
4. Monitor and rollback if required.
