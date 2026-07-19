import type { CompanyOnboarding, CompanyOnboardingStatus, NocodeDomain } from "./types";

export const nocodeDomains: NocodeDomain[] = [
  { id: "d-01", slug: "hr", name: "Human Resources", description: "Onboarding, leave, and people operations.", activeApplications: 1 },
  { id: "d-02", slug: "crm", name: "CRM", description: "Lead lifecycle and opportunity tracking.", activeApplications: 1 },
  { id: "d-03", slug: "trade-finance", name: "Trade Finance", description: "LC workflow and document handling.", activeApplications: 0 },
  { id: "d-04", slug: "procurement", name: "Procurement", description: "Vendor, RFQ, and purchase approvals.", activeApplications: 0 },
  { id: "d-05", slug: "vendor-management", name: "Vendor Management", description: "Onboarding and performance controls.", activeApplications: 0 },
  { id: "d-06", slug: "asset-management", name: "Asset Management", description: "Asset lifecycle and maintenance workflows.", activeApplications: 0 },
  { id: "d-07", slug: "compliance", name: "Compliance", description: "Policy, controls, and audit checks.", activeApplications: 0 },
  { id: "d-08", slug: "customer-onboarding", name: "Customer Onboarding", description: "KYC and account setup journey.", activeApplications: 0 },
  { id: "d-09", slug: "lms", name: "Learning Management", description: "Academic operations and enrollment.", activeApplications: 0 },
  { id: "d-10", slug: "incentive", name: "Incentive Management", description: "Rule-based incentive calculations.", activeApplications: 0 },
];

const onboardingStatuses: CompanyOnboardingStatus[] = ["invited", "in-progress", "completed"];

const padded = (value: number): string => value.toString().padStart(3, "0");

export const companyOnboardings: CompanyOnboarding[] = Array.from({ length: 500 }, (_, index) => {
  const serial = index + 1;
  const domain = nocodeDomains[index % nocodeDomains.length];
  const status = onboardingStatuses[index % onboardingStatuses.length];

  const onboardedAt =
    status === "completed"
      ? `2026-07-${String((index % 28) + 1).padStart(2, "0")}T10:00:00.000Z`
      : undefined;

  return {
    id: `company-${padded(serial)}`,
    companyName: `Company ${padded(serial)}`,
    domainSlug: domain.slug,
    tenantCode: `TNT${padded(serial)}`,
    status,
    onboardedAt,
  };
});
