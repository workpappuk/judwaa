# Security Model

## Security Goals
- Enforce least privilege.
- Protect tenant boundaries.
- Ensure deterministic authorization.
- Preserve data confidentiality and integrity.

## Control Planes
- Authentication plane.
- Policy and permission plane.
- Data access plane.
- Configuration and secrets plane.

## Authorization Model
- Policy-based access control.
- Permission evaluation at route, node, and data levels.
- Deny-by-default policy stance.

## Sensitive Data Handling
- Encrypt data in transit and at rest.
- Strict secret management with rotation.
- Field-level protection where required.

## Auditing and Forensics
- Immutable security audit logs.
- Correlation IDs across all security decisions.
- Alerting on policy anomalies and repeated denials.

## Threat Review
Run regular threat modeling for:
- Plugin execution paths.
- Cross-tenant access risks.
- Metadata tampering.
