"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight, FiDatabase, FiFileText, FiHelpCircle, FiLink2, FiPlayCircle, FiSettings, FiShield, FiUploadCloud, FiUsers } from "react-icons/fi";

type CollectorStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: CollectorField[];
};

type CollectorField = {
  key: string;
  label: string;
  type: "text" | "select" | "checkbox";
  defaultValue: string | boolean;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2;
};

type ExtraLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
};

type CollectorConfig = {
  title: string;
  subtitle: string;
  importButtonLabel: string;
  steps: CollectorStep[];
  extraLinks: ExtraLink[];
};

const dataCollectorConfig: CollectorConfig = {
  title: "Data Collector",
  subtitle: "Create and configure ingestion pipelines in guided steps.",
  importButtonLabel: "Import Config",
  steps: [
    {
      id: "source",
      title: "Source Setup",
      description: "Choose source and schedule details",
      icon: FiDatabase,
      fields: [
        {
          key: "collectorName",
          label: "Collector Name",
          type: "text",
          defaultValue: "Daily Equity Snapshot",
          placeholder: "Enter collector name",
        },
        {
          key: "sourceType",
          label: "Source Type",
          type: "select",
          defaultValue: "S3 Bucket",
          options: ["S3 Bucket", "REST API", "Kafka Topic", "FTP Server"],
        },
        {
          key: "schedule",
          label: "Schedule (Cron)",
          type: "text",
          defaultValue: "0 30 8 * * 1-5",
          placeholder: "0 30 8 * * 1-5",
          colSpan: 2,
        },
        {
          key: "ownerTeam",
          label: "Owner Team",
          type: "text",
          defaultValue: "Trading Ops",
          placeholder: "Trading Ops",
          colSpan: 2,
        },
      ],
    },
    {
      id: "mapping",
      title: "Field Mapping",
      description: "Map incoming fields to internal schema",
      icon: FiFileText,
      fields: [
        {
          key: "primaryKey",
          label: "Primary Key Field",
          type: "text",
          defaultValue: "instrument_token",
          placeholder: "instrument_token",
        },
        {
          key: "timestampField",
          label: "Timestamp Field",
          type: "text",
          defaultValue: "received_at",
          placeholder: "received_at",
        },
        {
          key: "timezone",
          label: "Timezone",
          type: "select",
          defaultValue: "Asia/Kolkata",
          options: ["Asia/Kolkata", "UTC", "America/New_York"],
          colSpan: 2,
        },
      ],
    },
    {
      id: "validation",
      title: "Validation Rules",
      description: "Define quality and integrity checks",
      icon: FiShield,
      fields: [
        {
          key: "nullThreshold",
          label: "Null Threshold (%)",
          type: "text",
          defaultValue: "5",
          placeholder: "5",
          colSpan: 2,
        },
        {
          key: "notifyChannel",
          label: "Notification Channel",
          type: "text",
          defaultValue: "#data-alerts",
          placeholder: "#data-alerts",
          colSpan: 2,
        },
        {
          key: "dedupeEnabled",
          label: "Enable duplicate row protection",
          type: "checkbox",
          defaultValue: true,
          colSpan: 2,
        },
      ],
    },
    {
      id: "review",
      title: "Review & Run",
      description: "Confirm settings and start collection",
      icon: FiPlayCircle,
      fields: [],
    },
  ],
  extraLinks: [
    { label: "Incentive Module", href: "/incentive", icon: FiLink2 },
    { label: "Trading Dashboard", href: "/trading/f&o", icon: FiUsers },
    { label: "Instrument Library", href: "/trading/instrument", icon: FiSettings },
    { label: "Collector Logging Guide", href: "https://docs.python.org/3/library/logging.html", icon: FiHelpCircle, external: true },
  ],
};

const defaultFormValues = dataCollectorConfig.steps.reduce<Record<string, string | boolean>>((values, step) => {
  step.fields.forEach((field) => {
    values[field.key] = field.defaultValue;
  });
  return values;
}, {});

export default function DataCollectorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>(defaultFormValues);

  const progress = useMemo(() => Math.round(((currentStep + 1) / dataCollectorConfig.steps.length) * 100), [currentStep]);
  const isFirst = currentStep === 0;
  const isLast = currentStep === dataCollectorConfig.steps.length - 1;
  const activeStep = dataCollectorConfig.steps[currentStep];

  const fieldMap = useMemo(() => {
    return dataCollectorConfig.steps.reduce<Record<string, CollectorField>>((map, step) => {
      step.fields.forEach((field) => {
        map[field.key] = field;
      });
      return map;
    }, {});
  }, []);

  const handleFieldChange = (key: string, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? "Enabled" : "Disabled";
    }
    return value;
  };

  const renderField = (field: CollectorField) => {
    const colSpanClass = field.colSpan === 2 ? "md:col-span-2" : "";
    const value = formValues[field.key];

    if (field.type === "checkbox") {
      return (
        <label
          key={field.key}
          className={`inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/70 ${colSpanClass}`}
        >
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => handleFieldChange(field.key, event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          {field.label}
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.key} className={`text-xs ${colSpanClass}`}>
          <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
          <select
            value={String(value)}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100"
          >
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={field.key} className={`text-xs ${colSpanClass}`}>
        <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
        <input
          value={String(value)}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100"
          placeholder={field.placeholder}
        />
      </label>
    );
  };

  const renderStepForm = () => {
    if (activeStep.fields.length > 0) {
      return <div className="grid gap-3 md:grid-cols-2">{activeStep.fields.map((field) => renderField(field))}</div>;
    }

    return (
      <div className="space-y-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="font-semibold">Configuration Summary</p>
          <div className="mt-2 grid gap-1.5 md:grid-cols-2">
            {Object.entries(formValues).map(([key, value]) => (
              <div key={key} className="rounded border border-zinc-200/80 bg-white/80 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {fieldMap[key]?.label ?? key}
                </p>
                <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{formatValue(value)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          Ready to run initial data collection with current settings.
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[radial-gradient(circle_at_top_left,#dbeafe,#f4f7ff_45%,#eef2ff_75%)] p-3 text-zinc-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,#1e293b_0%,#111827_42%,#090d16_100%)] dark:text-zinc-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="display-face text-2xl font-semibold">{dataCollectorConfig.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{dataCollectorConfig.subtitle}</p>
        </div>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
          <FiUploadCloud className="h-3.5 w-3.5" />
          {dataCollectorConfig.importButtonLabel}
        </button>
      </div>

      <section className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_260px]">
        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/90">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">All Steps</h2>
          <ol className="space-y-2">
            {dataCollectorConfig.steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                      isActive
                        ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        <StepIcon className="h-3.5 w-3.5" />
                        {step.title}
                      </span>
                      {isDone ? <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{step.description}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <article className="rounded-xl border border-zinc-200 bg-white/95 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/95">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Current Step</p>
            <h2 className="mt-1 text-lg font-semibold">{activeStep.title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{activeStep.description}</p>
          </div>

          <div className="p-4">{renderStepForm()}</div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold">Step {currentStep + 1} of {dataCollectorConfig.steps.length}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Progress: {progress}%</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={isFirst}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                <FiChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(dataCollectorConfig.steps.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Next
                  <FiChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Start Collection
                  <FiArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </footer>
        </article>

        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/90">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">Extra Links</h2>
          <div className="space-y-2">
            {dataCollectorConfig.extraLinks.map((item) => {
              const LinkIcon = item.icon;

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-800"
                  >
                    {item.label}
                    <LinkIcon className="h-3.5 w-3.5" />
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-800"
                >
                  {item.label}
                  <LinkIcon className="h-3.5 w-3.5" />
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
    </main>
  );
}
