export type NocodeFieldType = "text" | "email" | "number" | "date" | "textarea" | "select";

export type NocodeField = {
  id: string;
  name: string;
  label: string;
  type: NocodeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

export type NocodeComponentType = "heading" | "paragraph" | "stats" | "table" | "form";

export type NocodeComponent = {
  id: string;
  type: NocodeComponentType;
  title?: string;
  content?: string;
  fields?: NocodeField[];
  columns?: string[];
  rows?: Record<string, string>[];
  stats?: Array<{
    label: string;
    value: string;
    delta?: string;
  }>;
};

export type NocodeSection = {
  id: string;
  title: string;
  description?: string;
  components: NocodeComponent[];
};

export type NocodePage = {
  id: string;
  slug: string;
  title: string;
  route: string;
  description?: string;
  sections: NocodeSection[];
};

export type NocodeMenuItem = {
  id: string;
  label: string;
  pageSlug: string;
};

export type NocodeTheme = {
  brand: string;
  accent: string;
  soft: string;
};

export type NocodeMetadataVersion = {
  versionId: string;
  versionNumber: number;
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  previousVersionId?: string;
};

export type NocodeApplication = {
  id: string;
  slug: string;
  name: string;
  domain: string;
  version: number;
  status: "draft" | "published";
  description: string;
  metadataVersion: NocodeMetadataVersion;
  menu: NocodeMenuItem[];
  theme: NocodeTheme;
  pages: NocodePage[];
};

export type NocodeDomain = {
  id: string;
  slug: string;
  name: string;
  description: string;
  activeApplications: number;
};

export type CompanyOnboardingStatus = "invited" | "in-progress" | "completed";

export type CompanyOnboarding = {
  id: string;
  companyName: string;
  domainSlug: string;
  tenantCode: string;
  status: CompanyOnboardingStatus;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  employeeRange?: "1-50" | "51-200" | "201-1000" | "1000+";
  implementationTimeline?: "immediate" | "30-days" | "90-days" | "exploring";
  primaryUseCase?: string;
  integrationNeeds?: string;
  migrationRequired?: boolean;
  onboardedAt?: string;
};

export type NocodeOnboardingSummary = {
  totalDomains: number;
  totalCompanies: number;
  byStatus: Record<CompanyOnboardingStatus, number>;
  byDomain: Array<{
    domainSlug: string;
    companies: number;
  }>;
};

export type SelfServeOnboardingInput = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  domainSlug: string;
  employeeRange: "1-50" | "51-200" | "201-1000" | "1000+";
  implementationTimeline: "immediate" | "30-days" | "90-days" | "exploring";
  primaryUseCase: string;
  integrationNeeds: string;
  migrationRequired: boolean;
  acceptedTerms: boolean;
};
