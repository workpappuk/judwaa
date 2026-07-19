import { mockApplications } from "./mock-metadata";
import { getNocodeCollection } from "./mongo";
import { companyOnboardings, nocodeDomains } from "./scaling-data";
import { CompanyOnboardingSchema, CompanyOnboardingsSchema, NocodeApplicationsSchema, NocodeDomainsSchema, NocodeOnboardingSummarySchema, SelfServeOnboardingInputSchema } from "./schema";
import type { CompanyOnboarding, NocodeApplication, NocodeDomain, NocodeOnboardingSummary, NocodePage, SelfServeOnboardingInput } from "./types";

const deepClone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

const validatedApplications: NocodeApplication[] = NocodeApplicationsSchema.parse(mockApplications);
const validatedDomains: NocodeDomain[] = NocodeDomainsSchema.parse(nocodeDomains);
const validatedCompanyOnboardings: CompanyOnboarding[] = CompanyOnboardingsSchema.parse(companyOnboardings);
const COMPANY_ONBOARDINGS_COLLECTION = "company_onboardings";

let onboardingSeedPromise: Promise<void> | null = null;

const getCompanyOnboardingsCollection = async () => {
  return getNocodeCollection<CompanyOnboarding>(COMPANY_ONBOARDINGS_COLLECTION);
};

const ensureCompanyOnboardingsSeeded = async (): Promise<void> => {
  if (!onboardingSeedPromise) {
    onboardingSeedPromise = (async () => {
      const collection = await getCompanyOnboardingsCollection();
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ domainSlug: 1 });

      const existing = await collection.estimatedDocumentCount();
      if (existing > 0) {
        return;
      }

      await collection.insertMany(validatedCompanyOnboardings, { ordered: false });
    })().catch((error) => {
      onboardingSeedPromise = null;
      throw error;
    });
  }

  await onboardingSeedPromise;
};

const sanitizeCompanyOnboarding = (record: CompanyOnboarding & { _id?: unknown }): CompanyOnboarding => {
  const withoutMongoId = { ...record };
  delete withoutMongoId._id;

  const normalized = Object.fromEntries(
    Object.entries(withoutMongoId).map(([key, value]) => [key, value === null ? undefined : value]),
  );

  return CompanyOnboardingSchema.parse(normalized);
};

export const listApplications = async (): Promise<NocodeApplication[]> => {
  return deepClone(validatedApplications);
};

export const findApplication = async (appSlug: string): Promise<NocodeApplication | null> => {
  const app = validatedApplications.find((candidate) => candidate.slug === appSlug);
  return app ? deepClone(app) : null;
};

export const findPage = async (appSlug: string, pageSlug: string): Promise<NocodePage | null> => {
  const app = validatedApplications.find((candidate) => candidate.slug === appSlug);
  if (!app) {
    return null;
  }

  const page = app.pages.find((candidate) => candidate.slug === pageSlug);
  return page ? deepClone(page) : null;
};

export const listDomains = async (): Promise<NocodeDomain[]> => {
  return deepClone(validatedDomains);
};

export const listCompanyOnboardings = async (options?: { domainSlug?: string; limit?: number; offset?: number }): Promise<CompanyOnboarding[]> => {
  await ensureCompanyOnboardingsSeeded();

  const collection = await getCompanyOnboardingsCollection();
  const filter = options?.domainSlug ? { domainSlug: options.domainSlug } : {};

  const offset = options?.offset ?? 0;
  const query = collection.find(filter).skip(offset);

  if (typeof options?.limit === "number") {
    query.limit(options.limit);
  }

  const companies = await query.toArray();
  const validated = companies.map((company) => sanitizeCompanyOnboarding(company));

  return deepClone(validated);
};

export const getOnboardingSummary = async (): Promise<NocodeOnboardingSummary> => {
  await ensureCompanyOnboardingsSeeded();

  const companies = await listCompanyOnboardings();

  const byStatus: NocodeOnboardingSummary["byStatus"] = {
    invited: 0,
    "in-progress": 0,
    completed: 0,
  };

  for (const company of companies) {
    byStatus[company.status] += 1;
  }

  const byDomain = validatedDomains.map((domain) => ({
    domainSlug: domain.slug,
    companies: companies.filter((company) => company.domainSlug === domain.slug).length,
  }));

  const summary = {
    totalDomains: validatedDomains.length,
    totalCompanies: companies.length,
    byStatus,
    byDomain,
  };

  return deepClone(NocodeOnboardingSummarySchema.parse(summary));
};

export const createSelfServeOnboarding = async (input: SelfServeOnboardingInput): Promise<CompanyOnboarding> => {
  await ensureCompanyOnboardingsSeeded();

  const payload = SelfServeOnboardingInputSchema.parse(input);

  const domain = validatedDomains.find((candidate) => candidate.slug === payload.domainSlug);
  if (!domain) {
    throw new Error("Invalid domain selected for onboarding.");
  }

  const collection = await getCompanyOnboardingsCollection();
  const totalCompanies = await collection.estimatedDocumentCount();
  const nextSequence = totalCompanies + 1;
  const nextId = `company-${String(nextSequence).padStart(3, "0")}`;
  const tenantCode = `TNT${String(nextSequence).padStart(3, "0")}`;

  const created = CompanyOnboardingSchema.parse({
    id: nextId,
    companyName: payload.companyName,
    domainSlug: payload.domainSlug,
    tenantCode,
    status: "invited",
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    country: payload.country,
    employeeRange: payload.employeeRange,
    implementationTimeline: payload.implementationTimeline,
    primaryUseCase: payload.primaryUseCase,
    integrationNeeds: payload.integrationNeeds,
    migrationRequired: payload.migrationRequired,
  });

  await collection.insertOne(created);

  return deepClone(sanitizeCompanyOnboarding(created));
};
