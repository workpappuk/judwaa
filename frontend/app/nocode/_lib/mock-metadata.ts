import type { NocodeApplication } from "./types";

export const mockApplications: NocodeApplication[] = [
  {
    id: "app-hr-01",
    slug: "hr",
    name: "PeopleOps HR",
    domain: "Human Resources",
    version: 3,
    status: "published",
    description: "Metadata-driven HR onboarding, profile, and leave workflows.",
    metadataVersion: {
      versionId: "hr-v3",
      versionNumber: 3,
      schemaVersion: "1.0.0",
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: "2026-07-18T08:45:00.000Z",
      publishedAt: "2026-07-18T09:00:00.000Z",
      previousVersionId: "hr-v2",
    },
    theme: {
      brand: "primary.dark",
      accent: "info.main",
      soft: "rgba(var(--mui-palette-info-lightChannel) / 0.28)",
    },
    menu: [
      { id: "m-hr-dashboard", label: "Dashboard", pageSlug: "dashboard" },
      { id: "m-hr-onboarding", label: "Onboarding", pageSlug: "onboarding" },
      { id: "m-hr-leave", label: "Leave", pageSlug: "leave" },
    ],
    pages: [
      {
        id: "p-hr-dashboard",
        slug: "dashboard",
        route: "/nocode/hr/dashboard",
        title: "HR Command Center",
        description: "Key hiring and employee movement indicators.",
        sections: [
          {
            id: "s-hr-kpi",
            title: "Pipeline Snapshot",
            components: [
              {
                id: "c-hr-heading",
                type: "heading",
                content: "Recruitment at a glance",
              },
              {
                id: "c-hr-stats",
                type: "stats",
                stats: [
                  { label: "Open Positions", value: "18", delta: "+3 this week" },
                  { label: "Interviews", value: "42", delta: "+11%" },
                  { label: "Offers Sent", value: "7", delta: "+2" },
                ],
              },
            ],
          },
          {
            id: "s-hr-hires",
            title: "Recent Joins",
            components: [
              {
                id: "c-hr-table",
                type: "table",
                columns: ["Employee", "Department", "Joining Date", "Manager"],
                rows: [
                  {
                    Employee: "Aarav Singh",
                    Department: "Engineering",
                    "Joining Date": "2026-07-15",
                    Manager: "S. Krishnan",
                  },
                  {
                    Employee: "Mira Kapoor",
                    Department: "Finance",
                    "Joining Date": "2026-07-10",
                    Manager: "R. Menon",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "p-hr-onboarding",
        slug: "onboarding",
        route: "/nocode/hr/onboarding",
        title: "Employee Onboarding",
        description: "Dynamic onboarding form generated from field metadata.",
        sections: [
          {
            id: "s-hr-onboarding-form",
            title: "Create Onboarding Case",
            description: "Form controls below are metadata-driven and runtime rendered.",
            components: [
              {
                id: "c-hr-onboarding-intro",
                type: "paragraph",
                content: "Collect employee identity, role, and joining details using one configurable form.",
              },
              {
                id: "c-hr-onboarding-form",
                type: "form",
                fields: [
                  { id: "f-emp-name", name: "employeeName", label: "Employee Name", type: "text", required: true, placeholder: "Enter full name" },
                  { id: "f-emp-email", name: "employeeEmail", label: "Work Email", type: "email", required: true, placeholder: "name@company.com" },
                  { id: "f-emp-dept", name: "department", label: "Department", type: "select", options: ["Engineering", "Finance", "Sales", "Operations"], required: true },
                  { id: "f-emp-date", name: "joiningDate", label: "Joining Date", type: "date", required: true },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "p-hr-leave",
        slug: "leave",
        route: "/nocode/hr/leave",
        title: "Leave Request",
        description: "Role-aware leave request workflow entry screen.",
        sections: [
          {
            id: "s-hr-leave",
            title: "Submit Leave",
            components: [
              {
                id: "c-hr-leave-form",
                type: "form",
                fields: [
                  { id: "f-leave-type", name: "leaveType", label: "Leave Type", type: "select", options: ["Sick", "Casual", "Annual"], required: true },
                  { id: "f-leave-days", name: "days", label: "Number of Days", type: "number", required: true, placeholder: "2" },
                  { id: "f-leave-reason", name: "reason", label: "Reason", type: "textarea", placeholder: "Add a short reason" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "app-crm-01",
    slug: "crm",
    name: "Orbit CRM",
    domain: "Customer Relationship",
    version: 2,
    status: "published",
    description: "Lead and opportunity management generated from metadata.",
    metadataVersion: {
      versionId: "crm-v2",
      versionNumber: 2,
      schemaVersion: "1.0.0",
      createdAt: "2026-05-15T11:00:00.000Z",
      updatedAt: "2026-07-14T10:20:00.000Z",
      publishedAt: "2026-07-14T11:00:00.000Z",
      previousVersionId: "crm-v1",
    },
    theme: {
      brand: "primary.dark",
      accent: "primary.main",
      soft: "rgba(var(--mui-palette-primary-lightChannel) / 0.24)",
    },
    menu: [
      { id: "m-crm-home", label: "Home", pageSlug: "home" },
      { id: "m-crm-lead", label: "Lead Intake", pageSlug: "lead-intake" },
    ],
    pages: [
      {
        id: "p-crm-home",
        slug: "home",
        route: "/nocode/crm/home",
        title: "Revenue Cockpit",
        description: "Track pipeline quality and top opportunities.",
        sections: [
          {
            id: "s-crm-pipeline",
            title: "Pipeline Health",
            components: [
              {
                id: "c-crm-stats",
                type: "stats",
                stats: [
                  { label: "Open Leads", value: "126", delta: "+9" },
                  { label: "Qualified", value: "41", delta: "32% conversion" },
                  { label: "Expected Revenue", value: "$1.9M", delta: "+14%" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "p-crm-lead",
        slug: "lead-intake",
        route: "/nocode/crm/lead-intake",
        title: "Lead Intake",
        description: "Runtime form for new lead creation.",
        sections: [
          {
            id: "s-crm-lead-form",
            title: "Create Lead",
            components: [
              {
                id: "c-crm-lead-form",
                type: "form",
                fields: [
                  { id: "f-lead-name", name: "name", label: "Lead Name", type: "text", required: true, placeholder: "Company or contact name" },
                  { id: "f-lead-email", name: "email", label: "Email", type: "email", placeholder: "lead@example.com" },
                  { id: "f-lead-source", name: "source", label: "Source", type: "select", options: ["Website", "Referral", "Campaign", "Partner"], required: true },
                  { id: "f-lead-notes", name: "notes", label: "Notes", type: "textarea", placeholder: "Context for sales team" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
