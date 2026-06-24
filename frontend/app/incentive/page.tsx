"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiEdit2,
  FiEye,
  FiPlay,
  FiPlus,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";

import {
  createIncentiveRule,
  createIncentiveScheme,
  deleteIncentiveRule,
  listIncentiveRules,
  listIncentiveRuns,
  listIncentiveSchemes,
  runIncentiveCalculation,
  updateIncentiveRule,
} from "@/services/incentive-api";
import Tabs from "@/components/tab";
import type {
  IncentiveCalculationRun,
  IncentiveConflictStrategy,
  IncentiveRule,
  IncentiveRuleRequest,
  IncentiveRuleStatus,
  IncentiveRuleType,
  IncentiveScheme,
  IncentiveSchemeRequest,
  IncentiveSchemeStatus,
} from "@/types/incentive";

type ActiveTab = "schemes" | "rules" | "runs";

type ConditionRow = {
  field: string;
  operator: string;
  value1: string;
  value2: string;
};

type SlabRow = {
  min: string;
  max: string;
  percent: string;
};

const PAGE_SIZE = 20;

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (durationMs: number): string => `${(durationMs / 1000).toFixed(1)}s`;

const parseConditions = (conditionsJson: string): ConditionRow[] => {
  try {
    const parsed = JSON.parse(conditionsJson) as ConditionRow[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to default when stored JSON is malformed.
  }

  return [{ field: "net_sales", operator: ">=", value1: "500000", value2: "" }];
};

const parseSlabs = (slabsJson: string | null): SlabRow[] => {
  if (!slabsJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(slabsJson) as SlabRow[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to default when stored JSON is malformed.
  }

  return [];
};

export default function IncentivePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("schemes");
  const [selectedScheme, setSelectedScheme] = useState<IncentiveScheme | null>(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showSchemeForm, setShowSchemeForm] = useState(false);

  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [runningCalculation, setRunningCalculation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [schemes, setSchemes] = useState<IncentiveScheme[]>([]);
  const [rules, setRules] = useState<IncentiveRule[]>([]);
  const [calculationRuns, setCalculationRuns] = useState<IncentiveCalculationRun[]>([]);

  const [schemeForm, setSchemeForm] = useState<IncentiveSchemeRequest>({
    name: "",
    description: "",
    status: "DRAFT",
    startDate: "",
    endDate: "",
  });

  const [ruleType, setRuleType] = useState<IncentiveRuleType>("SLAB");
  const [ruleName, setRuleName] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [rulePriority, setRulePriority] = useState("1");
  const [ruleStatus, setRuleStatus] = useState<IncentiveRuleStatus>("ACTIVE");
  const [conflictStrategy, setConflictStrategy] = useState<IncentiveConflictStrategy>("ADDITIVE");
  const [conditions, setConditions] = useState<ConditionRow[]>([
    { field: "net_sales", operator: ">=", value1: "500000", value2: "" },
  ]);
  const [slabs, setSlabs] = useState<SlabRow[]>([
    { min: "0", max: "100000", percent: "1" },
    { min: "100000", max: "500000", percent: "2" },
    { min: "500000", max: "", percent: "3" },
  ]);

  const [schemeStatusFilter, setSchemeStatusFilter] = useState<IncentiveSchemeStatus | "ALL">("ALL");

  const canCreateScheme =
    schemeForm.name.trim().length > 0 &&
    schemeForm.startDate.length > 0 &&
    schemeForm.endDate.length > 0;

  const canCreateRule = useMemo(() => {
    if (!selectedScheme || !selectedScheme.id) {
      return false;
    }

    if (ruleName.trim().length === 0) {
      return false;
    }

    const parsedPriority = Number(rulePriority);
    if (!Number.isFinite(parsedPriority) || parsedPriority < 1) {
      return false;
    }

    if (conditions.length === 0) {
      return false;
    }

    return conditions.every((condition) => condition.field && condition.operator && condition.value1.trim().length > 0);
  }, [conditions, ruleName, rulePriority, selectedScheme]);

  useEffect(() => {
    const controller = new AbortController();

    const loadSchemes = async () => {
      setLoadingSchemes(true);
      setError(null);
      try {
        const response = await listIncentiveSchemes(
          1,
          PAGE_SIZE,
          schemeStatusFilter === "ALL" ? undefined : schemeStatusFilter,
          controller.signal,
        );
        setSchemes(response.content);

        const shouldResetSelection =
          !selectedScheme || !response.content.some((scheme) => scheme.id === selectedScheme.id);
        if (shouldResetSelection) {
          setSelectedScheme(response.content[0] ?? null);
        }
      } catch {
        setError("Unable to load schemes right now.");
      } finally {
        setLoadingSchemes(false);
      }
    };

    void loadSchemes();

    return () => {
      controller.abort();
    };
  }, [schemeStatusFilter]);

  useEffect(() => {
    if (!selectedScheme || !selectedScheme.id) {
      setRules([]);
      return;
    }

    const controller = new AbortController();
    const loadRules = async () => {
      setLoadingRules(true);
      setError(null);
      try {
        const response = await listIncentiveRules(selectedScheme.id, 1, PAGE_SIZE, controller.signal);
        setRules(response.content);
      } catch {
        setError("Unable to load rules right now.");
      } finally {
        setLoadingRules(false);
      }
    };

    void loadRules();

    return () => {
      controller.abort();
    };
  }, [selectedScheme]);

  useEffect(() => {
    if (!selectedScheme || !selectedScheme.id) {
      setCalculationRuns([]);
      return;
    }

    const controller = new AbortController();
    const loadRuns = async () => {
      setLoadingRuns(true);
      setError(null);
      try {
        const response = await listIncentiveRuns(selectedScheme.id, 1, PAGE_SIZE, controller.signal);
        setCalculationRuns(response.content);
      } catch {
        setError("Unable to load calculation history right now.");
      } finally {
        setLoadingRuns(false);
      }
    };

    void loadRuns();

    return () => {
      controller.abort();
    };
  }, [selectedScheme]);

  const refreshSchemes = async () => {
    const response = await listIncentiveSchemes(
      1,
      PAGE_SIZE,
      schemeStatusFilter === "ALL" ? undefined : schemeStatusFilter,
    );
    setSchemes(response.content);

    if (selectedScheme?.id) {
      const updatedSelected = response.content.find((scheme) => scheme.id === selectedScheme.id) ?? null;
      setSelectedScheme(updatedSelected);
    }
  };

  const resetRuleBuilder = () => {
    setEditingRuleId(null);
    setRuleName("");
    setRuleType("SLAB");
    setRulePriority("1");
    setRuleStatus("ACTIVE");
    setConflictStrategy("ADDITIVE");
    setConditions([{ field: "net_sales", operator: ">=", value1: "500000", value2: "" }]);
    setSlabs([
      { min: "0", max: "100000", percent: "1" },
      { min: "100000", max: "500000", percent: "2" },
      { min: "500000", max: "", percent: "3" },
    ]);
  };

  const handleCreateScheme = async () => {
    if (!canCreateScheme) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const created = await createIncentiveScheme(schemeForm);
      await refreshSchemes();
      setSelectedScheme(created);
      setShowSchemeForm(false);
      setSchemeForm({
        name: "",
        description: "",
        status: "DRAFT",
        startDate: "",
        endDate: "",
      });
      setMessage("Scheme created successfully.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create scheme right now.");
    }
  };

  const handleCreateOrUpdateRule = async () => {
    if (!selectedScheme?.id || !canCreateRule) {
      return;
    }

    setError(null);
    setMessage(null);

    const payload: IncentiveRuleRequest = {
      name: ruleName.trim(),
      type: ruleType,
      priority: Math.max(1, Number(rulePriority)),
      status: ruleStatus,
      conflictStrategy,
      conditionsJson: JSON.stringify(conditions),
      slabsJson: ruleType === "SLAB" ? JSON.stringify(slabs) : "",
    };

    try {
      if (editingRuleId) {
        await updateIncentiveRule(editingRuleId, payload);
      } else {
        await createIncentiveRule(selectedScheme.id, payload);
      }
      const response = await listIncentiveRules(selectedScheme.id, 1, PAGE_SIZE);
      setRules(response.content);
      await refreshSchemes();
      resetRuleBuilder();
      setShowRuleBuilder(false);
      setMessage(editingRuleId ? "Rule updated successfully." : "Rule saved successfully.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to save rule right now.");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setError(null);
    setMessage(null);

    try {
      await deleteIncentiveRule(ruleId);
      if (selectedScheme?.id) {
        const response = await listIncentiveRules(selectedScheme.id, 1, PAGE_SIZE);
        setRules(response.content);
        await refreshSchemes();
      }
      setMessage("Rule deleted successfully.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete rule right now.");
    }
  };

  const handleRunCalculation = async (schemeOverride?: IncentiveScheme) => {
    const targetScheme = schemeOverride ?? selectedScheme;
    if (!targetScheme?.id) {
      setError("Select a scheme to run calculation.");
      return;
    }

    setRunningCalculation(true);
    setError(null);
    setMessage(null);

    try {
      setSelectedScheme(targetScheme);
      await runIncentiveCalculation(targetScheme.id);
      const runs = await listIncentiveRuns(targetScheme.id, 1, PAGE_SIZE);
      setCalculationRuns(runs.content);
      await refreshSchemes();
      setActiveTab("runs");
      setMessage("Calculation completed successfully.");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Unable to run calculation right now.");
    } finally {
      setRunningCalculation(false);
    }
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, { field: "net_sales", operator: "=", value1: "", value2: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const addSlab = () => {
    setSlabs((prev) => [...prev, { min: "", max: "", percent: "" }]);
  };

  const removeSlab = (index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#f4f7ff] text-zinc-900 dark:bg-[#0c1119] dark:text-zinc-100 pb-8 transition-colors rounded-xl p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="display-face text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Distributor Incentive Manager</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create and manage incentive schemes with a rule engine</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        ) : null}

        <Tabs
          className="mb-6"
          activeTab={activeTab}
          onTabChange={(tabId) => {
            if (tabId === "schemes") {
              setShowSchemeForm(false);
            }

            if (tabId === "rules") {
              setShowRuleBuilder(false);
            }

            setActiveTab(tabId as ActiveTab);
          }}
          showContent={false}
          ariaLabel="Incentive views"
          tabs={[
            { id: "schemes", label: "Schemes", content: null },
            { id: "rules", label: "Rules", content: null },
            { id: "runs", label: "Calculation History", content: null },
          ]}
        />

        {activeTab === "schemes" ? (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Incentive Schemes</h2>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs"
                  value={schemeStatusFilter}
                  onChange={(event) => setSchemeStatusFilter(event.target.value as IncentiveSchemeStatus | "ALL")}
                >
                  <option value="ALL">All Status</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
                <button
                  onClick={() => setShowSchemeForm(true)}
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                  New Scheme
                </button>
              </div>
            </div>

            {showSchemeForm ? (
              <div className="mb-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <h3 className="mb-3 text-base font-semibold">Create New Scheme</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="text-xs">
                    <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Scheme Name</span>
                    <input
                      type="text"
                      value={schemeForm.name}
                      onChange={(event) => setSchemeForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                      placeholder="e.g. Q2 Revenue Incentive"
                    />
                  </label>

                  <label className="text-xs">
                    <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Status</span>
                    <select
                      value={schemeForm.status}
                      onChange={(event) =>
                        setSchemeForm((prev) => ({ ...prev, status: event.target.value as IncentiveSchemeStatus }))
                      }
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="LOCKED">LOCKED</option>
                    </select>
                  </label>

                  <label className="text-xs">
                    <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Start Date</span>
                    <input
                      type="date"
                      value={schemeForm.startDate}
                      onChange={(event) => setSchemeForm((prev) => ({ ...prev, startDate: event.target.value }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                    />
                  </label>

                  <label className="text-xs">
                    <span className="mb-1 block text-zinc-500 dark:text-zinc-400">End Date</span>
                    <input
                      type="date"
                      value={schemeForm.endDate}
                      onChange={(event) => setSchemeForm((prev) => ({ ...prev, endDate: event.target.value }))}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                    />
                  </label>

                  <label className="text-xs md:col-span-2">
                    <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Description</span>
                    <textarea
                      value={schemeForm.description}
                      onChange={(event) => setSchemeForm((prev) => ({ ...prev, description: event.target.value }))}
                      rows={3}
                      className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                    />
                  </label>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCreateScheme}
                    type="button"
                    disabled={!canCreateScheme}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create Scheme
                  </button>
                  <button
                    onClick={() => setShowSchemeForm(false)}
                    type="button"
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {loadingSchemes ? (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                Loading schemes...
              </div>
            ) : null}

            {!loadingSchemes && schemes.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                No schemes found for selected filter.
              </div>
            ) : null}

            <div className="grid gap-3">
              {schemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className={`rounded-lg border bg-white dark:bg-zinc-900 p-4 shadow-sm transition ${
                    selectedScheme?.id === scheme.id
                      ? "border-blue-300 dark:border-blue-800"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold">{scheme.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            scheme.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : scheme.status === "DRAFT"
                                ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {scheme.status}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">v{scheme.version}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>
                          {formatDate(scheme.startDate)} to {formatDate(scheme.endDate)}
                        </span>
                        <span>{scheme.totalRules} rules</span>
                        {scheme.lastRunAt ? <span>Last run: {formatDateTime(scheme.lastRunAt)}</span> : null}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedScheme(scheme);
                          setActiveTab("rules");
                        }}
                        type="button"
                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        title="View Rules"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleRunCalculation(scheme)}
                        type="button"
                        disabled={runningCalculation}
                        className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50"
                        title="Run Calculation"
                      >
                        <FiPlay className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowSchemeForm(true);
                          setSchemeForm({
                            name: `${scheme.name} Copy`,
                            description: scheme.description,
                            status: "DRAFT",
                            startDate: scheme.startDate,
                            endDate: scheme.endDate,
                          });
                        }}
                        type="button"
                        className="rounded-md p-1.5 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        title="Duplicate"
                      >
                        <FiCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "rules" ? (
          <div>
            {!selectedScheme ? (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Select a scheme from Schemes tab to manage rules.
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <button
                      onClick={() => {
                        setActiveTab("schemes");
                        setShowRuleBuilder(false);
                      }}
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Back to Schemes
                    </button>
                    <h2 className="mt-1 text-xl font-semibold">{selectedScheme.name}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage rules for this scheme</p>
                  </div>
                  <button
                    onClick={() => setShowRuleBuilder(true)}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                    Add Rule
                  </button>
                </div>

                {showRuleBuilder ? (
                  <div className="mb-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                    <h3 className="mb-3 text-base font-semibold">{editingRuleId ? "Edit Incentive Rule" : "Build Incentive Rule"}</h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-xs">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Rule Name</span>
                        <input
                          type="text"
                          value={ruleName}
                          onChange={(event) => setRuleName(event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                          placeholder="e.g. High Volume Slab"
                        />
                      </label>

                      <label className="text-xs">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Rule Type</span>
                        <select
                          value={ruleType}
                          onChange={(event) => setRuleType(event.target.value as IncentiveRuleType)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                        >
                          <option value="SLAB">Slab-based Incentive</option>
                          <option value="GROWTH">Growth-based Bonus</option>
                          <option value="TARGET">Target Achievement</option>
                          <option value="FLAT">Flat Percentage</option>
                          <option value="MIX">Product Mix Incentive</option>
                        </select>
                      </label>

                      <label className="text-xs">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Priority</span>
                        <input
                          type="number"
                          min={1}
                          value={rulePriority}
                          onChange={(event) => setRulePriority(event.target.value)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                        />
                      </label>

                      <label className="text-xs">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Status</span>
                        <select
                          value={ruleStatus}
                          onChange={(event) => setRuleStatus(event.target.value as IncentiveRuleStatus)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </label>

                      <label className="text-xs md:col-span-2">
                        <span className="mb-1 block text-zinc-500 dark:text-zinc-400">Conflict Strategy</span>
                        <select
                          value={conflictStrategy}
                          onChange={(event) => setConflictStrategy(event.target.value as IncentiveConflictStrategy)}
                          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2"
                        >
                          <option value="ADDITIVE">ADDITIVE</option>
                          <option value="MAX">MAX</option>
                          <option value="PRIORITY">PRIORITY</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Conditions (IF)</h4>
                        <button
                          onClick={addCondition}
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                          Add Condition
                        </button>
                      </div>

                      <div className="space-y-2">
                        {conditions.map((condition, idx) => (
                          <div key={`${condition.field}-${idx}`} className="grid grid-cols-1 gap-2 md:grid-cols-12">
                            <select
                              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs md:col-span-3"
                              value={condition.field}
                              onChange={(event) => {
                                const next = [...conditions];
                                next[idx].field = event.target.value;
                                setConditions(next);
                              }}
                            >
                              <option value="net_sales">Net Sales</option>
                              <option value="quantity">Quantity</option>
                              <option value="category">Product Category</option>
                              <option value="region">Region</option>
                              <option value="growth">Growth %</option>
                            </select>
                            <select
                              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs md:col-span-2"
                              value={condition.operator}
                              onChange={(event) => {
                                const next = [...conditions];
                                next[idx].operator = event.target.value;
                                setConditions(next);
                              }}
                            >
                              <option value="=">=</option>
                              <option value=">">{">"}</option>
                              <option value="<">{"<"}</option>
                              <option value=">=">{">="}</option>
                              <option value="<=">{"<="}</option>
                              <option value="BETWEEN">BETWEEN</option>
                              <option value="IN">IN</option>
                            </select>
                            <input
                              type="text"
                              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs md:col-span-3"
                              value={condition.value1}
                              onChange={(event) => {
                                const next = [...conditions];
                                next[idx].value1 = event.target.value;
                                setConditions(next);
                              }}
                              placeholder="Value"
                            />
                            {condition.operator === "BETWEEN" ? (
                              <input
                                type="text"
                                className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs md:col-span-3"
                                value={condition.value2}
                                onChange={(event) => {
                                  const next = [...conditions];
                                  next[idx].value2 = event.target.value;
                                  setConditions(next);
                                }}
                                placeholder="To"
                              />
                            ) : (
                              <div className="md:col-span-3" />
                            )}
                            <button
                              onClick={() => removeCondition(idx)}
                              type="button"
                              disabled={conditions.length === 1}
                              className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50 md:col-span-1"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ruleType === "SLAB" ? (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Slab Configuration (THEN)</h4>
                          <button
                            onClick={addSlab}
                            type="button"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                            Add Slab
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                              <tr>
                                <th className="px-3 py-2">Min Sales</th>
                                <th className="px-3 py-2">Max Sales</th>
                                <th className="px-3 py-2">Incentive %</th>
                                <th className="w-10 px-2 py-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {slabs.map((slab, idx) => (
                                <tr key={`slab-${idx}`} className="border-t border-zinc-200 dark:border-zinc-800">
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={slab.min}
                                      onChange={(event) => {
                                        const next = [...slabs];
                                        next[idx].min = event.target.value;
                                        setSlabs(next);
                                      }}
                                      className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={slab.max}
                                      onChange={(event) => {
                                        const next = [...slabs];
                                        next[idx].max = event.target.value;
                                        setSlabs(next);
                                      }}
                                      className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
                                      placeholder="Unlimited"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={slab.percent}
                                      onChange={(event) => {
                                        const next = [...slabs];
                                        next[idx].percent = event.target.value;
                                        setSlabs(next);
                                      }}
                                      className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1"
                                      placeholder="2.5"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <button
                                      onClick={() => removeSlab(idx)}
                                      type="button"
                                      disabled={slabs.length === 1}
                                      className="rounded p-1 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                    >
                                      <FiTrash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                      <p className="font-semibold">Rule Preview</p>
                      <p className="mt-1">
                        IF {conditions.map((condition) => `${condition.field} ${condition.operator} ${condition.value1}`).join(" AND ")}
                      </p>
                      <p>THEN apply {ruleType.toLowerCase()} incentive</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleCreateOrUpdateRule}
                        type="button"
                        disabled={!canCreateRule}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {editingRuleId ? "Update Rule" : "Save Rule"}
                      </button>
                      <button
                        onClick={() => {
                          setShowRuleBuilder(false);
                          resetRuleBuilder();
                        }}
                        type="button"
                        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {loadingRules ? (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                    Loading rules...
                  </div>
                ) : null}

                {!loadingRules && !showRuleBuilder ? (
                  <div className="grid gap-3">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-semibold">{rule.name}</h3>
                              <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                                {rule.type}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Priority {rule.priority}</span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <span>Status: {rule.status}</span>
                              <span>Strategy: {rule.conflictStrategy}</span>
                              <span>{parseConditions(rule.conditionsJson).length} conditions</span>
                              {rule.type === "SLAB" && parseSlabs(rule.slabsJson).length > 0 ? (
                                <span>{parseSlabs(rule.slabsJson).length} slabs</span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setRuleName(rule.name);
                                setRuleType(rule.type);
                                setRulePriority(String(rule.priority));
                                setRuleStatus(rule.status);
                                setConflictStrategy(rule.conflictStrategy);
                                setConditions(parseConditions(rule.conditionsJson));
                                setSlabs(parseSlabs(rule.slabsJson).length > 0 ? parseSlabs(rule.slabsJson) : [{ min: "0", max: "", percent: "1" }]);
                                setShowRuleBuilder(true);
                              }}
                              className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteRule(rule.id)}
                              className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {rules.length === 0 ? (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                        No rules found for this scheme.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {activeTab === "runs" ? (
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Calculation History</h2>
              <button
                onClick={handleRunCalculation}
                type="button"
                disabled={runningCalculation || !selectedScheme}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <FiPlay className="h-3.5 w-3.5" />
                {runningCalculation ? "Running..." : "Run New Calculation"}
              </button>
            </div>

            {loadingRuns ? (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-500 dark:text-zinc-400">
                Loading calculation history...
              </div>
            ) : null}

            {!loadingRuns ? (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-3 py-2">Scheme</th>
                      <th className="px-3 py-2">Date & Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Distributors</th>
                      <th className="px-3 py-2">Total Payout</th>
                      <th className="px-3 py-2">Duration</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationRuns.map((run) => (
                      <tr key={run.id} className="border-t border-zinc-200 dark:border-zinc-800">
                        <td className="px-3 py-2 font-medium">{selectedScheme?.name ?? "-"}</td>
                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{formatDateTime(run.runAt)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              run.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : run.status === "RUNNING"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            }`}
                          >
                            {run.status === "COMPLETED" ? <FiCheckCircle className="h-3 w-3" /> : null}
                            {run.status === "RUNNING" ? <FiClock className="h-3 w-3" /> : null}
                            {run.status === "FAILED" ? <FiXCircle className="h-3 w-3" /> : null}
                            {run.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{run.distributors}</td>
                        <td className="px-3 py-2 font-semibold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(run.totalPayout)}</td>
                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{formatDuration(run.durationMs)}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            title="View Results"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {calculationRuns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
                          No calculation runs yet for selected scheme.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
