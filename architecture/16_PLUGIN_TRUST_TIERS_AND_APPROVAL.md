# Plugin Trust Tiers and Approval Workflow

## Purpose
Define deterministic trust levels and approval gates for plugin onboarding, rollout, and runtime permissions.

## Trust Tiers

### Tier 0: Platform Core (Highest Trust)
- Owner: Platform team only.
- Source: First-party repository and signed release pipeline.
- Permissions: May request mutating capabilities and privileged integrations.
- Requirements: Full architecture review, security sign-off, and release manager approval.

### Tier 1: Internal Verified
- Owner: Internal product or domain teams.
- Source: First-party repository or approved internal artifact registry.
- Permissions: Read-only by default; mutating permissions require explicit exception.
- Requirements: Automated checks pass, threat checklist complete, one security reviewer approval.

### Tier 2: Partner Verified
- Owner: Trusted partner/vendor teams.
- Source: Approved partner registry and signed artifacts.
- Permissions: Read-only only in initial rollout; mutating permissions prohibited unless exceptional approval is granted.
- Requirements: Extended due diligence, SBOM verification, legal/compliance approval, security approval.

### Tier 3: Experimental Sandbox (Lowest Trust)
- Owner: Any approved developer/team for experimentation.
- Source: Non-production experimental registries.
- Permissions: Strict read-only and sandbox-only.
- Requirements: Runs only in isolated non-production environments with no production data access.

## Capability Matrix by Tier
- Tier 0: Read + approved mutate + approved outbound network destinations.
- Tier 1: Read + limited mutate by exception + allowlisted outbound network.
- Tier 2: Read-only + strict egress allowlist.
- Tier 3: Read-only + no external egress by default.

## Approval Workflow
1. Submission:
   - Plugin manifest submitted with owner, tier request, capabilities, data access scope, and rollout plan.
2. Automated Gate:
   - Manifest validation, dependency and license checks, static security scans, signature verification.
3. Security Review:
   - Threat checklist review, secret handling review, tenant-isolation validation.
4. Platform Review:
   - Contract compatibility, performance budget, observability conformance.
5. Decision:
   - Approve, approve with constraints, or reject with remediation requirements.
6. Signing and Registration:
   - Approved artifact signed and registered with tier tag and capability policy.
7. Progressive Rollout:
   - Development -> staging -> production ring rollout by tenant allowlist.

## Runtime Enforcement
- Runtime checks validate plugin signature, tier, and capability grants on every invocation.
- Invocation denied if tier policy and requested action do not match.
- Emergency kill switch supports plugin-level and tier-level disablement.

## Governance and Recertification
- Tier 1 and Tier 2 plugins require periodic recertification every 90 days.
- Recertification includes updated scan results, dependency freshness, and operational health review.
- Tier downgrade is mandatory when policy violations or repeated incidents occur.

## Required Artifacts
- Plugin manifest.
- Security assessment checklist.
- Capability request and justification.
- Rollout and rollback plan.
- Owner escalation contacts.
