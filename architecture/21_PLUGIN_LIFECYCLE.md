# Plugin Lifecycle

## Lifecycle States
1. Draft
2. Submitted
3. Validated
4. Approved
5. Signed
6. Registered
7. Deployed
8. Active
9. Suspended
10. Deprecated
11. Retired

## Lifecycle Flow
- Draft -> Submitted by plugin owner.
- Submitted -> Validated after automated checks.
- Validated -> Approved by security and platform reviewers.
- Approved -> Signed with trusted key.
- Signed -> Registered in plugin catalog.
- Registered -> Deployed progressively by tenant ring.
- Active -> Suspended if health or policy violations occur.
- Suspended -> Active after remediation and re-approval.
- Active -> Deprecated with migration notice.
- Deprecated -> Retired after deprecation window.

## Required Gates
- Manifest and schema validation.
- Compatibility check against platform and SDK versions.
- Static and dynamic security scans.
- Observability conformance check.
- Rollback readiness validation.

## Operational Rules
- Every plugin has an owner and escalation contact.
- Emergency kill switch available at plugin and tier levels.
- Runtime limits and capability checks enforced at each invocation.
