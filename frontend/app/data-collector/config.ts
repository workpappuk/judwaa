import type { ComponentType } from "react";
import { FiDatabase, FiFileText, FiHelpCircle, FiLink2, FiPlayCircle, FiSettings, FiShield, FiUsers } from "react-icons/fi";

export type CollectorStep = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  sections: CollectorSection[];
};

export type CollectorSection = {
  id: string;
  title: string;
  description?: string;
  fields: CollectorField[];
};

export type CollectorField = {
  key: string;
  label: string;
  type: "text" | "select" | "checkbox" | "number" | "textarea" | "date" | "email" | "url" | "tel" | "time" | "password";
  defaultValue: string | boolean | number;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
};

export type ExtraLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

export type CollectorConfig = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  importButtonLabel: string;
  steps: CollectorStep[];
  extraLinks: ExtraLink[];
};

type StepDefaults = {
  collectorName: string;
  sourceType: string;
  schedule: string;
  ownerTeam: string;
  primaryKey: string;
  timestampField: string;
  timezone: string;
  nullThreshold: string;
  notifyChannel: string;
  dedupeEnabled: boolean;
};

const largeGeneratedFields: CollectorField[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const padded = String(number).padStart(3, "0");

  return {
    key: `customField${padded}`,
    label: `Custom Field ${number}`,
    type: "text",
    defaultValue: "",
    placeholder: `Enter value ${number}`,
  };
});

const buildSteps = (defaults: StepDefaults): CollectorStep[] => [
  {
    id: "source",
    title: "Source Setup",
    description: "Choose source and schedule details",
    icon: FiDatabase,
    sections: [
      {
        id: "source-details",
        title: "Source Details",
        fields: [
          {
            key: "collectorName",
            label: "Collector Name",
            type: "text",
            defaultValue: defaults.collectorName,
            placeholder: "Enter collector name",
          },
          {
            key: "sourceType",
            label: "Source Type",
            type: "select",
            defaultValue: defaults.sourceType,
            options: ["S3 Bucket", "REST API", "Kafka Topic", "FTP Server"],
          },
        ],
      },
      {
        id: "source-scheduling",
        title: "Scheduling & Ownership",
        fields: [
          {
            key: "schedule",
            label: "Schedule (Cron)",
            type: "text",
            defaultValue: defaults.schedule,
            placeholder: "0 30 8 * * 1-5",
            colSpan: 2,
          },
          {
            key: "ownerTeam",
            label: "Owner Team",
            type: "text",
            defaultValue: defaults.ownerTeam,
            placeholder: "Trading Ops",
            colSpan: 2,
          },
          {
            key: "sourceNotes",
            label: "Source Notes",
            type: "textarea",
            defaultValue: "",
            placeholder: "Optional context or runbook notes",
            colSpan: 2,
            rows: 3,
          },
          {
            key: "supportEmail",
            label: "Support Email",
            type: "email",
            defaultValue: "",
            placeholder: "ops-team@example.com",
          },
          {
            key: "callbackUrl",
            label: "Callback URL",
            type: "url",
            defaultValue: "",
            placeholder: "https://example.com/webhook",
          },
          {
            key: "supportPhone",
            label: "Support Phone",
            type: "tel",
            defaultValue: "",
            placeholder: "+91-9876543210",
          },
          {
            key: "cutoffTime",
            label: "Cutoff Time",
            type: "time",
            defaultValue: "",
          },
          {
            key: "apiSecret",
            label: "API Secret",
            type: "password",
            defaultValue: "",
            placeholder: "Enter secret token",
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    id: "mapping",
    title: "Field Mapping",
    description: "Map incoming fields to internal schema",
    icon: FiFileText,
    sections: [
      {
        id: "mapping-core-fields",
        title: "Core Mapping",
        fields: [
          {
            key: "primaryKey",
            label: "Primary Key Field",
            type: "text",
            defaultValue: defaults.primaryKey,
            placeholder: "instrument_token",
          },
          {
            key: "timestampField",
            label: "Timestamp Field",
            type: "text",
            defaultValue: defaults.timestampField,
            placeholder: "received_at",
          },
        ],
      },
      {
        id: "mapping-localization",
        title: "Localization",
        fields: [
          {
            key: "timezone",
            label: "Timezone",
            type: "select",
            defaultValue: defaults.timezone,
            options: ["Asia/Kolkata", "UTC", "America/New_York"],
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    id: "validation",
    title: "Validation Rules",
    description: "Define quality and integrity checks",
    icon: FiShield,
    sections: [
      {
        id: "validation-thresholds",
        title: "Thresholds",
        fields: [
          {
            key: "nullThreshold",
            label: "Null Threshold (%)",
            type: "text",
            defaultValue: defaults.nullThreshold,
            placeholder: "5",
            colSpan: 2,
          },
          {
            key: "notifyChannel",
            label: "Notification Channel",
            type: "text",
            defaultValue: defaults.notifyChannel,
            placeholder: "#data-alerts",
            colSpan: 2,
          },
          {
            key: "retryLimit",
            label: "Retry Limit",
            type: "number",
            defaultValue: 3,
            min: 0,
            max: 10,
            step: 1,
          },
          {
            key: "effectiveFrom",
            label: "Effective From",
            type: "date",
            defaultValue: "",
          },
        ],
      },
      {
        id: "validation-data-protection",
        title: "Data Protection",
        fields: [
          {
            key: "dedupeEnabled",
            label: "Enable duplicate row protection",
            type: "checkbox",
            defaultValue: defaults.dedupeEnabled,
            colSpan: 2,
          },
        ],
      },
      {
        id: "validation-large-form",
        title: "Extended Attributes (100 Fields)",
        description: "Large form block for stress-testing and bulk configuration capture.",
        fields: largeGeneratedFields,
      },
    ],
  },
  {
    id: "review",
    title: "Review & Run",
    description: "Confirm settings and start collection",
    icon: FiPlayCircle,
    sections: [],
  },
];

const defaultExtraLinks: ExtraLink[] = [
  { label: "Incentive Module", href: "/incentive", icon: FiLink2 },
  { label: "Trading Dashboard", href: "/trading/f&o", icon: FiUsers },
  { label: "Instrument Library", href: "/trading/instrument", icon: FiSettings },
  { label: "Collector Logging Guide", href: "https://docs.python.org/3/library/logging.html", icon: FiHelpCircle, external: true },
];

const generatedExtraLinks: ExtraLink[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  return {
    label: `Reference Link ${number}`,
    href: `https://example.com/data-collector/reference/${number}`,
    icon: FiLink2,
    external: true,
  };
});

const allExtraLinks: ExtraLink[] = [...defaultExtraLinks, ...generatedExtraLinks];

const baseCollectorConfigs: CollectorConfig[] = [
  {
    id: "equity-daily",
    category: "EQUITY",
    title: "Daily Equity Snapshot",
    subtitle: "Collect end-of-day equity market records in a scheduled batch.",
    importButtonLabel: "Import Equity Config",
    steps: buildSteps({
      collectorName: "Daily Equity Snapshot",
      sourceType: "S3 Bucket",
      schedule: "0 30 8 * * 1-5",
      ownerTeam: "Trading Ops",
      primaryKey: "instrument_token",
      timestampField: "received_at",
      timezone: "Asia/Kolkata",
      nullThreshold: "5",
      notifyChannel: "#data-alerts",
      dedupeEnabled: true,
    }),
    extraLinks: allExtraLinks,
  },
  {
    id: "fo-intraday",
    category: "F&O",
    title: "F&O Intraday Feed",
    subtitle: "Stream and validate derivative contracts for intraday analytics.",
    importButtonLabel: "Import F&O Config",
    steps: buildSteps({
      collectorName: "F&O Intraday Feed",
      sourceType: "Kafka Topic",
      schedule: "*/5 * * * *",
      ownerTeam: "Derivatives Desk",
      primaryKey: "contract_id",
      timestampField: "tick_time",
      timezone: "Asia/Kolkata",
      nullThreshold: "2",
      notifyChannel: "#fo-data-alerts",
      dedupeEnabled: true,
    }),
    extraLinks: allExtraLinks,
  },
  {
    id: "client-master",
    category: "MASTER",
    title: "Client Master Sync",
    subtitle: "Synchronize client and account master data from upstream systems.",
    importButtonLabel: "Import Master Config",
    steps: buildSteps({
      collectorName: "Client Master Sync",
      sourceType: "REST API",
      schedule: "0 */2 * * *",
      ownerTeam: "Data Platform",
      primaryKey: "client_code",
      timestampField: "updated_at",
      timezone: "UTC",
      nullThreshold: "1",
      notifyChannel: "#master-sync-alerts",
      dedupeEnabled: false,
    }),
    extraLinks: allExtraLinks,
  },
];

const generatedCollectorConfigs: CollectorConfig[] = Array.from({ length: 97 }, (_, index) => {
  const number = index + 4;
  const padded = String(number).padStart(3, "0");
  const sourceTypeOptions = ["S3 Bucket", "REST API", "Kafka Topic", "FTP Server"] as const;
  const sourceType = sourceTypeOptions[index % sourceTypeOptions.length];

  return {
    id: `collector-${padded}`,
    category: "AUTO",
    title: `Auto Collector ${number}`,
    subtitle: `Auto-generated configuration for collector ${number}.`,
    importButtonLabel: `Import Config ${number}`,
    steps: buildSteps({
      collectorName: `Auto Collector ${number}`,
      sourceType,
      schedule: `*/${(index % 10) + 1} * * * *`,
      ownerTeam: `Data Team ${((index % 5) + 1)}`,
      primaryKey: `primary_key_${padded}`,
      timestampField: `timestamp_${padded}`,
      timezone: index % 2 === 0 ? "Asia/Kolkata" : "UTC",
      nullThreshold: String((index % 5) + 1),
      notifyChannel: `#collector-alert-${padded}`,
      dedupeEnabled: index % 2 === 0,
    }),
    extraLinks: allExtraLinks,
  };
});

export const collectorConfigs: CollectorConfig[] = [...baseCollectorConfigs, ...generatedCollectorConfigs];

export const getDefaultFormValues = (config: CollectorConfig): Record<string, string | boolean | number> => {
  return config.steps.reduce<Record<string, string | boolean | number>>((values, step) => {
    step.sections.forEach((section) => {
      section.fields.forEach((field) => {
        values[field.key] = field.defaultValue;
      });
    });
    return values;
  }, {});
};
