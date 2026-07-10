# Policy Engine

## Purpose
Evaluate policy decisions across route, component, data, and plugin operations.

## Responsibilities
- Resolve applicable policies for current context.
- Evaluate policy predicates deterministically.
- Return allow, deny, or conditional outcomes.
- Emit explanation and audit metadata.

## Inputs
- RenderContext (identity, tenant, locale, environment).
- Requested action and target resource.
- Relevant route, node, data dependency, and plugin metadata.

## Outputs
- Decision outcome.
- Decision reason codes.
- Obligations (for example mask fields, require step-up auth).
- Audit event payload.

## Evaluation Model
1. Gather policy set by scope.
2. Evaluate deny rules first.
3. Evaluate explicit allow rules.
4. Apply obligations.
5. Return decision with trace metadata.

## Requirements
- Fail closed on uncertainty or dependency failure.
- Deterministic for identical inputs.
- Latency budget enforced per request.

## Integration Points
- Render pipeline stage for policy checks.
- Data engine gating for provider access.
- Plugin runtime gating for capability use.
