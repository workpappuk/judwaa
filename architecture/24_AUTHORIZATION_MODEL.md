# Authorization Model

## Goal
Provide unified authorization semantics across routes, components, data, and plugin capabilities.

## Model
- Subject: user, service account, or system actor.
- Resource: route, node, data source, or plugin capability.
- Action: view, execute, mutate, administer.
- Context: tenant, environment, feature flags, locale, risk score.

## Strategy
- Deny by default.
- Policy-based authorization with optional role and attribute inputs.
- Contextual and conditional access support.

## Authorization Scopes
- Route scope.
- Component scope.
- Data dependency scope.
- Plugin capability scope.

## Decision Contracts
- Decision ID.
- Outcome.
- Reason codes.
- Applicable obligations.
- Correlation ID and tenant ID.

## Governance
- Version policy definitions.
- Require audit trails for policy changes.
- Regular policy simulation tests before deployment.
