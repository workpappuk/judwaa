export type OnboardFieldType = "text" | "email" | "select" | "textarea" | "radio" | "checkbox";

export type OnboardFieldOption = {
  value: string;
  label: string;
};

export type OnboardFieldConfig = {
  name: string;
  label: string;
  type: OnboardFieldType;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rows?: number;
  colSpan?: "full" | "half";
  options?: OnboardFieldOption[];
  booleanFromYesNo?: boolean;
};

export type OnboardStepConfig = {
  id: string;
  label: string;
  fields: OnboardFieldConfig[];
};

export const ONBOARD_STEPS: OnboardStepConfig[] = [
  {
    id: "company-details",
    label: "Company Details",
    fields: [
      {
        name: "companyName",
        label: "Company Name",
        type: "text",
        placeholder: "Acme Industries",
        required: true,
        minLength: 2,
        colSpan: "full",
      },
      {
        name: "contactName",
        label: "Contact Name",
        type: "text",
        placeholder: "Priya Sharma",
        required: true,
        minLength: 2,
      },
      {
        name: "contactEmail",
        label: "Contact Email",
        type: "email",
        placeholder: "priya@acme.com",
        required: true,
      },
      {
        name: "contactPhone",
        label: "Contact Phone",
        type: "text",
        placeholder: "+91 98765 43210",
        required: true,
        minLength: 7,
      },
      {
        name: "country",
        label: "Country",
        type: "text",
        placeholder: "India",
        required: true,
        minLength: 2,
      },
    ],
  },
  {
    id: "business-context",
    label: "Business Context",
    fields: [
      {
        name: "domainSlug",
        label: "Primary Domain",
        type: "select",
        required: true,
        colSpan: "full",
        options: [
          { value: "hr", label: "Human Resources" },
          { value: "crm", label: "CRM" },
          { value: "trade-finance", label: "Trade Finance" },
          { value: "procurement", label: "Procurement" },
          { value: "vendor-management", label: "Vendor Management" },
          { value: "asset-management", label: "Asset Management" },
          { value: "compliance", label: "Compliance" },
          { value: "customer-onboarding", label: "Customer Onboarding" },
          { value: "lms", label: "Learning Management" },
          { value: "incentive", label: "Incentive Management" },
        ],
      },
      {
        name: "employeeRange",
        label: "Company Size",
        type: "select",
        required: true,
        options: [
          { value: "1-50", label: "1-50" },
          { value: "51-200", label: "51-200" },
          { value: "201-1000", label: "201-1000" },
          { value: "1000+", label: "1000+" },
        ],
      },
      {
        name: "implementationTimeline",
        label: "Go-Live Timeline",
        type: "select",
        required: true,
        options: [
          { value: "immediate", label: "Immediate" },
          { value: "30-days", label: "Within 30 days" },
          { value: "90-days", label: "Within 90 days" },
          { value: "exploring", label: "Exploring options" },
        ],
      },
    ],
  },
  {
    id: "implementation",
    label: "Implementation",
    fields: [
      {
        name: "primaryUseCase",
        label: "Primary Use Case",
        type: "textarea",
        placeholder: "Describe what workflows you want to launch first",
        required: true,
        minLength: 5,
        rows: 3,
        colSpan: "full",
      },
      {
        name: "integrationNeeds",
        label: "Integration Needs",
        type: "textarea",
        placeholder: "ERP, CRM, identity provider, email, data sources, etc.",
        required: true,
        minLength: 5,
        rows: 3,
        colSpan: "full",
      },
      {
        name: "migrationRequired",
        label: "Data Migration Required?",
        type: "radio",
        required: true,
        colSpan: "full",
        booleanFromYesNo: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        name: "acceptedTerms",
        label: "I confirm that the submitted information is accurate and I agree to be contacted for onboarding setup.",
        type: "checkbox",
        required: true,
        colSpan: "full",
      },
    ],
  },
];
