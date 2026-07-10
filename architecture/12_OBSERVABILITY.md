# Observability

## Purpose
Make platform behavior explainable, measurable, and debuggable across all engines and tenants.

## Signals
- Metrics: latency, throughput, error rate, saturation.
- Logs: structured, correlated, and policy-safe.
- Traces: end-to-end and per-stage spans.
- Events: domain and pipeline milestones.

## Standards
- Correlation ID required in every stage.
- Tenant ID tagging required on all telemetry.
- Stable event and metric naming conventions.

## Dashboards and Alerts
- Render pipeline SLO dashboard.
- Policy decision anomaly alerts.
- Data provider degradation alerts.
- Plugin failure rate alerts.

## Incident Readiness
- Runbooks per engine.
- Golden signals by stage.
- Fast triage views by tenant, route, and component.
