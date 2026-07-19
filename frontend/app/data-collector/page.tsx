"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FiArrowRight, FiCheckCircle, FiChevronLeft, FiChevronRight, FiUploadCloud, FiX } from "react-icons/fi";

import {
  collectorConfigs,
  getDefaultFormValues,
  type CollectorField,
  type CollectorFieldValue,
  type CollectorFormValues,
  type CollectorSection,
} from "./config";
import {
  fetchCollectorDetail,
  fetchCollectorSummaries,
  fetchPersistedCollectorData,
  persistCollectorValues,
  type CollectorSummary,
  type PersistedCollectorData,
  updatePersistedCollectorData,
} from "@/services/data-collector-api";

type SearchInputWithClearProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  clearAriaLabel: string;
  size?: "small" | "medium";
};

function SearchInputWithClear({
  value,
  onChange,
  onClear,
  placeholder,
  clearAriaLabel,
  size = "small",
}: SearchInputWithClearProps) {
  return (
    <TextField
      size={size}
      fullWidth
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClear} aria-label={clearAriaLabel} title="Clear">
                <FiX size={14} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
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
    () =>
      collectorConfigs.map((config) => ({
        id: config.id,
        category: config.category,
        title: config.title,
        subtitle: config.subtitle,
        importButtonLabel: config.importButtonLabel,
        related: {
          steps: config.steps.length,
          sections: config.steps.reduce((count, step) => count + step.sections.length, 0),
          fields: config.steps.reduce(
            (count, step) =>
              count + step.sections.reduce((sectionCount, section) => sectionCount + section.fields.length, 0),
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

  const progress = useMemo(
    () => Math.round(((currentStep + 1) / selectedConfig.steps.length) * 100),
    [currentStep, selectedConfig.steps.length],
  );
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
    const gridColumn = field.colSpan === 2 ? { xs: "span 1", md: "span 2" } : { xs: "span 1", md: "span 1" };
    const value = formValues[field.key];
    const error = fieldErrors[field.key];

    if (field.type === "checkbox") {
      return (
        <Box key={field.key} sx={{ gridColumn }}>
          <FormControlLabel
            control={
              <Checkbox
                id={`field-${field.key}`}
                checked={Boolean(value)}
                onChange={(event) => handleFieldChange(field.key, event.target.checked)}
              />
            }
            label={field.label}
          />
          {error ? (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          ) : null}
        </Box>
      );
    }

    if (field.type === "select") {
      return (
        <TextField
          key={field.key}
          id={`field-${field.key}`}
          select
          size="small"
          fullWidth
          label={field.label}
          value={String(value)}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          error={Boolean(error)}
          helperText={error ?? " "}
          sx={{ gridColumn }}
        >
          {(field.options ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.type === "textarea") {
      return (
        <TextField
          key={field.key}
          id={`field-${field.key}`}
          size="small"
          fullWidth
          multiline
          rows={field.rows ?? 3}
          label={field.label}
          value={String(value)}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          error={Boolean(error)}
          helperText={error ?? " "}
          placeholder={field.placeholder}
          sx={{ gridColumn }}
        />
      );
    }

    if (field.type === "number") {
      return (
        <TextField
          key={field.key}
          id={`field-${field.key}`}
          type="number"
          size="small"
          fullWidth
          label={field.label}
          value={String(value)}
          onChange={(event) => {
            const raw = event.target.value;
            handleFieldChange(field.key, raw === "" ? "" : Number(raw));
          }}
          error={Boolean(error)}
          helperText={error ?? " "}
          placeholder={field.placeholder}
          slotProps={{
            htmlInput: {
              min: field.min,
              max: field.max,
              step: field.step,
            },
          }}
          sx={{ gridColumn }}
        />
      );
    }

    return (
      <TextField
        key={field.key}
        id={`field-${field.key}`}
        type={
          field.type === "date"
          || field.type === "email"
          || field.type === "url"
          || field.type === "tel"
          || field.type === "time"
          || field.type === "password"
            ? field.type
            : "text"
        }
        size="small"
        fullWidth
        label={field.label}
        value={String(value)}
        onChange={(event) => handleFieldChange(field.key, event.target.value)}
        error={Boolean(error)}
        helperText={error ?? " "}
        placeholder={field.placeholder}
        sx={{ gridColumn }}
      />
    );
  };

  const renderSection = (section: CollectorSection) => {
    return (
      <Paper key={section.id} variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2">{section.title}</Typography>
        {section.description ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {section.description}
          </Typography>
        ) : null}
        <Box
          sx={{
            mt: 1.5,
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {section.fields.map((field) => renderField(field))}
        </Box>
      </Paper>
    );
  };

  const renderExtraLink = (item: SidebarLink) => {
    if (item.external) {
      return (
        <Button
          key={item.label}
          component="a"
          href={item.href}
          target="_blank"
          rel="noreferrer"
          fullWidth
          variant="outlined"
          endIcon={<FiArrowRight size={14} />}
          sx={{ justifyContent: "space-between", textTransform: "none" }}
        >
          {item.label}
        </Button>
      );
    }

    return (
      <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<FiArrowRight size={14} />}
          sx={{ justifyContent: "space-between", textTransform: "none" }}
        >
          {item.label}
        </Button>
      </Link>
    );
  };

  const renderStepForm = () => {
    if (activeStep.sections.length > 0) {
      return <Stack spacing={2}>{activeStep.sections.map((section) => renderSection(section))}</Stack>;
    }

    const reviewSteps = selectedConfig.steps.filter((step) => step.sections.length > 0);
    const filledFieldCount = Object.values(formValues).filter((value) => String(value).trim().length > 0).length;

    return (
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="subtitle2">Collected Data Review</Typography>
            <Chip
              size="small"
              color="primary"
              label={`${filledFieldCount}/${Object.keys(formValues).length} fields filled`}
            />
          </Box>

          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {reviewSteps.map((step) => (
              <Paper key={step.id} variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {step.title}
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {step.sections.map((section) => (
                    <Paper key={section.id} variant="outlined" sx={{ p: 1.25 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                        {section.title}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "grid",
                          gap: 1,
                          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                        }}
                      >
                        {section.fields.map((field) => (
                          <Paper key={field.key} variant="outlined" sx={{ p: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                              {field.label}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {formatValue(formValues[field.key])}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
              Raw Payload Preview
            </Typography>
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                maxHeight: 280,
                overflow: "auto",
                bgcolor: "grey.950",
                color: "grey.100",
                fontSize: 12,
              }}
            >
              {JSON.stringify(formValues, null, 2)}
            </Box>
          </Paper>
        </Paper>

        <Alert severity="success">Ready to run initial data collection with current settings.</Alert>
      </Stack>
    );
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 7rem)",
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top left, #1e293b 0%, #111827 42%, #090d16 100%)"
            : "radial-gradient(circle at top left, #dbeafe, #f4f7ff 45%, #eef2ff 75%)",
      }}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Available Data Collectors
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Choose a config to load wizard defaults
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {filteredCollectorConfigs.length} collectors
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <Box sx={{ width: { xs: "100%", md: 320 } }}>
            <SearchInputWithClear
              value={collectorSearch}
              onChange={setCollectorSearch}
              onClear={() => setCollectorSearch("")}
              placeholder="Search by name, id, or category"
              clearAriaLabel="Clear collector search"
            />
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => scrollCollectorRail("left")} startIcon={<FiChevronLeft />}>
              Left
            </Button>
            <Button variant="outlined" size="small" onClick={() => scrollCollectorRail("right")} endIcon={<FiChevronRight />}>
              Right
            </Button>
          </Stack>
        </Stack>

        <Box ref={collectorRailRef} sx={{ mt: 2, overflowX: "auto", pb: 0.5 }}>
          <Stack direction="row" spacing={1.25} sx={{ minWidth: "max-content", pr: 1 }}>
            {filteredCollectorConfigs.map((config) => {
              const isSelected = config.id === selectedCollectorId;

              return (
                <Paper
                  key={config.id}
                  variant="outlined"
                  sx={{
                    width: 288,
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected ? "action.selected" : "background.paper",
                  }}
                >
                  <Button
                    fullWidth
                    onClick={() => setSelectedCollectorId(config.id)}
                    sx={{ p: 2, textAlign: "left", textTransform: "none", alignItems: "flex-start", justifyContent: "flex-start" }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                        {config.category}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                        {config.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {config.subtitle}
                      </Typography>
                    </Box>
                  </Button>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        {filteredCollectorConfigs.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
            No collectors found for this search.
          </Typography>
        ) : null}
      </Paper>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { md: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedConfig.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedConfig.subtitle}
          </Typography>
          {selectedSummary?.updatedAt ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Last saved: {new Date(selectedSummary.updatedAt).toLocaleString()}
            </Typography>
          ) : null}
          {collectorApiError ? (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              {collectorApiError}
            </Typography>
          ) : null}
          {saveStatus ? (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
              {saveStatus}
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1.25}>
          <Button
            variant="outlined"
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
          >
            View Persisted Data
          </Button>
          <Button variant="contained" startIcon={<FiUploadCloud size={14} />}>
            {selectedConfig.importButtonLabel}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "240px minmax(0, 1fr) 260px" },
          minHeight: { lg: "calc(100dvh - 19rem)" },
        }}
      >
        <Paper variant="outlined" sx={{ p: 2, overflowY: { lg: "auto" } }}>
          <Typography variant="overline" color="text.secondary">
            {selectedConfig.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Step Navigator
          </Typography>

          <SearchInputWithClear
            value={leftStepSearch}
            onChange={setLeftStepSearch}
            onClear={() => setLeftStepSearch("")}
            placeholder="Search steps"
            clearAriaLabel="Clear step search"
          />

          <Stack spacing={1} sx={{ mt: 1.5 }}>
            {filteredStepItems.map(({ step, index }) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <Button
                  key={step.id}
                  variant={isActive ? "contained" : "outlined"}
                  color={isActive ? "primary" : "inherit"}
                  onClick={() => setCurrentStep(index)}
                  sx={{ textTransform: "none", justifyContent: "space-between", p: 1.25 }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: isActive ? 0.9 : 1 }}>
                      {step.description}
                    </Typography>
                  </Box>
                  {isDone ? <FiCheckCircle size={14} /> : null}
                </Button>
              );
            })}
          </Stack>

          {filteredStepItems.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
              No steps match this search.
            </Typography>
          ) : null}

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Current Step Fields ({filteredStepFieldItems.length}/{activeStepFieldItems.length})
          </Typography>

          <Box sx={{ mt: 1 }}>
            <SearchInputWithClear
              value={stepFieldSearch}
              onChange={setStepFieldSearch}
              onClear={() => setStepFieldSearch("")}
              placeholder="Search step fields"
              clearAriaLabel="Clear step fields search"
            />
          </Box>

          <Stack spacing={1} sx={{ mt: 1.25 }}>
            {filteredStepFieldItems.map((item, index) => (
              <Button
                key={`${item.field.key}-${index}`}
                variant="outlined"
                color="inherit"
                onClick={() => focusFieldByKey(item.field.key)}
                sx={{ textTransform: "none", alignItems: "flex-start", textAlign: "left" }}
                title={`Go to ${item.field.label}`}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: "text.primary", display: "block" }}>
                    {item.field.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.sectionTitle}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Stack>

          {filteredStepFieldItems.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
              No fields match this search.
            </Typography>
          ) : null}
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: { lg: "100%" },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="overline" color="primary">
              Current Step
            </Typography>
            <Typography variant="h6">{activeStep.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {activeStep.description}
            </Typography>
          </Box>

          <Box sx={{ p: 2, flex: 1, minHeight: 0, overflowY: "auto" }}>{renderStepForm()}</Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Step {currentStep + 1} of {selectedConfig.steps.length}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">
                Progress: {progress}%
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={isFirst}
                startIcon={<FiChevronLeft size={14} />}
              >
                Previous
              </Button>

              {!isLast ? (
                <Button variant="contained" onClick={validateActiveStepAndProceed} endIcon={<FiChevronRight size={14} />}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
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
                  endIcon={<FiArrowRight size={14} />}
                >
                  Start Collection
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, overflowY: { lg: "auto" } }}>
          <Typography variant="overline" color="text.secondary">
            {selectedConfig.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Related Links
          </Typography>

          <SearchInputWithClear
            value={rightLinkSearch}
            onChange={setRightLinkSearch}
            onClear={() => setRightLinkSearch("")}
            placeholder="Search links"
            clearAriaLabel="Clear links search"
          />

          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            {filteredRightLinks.map((item) => renderExtraLink(item))}
          </Stack>

          {filteredRightLinks.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
              No links match this search.
            </Typography>
          ) : null}
        </Paper>
      </Box>

      <Dialog open={showPersistedModal} onClose={() => setShowPersistedModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          Persisted Data: {selectedConfig.title}
          <IconButton
            onClick={() => setShowPersistedModal(false)}
            aria-label="Close persisted data modal"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <FiX size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isPersistedLoading ? <Typography variant="body2">Loading persisted data...</Typography> : null}

          {!isPersistedLoading && persistedViewData ? (
            <Stack spacing={1.25}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {persistedViewData.updatedAt ? new Date(persistedViewData.updatedAt).toLocaleString() : "N/A"}
              </Typography>

              <TextField
                multiline
                minRows={14}
                maxRows={24}
                fullWidth
                value={persistedEditorText}
                onChange={(event) => {
                  setPersistedEditorText(event.target.value);
                  if (persistedEditorError) {
                    setPersistedEditorError(null);
                  }
                }}
                error={Boolean(persistedEditorError)}
                helperText={persistedEditorError ?? " "}
              />
            </Stack>
          ) : null}

          {!isPersistedLoading && !persistedViewData ? (
            <Typography variant="body2" color="text.secondary">
              No persisted data available.
            </Typography>
          ) : null}
        </DialogContent>

        <DialogActions>
          {!isPersistedLoading && persistedViewData ? (
            <Button
              variant="contained"
              color="success"
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
            >
              {isPersistedSaving ? "Saving..." : "Save Updates"}
            </Button>
          ) : null}
          <Button onClick={() => setShowPersistedModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
