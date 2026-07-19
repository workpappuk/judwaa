"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

import { ONBOARD_STEPS, type OnboardFieldConfig } from "./config";

type SubmissionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  tenantCode?: string;
};

export default function NocodeSelfOnboardPage() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validateStep = (stepIndex: number): boolean => {
    if (!formRef.current) {
      return false;
    }

    const formData = new FormData(formRef.current);
    const step = ONBOARD_STEPS[stepIndex];

    for (const field of step.fields) {
      const raw = String(formData.get(field.name) ?? "").trim();
      const checked = formData.get(field.name) === "on";

      if (field.required) {
        if (field.type === "checkbox" && !checked) {
          setStepError(`Please confirm: ${field.label}`);
          return false;
        }

        if (field.type !== "checkbox" && raw.length === 0) {
          setStepError(`Please fill: ${field.label}`);
          return false;
        }
      }

      if (field.minLength && raw.length > 0 && raw.length < field.minLength) {
        setStepError(`${field.label} must be at least ${field.minLength} characters.`);
        return false;
      }

      if (field.type === "email" && raw.length > 0 && !/^\S+@\S+\.\S+$/.test(raw)) {
        setStepError("Please enter a valid email address.");
        return false;
      }
    }

    setStepError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep((previous) => Math.min(previous + 1, ONBOARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setStepError(null);
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!validateStep(currentStep)) {
      return;
    }

    const formData = new FormData(form);
    const stepFields = ONBOARD_STEPS.flatMap((step) => step.fields);

    const values: Record<string, unknown> = {};
    for (const field of stepFields) {
      if (field.type === "checkbox") {
        values[field.name] = formData.get(field.name) === "on";
        continue;
      }

      const raw = String(formData.get(field.name) ?? "");
      values[field.name] = field.booleanFromYesNo ? raw === "yes" : raw;
    }

    const payload = {
      companyName: String(values.companyName ?? ""),
      contactName: String(values.contactName ?? ""),
      contactEmail: String(values.contactEmail ?? ""),
      contactPhone: String(values.contactPhone ?? ""),
      country: String(values.country ?? ""),
      domainSlug: String(values.domainSlug ?? ""),
      employeeRange: String(values.employeeRange ?? ""),
      implementationTimeline: String(values.implementationTimeline ?? ""),
      primaryUseCase: String(values.primaryUseCase ?? ""),
      integrationNeeds: String(values.integrationNeeds ?? ""),
      migrationRequired: Boolean(values.migrationRequired),
      acceptedTerms: Boolean(values.acceptedTerms),
    };

    setState({ status: "loading" });

    try {
      const response = await fetch("/nocode/api/onboarding/self-serve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; onboarding?: { tenantCode?: string } };

      if (!response.ok) {
        setState({ status: "error", message: data.message ?? "Unable to submit onboarding request." });
        return;
      }

      setState({
        status: "success",
        message: data.message ?? "Onboarding request submitted.",
        tenantCode: data.onboarding?.tenantCode,
      });
      setStepError(null);
      form.reset();
      setCurrentStep(0);
    } catch {
      setState({ status: "error", message: "Network error while submitting request." });
    }
  };

  const renderField = (field: OnboardFieldConfig) => {
    const wrapperStyles = {
      gridColumn: field.colSpan === "full" ? { xs: "span 1", sm: "span 2" } : { xs: "span 1", sm: "span 1" },
    };

    if (field.type === "textarea") {
      return (
        <Box key={field.name} sx={wrapperStyles}>
          <TextField
            name={field.name}
            label={field.label}
            fullWidth
            required={field.required}
            multiline
            minRows={field.rows ?? 3}
            slotProps={{ htmlInput: { minLength: field.minLength } }}
            placeholder={field.placeholder}
          />
        </Box>
      );
    }

    if (field.type === "select") {
      return (
        <Box key={field.name} sx={wrapperStyles}>
          <FormControl fullWidth required={field.required}>
            <FormLabel sx={{ mb: 1, fontSize: 13 }}>{field.label}</FormLabel>
            <Select name={field.name} defaultValue="" displayEmpty>
              <MenuItem value="" disabled>
                Select {field.label.toLowerCase()}
              </MenuItem>
              {(field.options ?? []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    }

    if (field.type === "radio") {
      return (
        <Box key={field.name} sx={wrapperStyles}>
          <FormControl required={field.required}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup name={field.name} row>
              {(field.options ?? []).map((option) => (
                <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    }

    if (field.type === "checkbox") {
      return (
        <Box key={field.name} sx={wrapperStyles}>
          <FormControlLabel control={<Checkbox name={field.name} required={field.required} />} label={field.label} />
        </Box>
      );
    }

    return (
      <Box key={field.name} sx={wrapperStyles}>
        <TextField
          name={field.name}
          label={field.label}
          type={field.type}
          fullWidth
          required={field.required}
          slotProps={{ htmlInput: { minLength: field.minLength } }}
          placeholder={field.placeholder}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "calc(100vh - 7rem)",
        borderRadius: 3,
        p: 1.5,
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(var(--mui-palette-success-lightChannel) / 0.14) 0%, rgba(var(--mui-palette-info-lightChannel) / 0.18) 45%, rgba(var(--mui-palette-warning-lightChannel) / 0.2) 100%)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -120,
          right: -90,
          width: 250,
          height: 250,
          borderRadius: "50%",
          bgcolor: "rgba(var(--mui-palette-info-mainChannel) / 0.16)",
          filter: "blur(8px)",
        }}
      />

      <Paper
        elevation={9}
        sx={{
          position: "relative",
          mx: "auto",
          maxWidth: 980,
          borderRadius: 4,
          p: { xs: 2.5, sm: 4 },
          backgroundColor: "rgba(var(--mui-palette-background-paperChannel) / 0.9)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" sx={{ color: "success.dark", fontWeight: 800, letterSpacing: "0.14em" }}>
          Nocode Self-Serve
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: "text.primary" }}>
          Onboard your company in minutes
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.8 }}>
          Submit your company details, business context, and implementation preferences. Our platform creates your tenant onboarding request instantly.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2.5,
            borderColor: "divider",
            background: "linear-gradient(180deg, rgba(var(--mui-palette-primary-lightChannel) / 0.08) 0%, var(--mui-palette-background-paper) 100%)",
          }}
        >
          <Stepper activeStep={currentStep} alternativeLabel>
            {ONBOARD_STEPS.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {stepError ? (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {stepError}
          </Alert>
        ) : null}

        <Box
          component="form"
          ref={formRef}
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          {ONBOARD_STEPS[currentStep].fields.map((field) => renderField(field))}

          <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" }, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {currentStep > 0 ? (
              <Button variant="outlined" onClick={handleBack} sx={{ fontWeight: 700 }}>
                Back
              </Button>
            ) : null}

            {currentStep < ONBOARD_STEPS.length - 1 ? (
              <Button variant="contained" onClick={handleNext} sx={{ fontWeight: 700, bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={state.status === "loading"}
                sx={{ fontWeight: 700, bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
              >
                {state.status === "loading" ? "Submitting..." : "Submit Onboarding"}
              </Button>
            )}

            <Button component={Link} href="/nocode/marketing" variant="text" color="inherit" sx={{ fontWeight: 700 }}>
              Back to Marketing
            </Button>
          </Box>
        </Box>

        {state.status === "success" ? (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">{state.message}</Typography>
            {state.tenantCode ? <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>Tenant Code: {state.tenantCode}</Typography> : null}
          </Alert>
        ) : null}

        {state.status === "error" ? (
          <Alert severity="error" sx={{ mt: 3 }}>
            {state.message}
          </Alert>
        ) : null}
      </Paper>
    </Box>
  );
}
