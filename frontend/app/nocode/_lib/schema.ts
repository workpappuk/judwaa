import { z } from "zod";

export const NocodeFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "number", "date", "textarea", "select"]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string().min(1)).optional(),
  defaultValue: z.string().optional(),
});

export const NocodeComponentSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["heading", "paragraph", "stats", "table", "form"]),
  title: z.string().optional(),
  content: z.string().optional(),
  fields: z.array(NocodeFieldSchema).optional(),
  columns: z.array(z.string().min(1)).optional(),
  rows: z.array(z.object({}).catchall(z.string())).optional(),
  stats: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        delta: z.string().optional(),
      }),
    )
    .optional(),
});

export const NocodeSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  components: z.array(NocodeComponentSchema),
});

export const NocodePageSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  route: z.string().startsWith("/nocode/"),
  description: z.string().optional(),
  sections: z.array(NocodeSectionSchema),
});

export const NocodeMenuItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  pageSlug: z.string().min(1),
});

export const NocodeThemeSchema = z.object({
  brand: z.string().min(1),
  accent: z.string().min(1),
  soft: z.string().min(1),
});

export const NocodeMetadataVersionSchema = z.object({
  versionId: z.string().min(1),
  versionNumber: z.number().int().positive(),
  schemaVersion: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  publishedAt: z.string().datetime({ offset: true }).optional(),
  previousVersionId: z.string().min(1).optional(),
});

export const NocodeApplicationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(1),
  version: z.number().int().positive(),
  status: z.enum(["draft", "published"]),
  description: z.string().min(1),
  metadataVersion: NocodeMetadataVersionSchema,
  menu: z.array(NocodeMenuItemSchema),
  theme: NocodeThemeSchema,
  pages: z.array(NocodePageSchema),
});

export const NocodeApplicationsSchema = z.array(NocodeApplicationSchema);

export const NocodeDomainSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  activeApplications: z.number().int().nonnegative(),
});

export const NocodeDomainsSchema = z.array(NocodeDomainSchema);

export const CompanyOnboardingStatusSchema = z.enum(["invited", "in-progress", "completed"]);

export const CompanyOnboardingSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().min(1),
  domainSlug: z.string().min(1),
  tenantCode: z.string().min(1),
  status: CompanyOnboardingStatusSchema,
  contactName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(7).max(24).optional(),
  country: z.string().min(2).max(80).optional(),
  employeeRange: z.enum(["1-50", "51-200", "201-1000", "1000+"]).optional(),
  implementationTimeline: z.enum(["immediate", "30-days", "90-days", "exploring"]).optional(),
  primaryUseCase: z.string().min(5).max(500).optional(),
  integrationNeeds: z.string().min(5).max(500).optional(),
  migrationRequired: z.boolean().optional(),
  onboardedAt: z.string().datetime({ offset: true }).optional(),
});

export const CompanyOnboardingsSchema = z.array(CompanyOnboardingSchema);

export const NocodeOnboardingSummarySchema = z.object({
  totalDomains: z.number().int().nonnegative(),
  totalCompanies: z.number().int().nonnegative(),
  byStatus: z.object({
    invited: z.number().int().nonnegative(),
    "in-progress": z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
  }),
  byDomain: z.array(
    z.object({
      domainSlug: z.string().min(1),
      companies: z.number().int().nonnegative(),
    }),
  ),
});

export const SelfServeOnboardingInputSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(7).max(24),
  country: z.string().trim().min(2).max(80),
  domainSlug: z.string().trim().min(1),
  employeeRange: z.enum(["1-50", "51-200", "201-1000", "1000+"]),
  implementationTimeline: z.enum(["immediate", "30-days", "90-days", "exploring"]),
  primaryUseCase: z.string().trim().min(5).max(500),
  integrationNeeds: z.string().trim().min(5).max(500),
  migrationRequired: z.boolean(),
  acceptedTerms: z.literal(true),
});
