"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight, FiUploadCloud, FiX } from "react-icons/fi";

import { collectorConfigs, getDefaultFormValues, type CollectorField, type CollectorFieldValue, type CollectorFormValues, type CollectorSection } from "./config";
import { fetchCollectorDetail, fetchCollectorSummaries, fetchPersistedCollectorData, persistCollectorValues, type CollectorSummary, type PersistedCollectorData, updatePersistedCollectorData } from "@/services/data-collector-api";

type SearchInputWithClearProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  clearAriaLabel: string;
  containerClassName?: string;
  inputClassName?: string;
};

function SearchInputWithClear({
  value,
  onChange,
  onClear,
  placeholder,
  clearAriaLabel,
  containerClassName,
  inputClassName,
}: SearchInputWithClearProps) {
  return (
    <div className={containerClassName ?? "relative"}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName ?? "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 pr-8 text-[11px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-1.5 top-1.5 rounded p-0.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label={clearAriaLabel}
          title="Clear"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export default function DataCollectorPage() {
  type SidebarStep = {
    id: string;
    title: string;
    description: string;
  };

  type SidebarLink = {
    label: string;
    href: string;
    external: boolean;
  };

  const fallbackSummaries = useMemo<CollectorSummary[]>(
    () => collectorConfigs.map((config) => ({
      id: config.id,
      category: config.category,
      title: config.title,
      subtitle: config.subtitle,
      importButtonLabel: config.importButtonLabel,
      related: {
        steps: config.steps.length,
        sections: config.steps.reduce((count, step) => count + step.sections.length, 0),
        fields: config.steps.reduce(
          (count, step) => count + step.sections.reduce((sectionCount, section) => sectionCount + section.fields.length, 0),
          0,
        ),
        links: config.extraLinks.length,
      },
      updatedAt: null,
    })),
    [],
  );
  const [collectorSummaries, setCollectorSummaries] = useState<CollectorSummary[]>(fallbackSummaries);
  const [selectedCollectorId, setSelectedCollectorId] = useState(collectorConfigs[0].id);
  const [collectorSearch, setCollectorSearch] = useState("");
  const [leftStepSearch, setLeftStepSearch] = useState("");
  const [stepFieldSearch, setStepFieldSearch] = useState("");
  const [rightLinkSearch, setRightLinkSearch] = useState("");
  const [collectorApiError, setCollectorApiError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [apiSidebarSteps, setApiSidebarSteps] = useState<SidebarStep[]>([]);
  const [apiSidebarLinks, setApiSidebarLinks] = useState<SidebarLink[]>([]);
  const [showPersistedModal, setShowPersistedModal] = useState(false);
  const [isPersistedLoading, setIsPersistedLoading] = useState(false);
  const [persistedViewData, setPersistedViewData] = useState<PersistedCollectorData | null>(null);
  const [persistedEditorText, setPersistedEditorText] = useState("");
  const [persistedEditorError, setPersistedEditorError] = useState<string | null>(null);
  const [isPersistedSaving, setIsPersistedSaving] = useState(false);
  const collectorRailRef = useRef<HTMLDivElement | null>(null);
  const selectedConfig = useMemo(
    () => collectorConfigs.find((config) => config.id === selectedCollectorId) ?? collectorConfigs[0],
    [selectedCollectorId],
  );
  const selectedSummary = useMemo(
    () => collectorSummaries.find((collector) => collector.id === selectedCollectorId) ?? null,
    [collectorSummaries, selectedCollectorId],
  );
  const filteredCollectorConfigs = useMemo(() => {
    const query = collectorSearch.trim().toLowerCase();

    if (!query) {
      return collectorSummaries;
    }

    return collectorSummaries.filter((config) => {
      return (
        config.title.toLowerCase().includes(query)
        || config.subtitle.toLowerCase().includes(query)
        || config.category.toLowerCase().includes(query)
        || config.id.toLowerCase().includes(query)
      );
    });
  }, [collectorSearch, collectorSummaries]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<CollectorFormValues>(getDefaultFormValues(collectorConfigs[0]));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parsePersistedEditorValues = (): CollectorFormValues | null => {
    try {
      const parsed = JSON.parse(persistedEditorText) as unknown;

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setPersistedEditorError("Persisted payload must be a JSON object.");
        return null;
      }

      const sanitized: CollectorFormValues = {};
      for (const [key, rawValue] of Object.entries(parsed)) {
        if (typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean") {
          sanitized[key] = rawValue;
          continue;
        }

        setPersistedEditorError(
          `Unsupported value type for '${key}'. Only string, number, and boolean are allowed.`,
        );
        return null;
      }

      setPersistedEditorError(null);
      return sanitized;
    } catch {
      setPersistedEditorError("Invalid JSON. Please fix the payload before saving.");
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCollectorSummaries = async () => {
      try {
        const summaries = await fetchCollectorSummaries();
        if (!cancelled && summaries.length > 0) {
          setCollectorSummaries(summaries);
        }
      } catch {
        if (!cancelled) {
          setCollectorApiError("Unable to fetch collector list from backend.");
        }
      }
    };

    void loadCollectorSummaries();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setCurrentStep(0);
    setFormValues(getDefaultFormValues(selectedConfig));
    setFieldErrors({});
    setLeftStepSearch("");
    setStepFieldSearch("");
    setRightLinkSearch("");
    setSaveStatus(null);
    setApiSidebarSteps([]);
    setApiSidebarLinks([]);

    const loadCollectorDetail = async () => {
      try {
        const detail = await fetchCollectorDetail(selectedConfig.id);
        if (cancelled) {
          return;
        }

        setCollectorApiError(null);
        if (detail.persistedValues && Object.keys(detail.persistedValues).length > 0) {
          setFormValues((prev) => ({
            ...prev,
            ...detail.persistedValues,
          }));
        }
        setApiSidebarSteps(detail.steps ?? []);
        setApiSidebarLinks(detail.links ?? []);

        setCollectorSummaries((prev) =>
          prev.map((item) => (item.id === detail.id ? { ...item, updatedAt: detail.updatedAt } : item)),
        );
      } catch {
        if (!cancelled) {
          setCollectorApiError("Unable to fetch collector details from backend.");
        }
      }
    };

    void loadCollectorDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedConfig]);

  const progress = useMemo(() => Math.round(((currentStep + 1) / selectedConfig.steps.length) * 100), [currentStep, selectedConfig.steps.length]);
  const isFirst = currentStep === 0;
  const isLast = currentStep === selectedConfig.steps.length - 1;
  const activeStep = selectedConfig.steps[currentStep];
  const activeStepFieldItems = useMemo(
    () => activeStep.sections.flatMap((section) => section.fields.map((field) => ({ sectionTitle: section.title, field }))),
    [activeStep],
  );
  const filteredStepFieldItems = useMemo(() => {
    const query = stepFieldSearch.trim().toLowerCase();

    if (!query) {
      return activeStepFieldItems;
    }

    return activeStepFieldItems.filter((item) => {
      return (
        item.field.label.toLowerCase().includes(query)
        || item.sectionTitle.toLowerCase().includes(query)
        || item.field.key.toLowerCase().includes(query)
      );
    });
  }, [activeStepFieldItems, stepFieldSearch]);
  const filteredStepItems = useMemo(() => {
    const query = leftStepSearch.trim().toLowerCase();
    const sourceSteps =
      apiSidebarSteps.length > 0
        ? apiSidebarSteps
        : selectedConfig.steps.map((step) => ({ id: step.id, title: step.title, description: step.description }));
    const indexedSteps = sourceSteps.map((step, index) => ({ step, index }));

    if (!query) {
      return indexedSteps;
    }

    return indexedSteps.filter(({ step }) => {
      return (
        step.title.toLowerCase().includes(query)
        || step.description.toLowerCase().includes(query)
        || step.id.toLowerCase().includes(query)
      );
    });
  }, [apiSidebarSteps, leftStepSearch, selectedConfig.steps]);
  const filteredRightLinks = useMemo(() => {
    const query = rightLinkSearch.trim().toLowerCase();
    const sourceLinks =
      apiSidebarLinks.length > 0
        ? apiSidebarLinks
        : selectedConfig.extraLinks.map((item) => ({
            label: item.label,
            href: item.href,
            external: Boolean(item.external),
          }));

    if (!query) {
      return sourceLinks;
    }

    return sourceLinks.filter((item) => {
      return item.label.toLowerCase().includes(query) || item.href.toLowerCase().includes(query);
    });
  }, [apiSidebarLinks, rightLinkSearch, selectedConfig.extraLinks]);

  const allFields = useMemo(
    () => selectedConfig.steps.flatMap((step) => step.sections.flatMap((section) => section.fields)),
    [selectedConfig],
  );
  const fieldMap = useMemo(() => {
    return allFields.reduce<Record<string, CollectorField>>((map, field) => {
      map[field.key] = field;
      return map;
    }, {});
  }, [allFields]);

  const validateField = (field: CollectorField, value: CollectorFieldValue): string | null => {
    const rules = field.validation;

    if (!rules) {
      return null;
    }

    if (rules.required) {
      if (field.type === "checkbox") {
        if (value !== true) {
          return `${field.label} is required`;
        }
      } else if (String(value).trim().length === 0) {
        return `${field.label} is required`;
      }
    }

    if (field.type !== "checkbox") {
      const stringValue = String(value);

      if (rules.minLength !== undefined && stringValue.length > 0 && stringValue.length < rules.minLength) {
        return `${field.label} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
        return `${field.label} must be at most ${rules.maxLength} characters`;
      }

      if (rules.noSpecialChars && stringValue.length > 0 && !/^[a-zA-Z0-9 _-]+$/.test(stringValue)) {
        return `${field.label} cannot contain special characters`;
      }

      if (rules.pattern && stringValue.length > 0 && !rules.pattern.test(stringValue)) {
        return rules.patternMessage ?? `${field.label} format is invalid`;
      }
    }

    if (field.type === "number") {
      const numericValue = Number(value);

      if (!Number.isNaN(numericValue)) {
        if (rules.minValue !== undefined && numericValue < rules.minValue) {
          return `${field.label} must be >= ${rules.minValue}`;
        }
        if (rules.maxValue !== undefined && numericValue > rules.maxValue) {
          return `${field.label} must be <= ${rules.maxValue}`;
        }
      }
    }

    if (rules.custom) {
      const customValidators = Array.isArray(rules.custom) ? rules.custom : [rules.custom];

      for (const validator of customValidators) {
        const customError = validator(value, formValues);
        if (customError) {
          return customError;
        }
      }
    }

    return null;
  };

  const validateFieldsAndSetErrors = (fields: CollectorField[]): boolean => {
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const maybeError = validateField(field, formValues[field.key]);
      if (maybeError) {
        nextErrors[field.key] = maybeError;
      }
    });

    setFieldErrors((prev) => {
      const cleaned = { ...prev };
      fields.forEach((field) => {
        delete cleaned[field.key];
      });
      return { ...cleaned, ...nextErrors };
    });

    return Object.keys(nextErrors).length === 0;
  };

  const handleFieldChange = (key: string, value: CollectorFieldValue) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));

    const field = fieldMap[key];
    if (!field) {
      return;
    }

    const maybeError = validateField(field, value);
    setFieldErrors((prev) => {
      if (!maybeError) {
        if (!(key in prev)) {
          return prev;
        }

        const updated = { ...prev };
        delete updated[key];
        return updated;
      }

      return { ...prev, [key]: maybeError };
    });
  };

  const validateActiveStepAndProceed = () => {
    const activeStepFields = activeStep.sections.flatMap((section) => section.fields);
    const isValid = validateFieldsAndSetErrors(activeStepFields);

    if (!isValid) {
      const firstInvalidField = activeStepFields.find((field) => validateField(field, formValues[field.key]) !== null);
      if (firstInvalidField) {
        focusFieldByKey(firstInvalidField.key);
      }
      return;
    }

    setCurrentStep((prev) => Math.min(selectedConfig.steps.length - 1, prev + 1));
  };

  const scrollCollectorRail = (direction: "left" | "right") => {
    const rail = collectorRailRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const focusFieldByKey = (fieldKey: string) => {
    const element = document.getElementById(`field-${fieldKey}`) as HTMLElement | null;

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus({ preventScroll: true });
  };

  const formatValue = (value: string | boolean | number) => {
    if (typeof value === "boolean") {
      return value ? "Enabled" : "Disabled";
    }
    return value;
  };

  const renderField = (field: CollectorField) => {
    const colSpanClass = field.colSpan === 2 ? "md:col-span-2" : "";
    const value = formValues[field.key];
    const error = fieldErrors[field.key];
    const baseInputClass = `w-full rounded-md border bg-white px-2.5 py-2 text-zinc-900 focus:outline-none focus:ring-2 dark:bg-zinc-950/70 dark:text-zinc-100 ${error ? "border-rose-500 focus:ring-rose-500/30 dark:border-rose-500" : "border-zinc-300 focus:ring-blue-500/30 dark:border-zinc-700"}`;

    if (field.type === "checkbox") {
      return (
        <div key={field.key} className={colSpanClass}>
          <label
            className={`inline-flex items-center gap-2 rounded-md border bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900/70 ${error ? "border-rose-500 dark:border-rose-500" : "border-zinc-200 dark:border-zinc-800"}`}
          >
            <input
              type="checkbox"
              id={`field-${field.key}`}
              checked={Boolean(value)}
              onChange={(event) => handleFieldChange(field.key, event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            {field.label}
          </label>
          {error ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{error}</p> : null}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.key} className={`text-xs ${colSpanClass}`}>
          <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
          <select
            id={`field-${field.key}`}
            value={String(value)}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={baseInputClass}
          >
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{error}</p> : null}
        </label>
      );
    }

    if (field.type === "textarea") {
      return (
        <label key={field.key} className={`text-xs ${colSpanClass}`}>
          <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
          <textarea
            id={`field-${field.key}`}
            value={String(value)}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            rows={field.rows ?? 3}
            className={baseInputClass}
            placeholder={field.placeholder}
          />
          {error ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{error}</p> : null}
        </label>
      );
    }

    if (field.type === "number") {
      return (
        <label key={field.key} className={`text-xs ${colSpanClass}`}>
          <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
          <input
            id={`field-${field.key}`}
            type="number"
            value={String(value)}
            onChange={(event) => {
              const raw = event.target.value;
              handleFieldChange(field.key, raw === "" ? "" : Number(raw));
            }}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClass}
            placeholder={field.placeholder}
          />
          {error ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{error}</p> : null}
        </label>
      );
    }

    return (
      <label key={field.key} className={`text-xs ${colSpanClass}`}>
        <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{field.label}</span>
        <input
          id={`field-${field.key}`}
          type={field.type === "date" || field.type === "email" || field.type === "url" || field.type === "tel" || field.type === "time" || field.type === "password" ? field.type : "text"}
          value={String(value)}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          className={baseInputClass}
          placeholder={field.placeholder}
        />
        {error ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{error}</p> : null}
      </label>
    );
  };

  const renderSection = (section: CollectorSection) => {
    return (
      <section key={section.id} className="rounded-lg border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">{section.title}</h3>
        {section.description ? <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{section.description}</p> : null}
        <div className="mt-2 grid gap-3 md:grid-cols-2">{section.fields.map((field) => renderField(field))}</div>
      </section>
    );
  };

  const renderExtraLink = (item: SidebarLink) => {

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
          <FiArrowRight className="h-3.5 w-3.5" />
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
        <FiArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  };

  const renderStepForm = () => {
    if (activeStep.sections.length > 0) {
      return <div className="space-y-3">{activeStep.sections.map((section) => renderSection(section))}</div>;
    }

    const reviewSteps = selectedConfig.steps.filter((step) => step.sections.length > 0);
    const filledFieldCount = Object.values(formValues).filter((value) => String(value).trim().length > 0).length;

    return (
      <div className="space-y-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">Collected Data Review</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {filledFieldCount}/{Object.keys(formValues).length} fields filled
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {reviewSteps.map((step) => (
              <section key={step.id} className="rounded-md border border-zinc-200/80 bg-white/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{step.title}</p>
                <div className="mt-2 space-y-2">
                  {step.sections.map((section) => (
                    <div key={section.id} className="rounded border border-zinc-200/80 bg-zinc-50/70 p-2 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{section.title}</p>
                      <div className="mt-1.5 grid gap-1.5 md:grid-cols-2">
                        {section.fields.map((field) => (
                          <div key={field.key} className="rounded border border-zinc-200/80 bg-white/80 px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                            <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{field.label}</p>
                            <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{formatValue(formValues[field.key])}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-zinc-200/80 bg-white/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Raw Payload Preview</p>
            <pre className="mt-1 max-h-48 overflow-auto rounded bg-zinc-950 p-2 text-[11px] text-zinc-200">
              {JSON.stringify(formValues, null, 2)}
            </pre>
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
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/90">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Available Data Collectors</h2>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Choose a config to load wizard defaults</span>
        </div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <SearchInputWithClear
            value={collectorSearch}
            onChange={setCollectorSearch}
            onClear={() => setCollectorSearch("")}
            placeholder="Search by name, id, or category"
            clearAriaLabel="Clear collector search"
            containerClassName="relative w-full md:w-72"
            inputClassName="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 pr-8 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100"
          />
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{filteredCollectorConfigs.length} collectors</p>
            <button
              type="button"
              onClick={() => scrollCollectorRail("left")}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Scroll collectors left"
              title="Scroll left"
            >
              <FiChevronLeft className="h-3.5 w-3.5" />
              Left
            </button>
            <button
              type="button"
              onClick={() => scrollCollectorRail("right")}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Scroll collectors right"
              title="Scroll right"
            >
              Right
              <FiChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div ref={collectorRailRef} className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2 pr-1">
            {filteredCollectorConfigs.map((config) => {
              const isSelected = config.id === selectedCollectorId;

              return (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => setSelectedCollectorId(config.id)}
                  className={`w-72 shrink-0 rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-800"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{config.category}</p>
                  <p className="mt-1 text-sm font-semibold">{config.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">{config.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
        {filteredCollectorConfigs.length === 0 ? <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">No collectors found for this search.</p> : null}
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="display-face text-2xl font-semibold">{selectedConfig.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{selectedConfig.subtitle}</p>
          {selectedSummary?.updatedAt ? (
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Last saved: {new Date(selectedSummary.updatedAt).toLocaleString()}
            </p>
          ) : null}
          {collectorApiError ? <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">{collectorApiError}</p> : null}
          {saveStatus ? <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-300">{saveStatus}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPersistedModal(true);
              setIsPersistedLoading(true);
              setPersistedViewData(null);
              setPersistedEditorText("");
              setPersistedEditorError(null);
              void (async () => {
                try {
                  const persistedData = await fetchPersistedCollectorData(selectedConfig.id);
                  setPersistedViewData(persistedData);
                  setPersistedEditorText(JSON.stringify(persistedData.values, null, 2));
                  setCollectorApiError(null);
                } catch {
                  setCollectorApiError("No persisted data found for this collector yet.");
                } finally {
                  setIsPersistedLoading(false);
                }
              })();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            View Persisted Data
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
            <FiUploadCloud className="h-3.5 w-3.5" />
            {selectedConfig.importButtonLabel}
          </button>
        </div>
      </div>

      <section className="grid gap-3 lg:h-[calc(100dvh-19rem)] lg:grid-cols-[240px_minmax(0,1fr)_260px]">
        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/90 lg:overflow-y-auto">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">{selectedConfig.title}</h2>
          <p className="mb-2 text-[11px] text-zinc-500 dark:text-zinc-400">Step Navigator</p>
          <SearchInputWithClear
            value={leftStepSearch}
            onChange={setLeftStepSearch}
            onClear={() => setLeftStepSearch("")}
            placeholder="Search steps"
            clearAriaLabel="Clear step search"
            containerClassName="relative mb-2"
          />
          <ol className="space-y-2">
            {filteredStepItems.map(({ step, index }) => {
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">{step.title}</span>
                      {isDone ? <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{step.description}</p>
                  </button>
                </li>
              );
            })}
          </ol>
          {filteredStepItems.length === 0 ? <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">No steps match this search.</p> : null}

          <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Current Step Fields ({filteredStepFieldItems.length}/{activeStepFieldItems.length})</h3>
            <SearchInputWithClear
              value={stepFieldSearch}
              onChange={setStepFieldSearch}
              onClear={() => setStepFieldSearch("")}
              placeholder="Search step fields"
              clearAriaLabel="Clear step fields search"
              containerClassName="relative mb-2"
            />
            <div className="space-y-1">
              {filteredStepFieldItems.map((item, index) => (
                <button
                  key={`${item.field.key}-${index}`}
                  type="button"
                  onClick={() => focusFieldByKey(item.field.key)}
                  className="w-full rounded border border-zinc-200/80 bg-zinc-50/80 px-2 py-1 text-left text-[11px] transition hover:border-blue-300 hover:bg-blue-50/80 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                  title={`Go to ${item.field.label}`}
                >
                  <p className="truncate font-medium text-zinc-700 dark:text-zinc-200">{item.field.label}</p>
                  <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">{item.sectionTitle}</p>
                </button>
              ))}
            </div>
            {filteredStepFieldItems.length === 0 ? <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">No fields match this search.</p> : null}
          </div>
        </aside>

        <article className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white/95 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/95 lg:h-full">
          <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Current Step</p>
            <h2 className="mt-1 text-lg font-semibold">{activeStep.title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{activeStep.description}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">{renderStepForm()}</div>

          <footer className="sticky bottom-0 mt-auto shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 bg-white/95 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/95">
            <div>
              <p className="text-xs font-semibold">Step {currentStep + 1} of {selectedConfig.steps.length}</p>
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
                  onClick={validateActiveStepAndProceed}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Next
                  <FiChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      try {
                        const response = await persistCollectorValues(selectedConfig.id, formValues);
                        setCollectorApiError(null);
                        setSaveStatus("Collector data saved to backend.");
                        setCollectorSummaries((prev) =>
                          prev.map((item) =>
                            item.id === selectedConfig.id ? { ...item, updatedAt: response.updatedAt } : item,
                          ),
                        );
                      } catch {
                        setCollectorApiError("Unable to save collector data to backend.");
                        setSaveStatus(null);
                      }
                    })();
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Start Collection
                  <FiArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </footer>
        </article>

        <aside className="rounded-xl border border-zinc-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/90 lg:overflow-y-auto">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">{selectedConfig.title}</h2>
          <p className="mb-2 text-[11px] text-zinc-500 dark:text-zinc-400">Related Links</p>
          <SearchInputWithClear
            value={rightLinkSearch}
            onChange={setRightLinkSearch}
            onClear={() => setRightLinkSearch("")}
            placeholder="Search links"
            clearAriaLabel="Clear links search"
            containerClassName="relative mb-2"
          />
          <div className="space-y-2">
            {filteredRightLinks.map((item) => renderExtraLink(item))}
          </div>
          {filteredRightLinks.length === 0 ? <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">No links match this search.</p> : null}
        </aside>
      </section>

      {showPersistedModal ? (
        <div className="fixed inset-0 z-40 bg-black/55 p-4">
          <div className="mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111926]">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <h3 className="text-sm font-semibold">Persisted Data: {selectedConfig.title}</h3>
              <button
                type="button"
                onClick={() => setShowPersistedModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700"
                aria-label="Close persisted data modal"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              {isPersistedLoading ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading persisted data...</p>
              ) : null}

              {!isPersistedLoading && persistedViewData ? (
                <>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Last updated: {persistedViewData.updatedAt ? new Date(persistedViewData.updatedAt).toLocaleString() : "N/A"}
                  </p>
                  <textarea
                    value={persistedEditorText}
                    onChange={(event) => {
                      setPersistedEditorText(event.target.value);
                      if (persistedEditorError) {
                        setPersistedEditorError(null);
                      }
                    }}
                    className="min-h-80 max-h-[60vh] w-full overflow-auto rounded border border-zinc-300 bg-zinc-950 p-3 text-[11px] text-zinc-200 outline-none focus:border-blue-500 dark:border-zinc-700"
                  />
                  {persistedEditorError ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-300">{persistedEditorError}</p>
                  ) : null}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const nextValues = parsePersistedEditorValues();
                        if (!nextValues) {
                          return;
                        }

                        setIsPersistedSaving(true);
                        void (async () => {
                          try {
                            const response = await updatePersistedCollectorData(selectedConfig.id, nextValues);
                            setPersistedViewData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    values: nextValues,
                                    updatedAt: response.updatedAt,
                                  }
                                : prev,
                            );
                            setCollectorSummaries((prev) =>
                              prev.map((item) =>
                                item.id === selectedConfig.id ? { ...item, updatedAt: response.updatedAt } : item,
                              ),
                            );
                            setFormValues((prev) => ({ ...prev, ...nextValues }));
                            setCollectorApiError(null);
                            setSaveStatus("Persisted data updated.");
                          } catch {
                            setPersistedEditorError("Unable to save persisted data updates.");
                          } finally {
                            setIsPersistedSaving(false);
                          }
                        })();
                      }}
                      disabled={isPersistedSaving}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPersistedSaving ? "Saving..." : "Save Updates"}
                    </button>
                  </div>
                </>
              ) : null}

              {!isPersistedLoading && !persistedViewData ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No persisted data available.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
