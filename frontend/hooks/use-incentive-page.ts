"use client";

import { useEffect, useMemo, useState } from "react";

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
import { parseConditions, parseSlabs, type ConditionRow, type SlabRow } from "@/components/incentive/utils";
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

export type ActiveTab = "schemes" | "rules" | "runs";

const PAGE_SIZE = 20;

export function useIncentivePageState() {
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
  const [schemeQuery, setSchemeQuery] = useState("");

  const filteredSchemes = useMemo(() => {
    const query = schemeQuery.trim().toLowerCase();
    if (!query) {
      return schemes;
    }

    return schemes.filter((scheme) => {
      return (
        scheme.name.toLowerCase().includes(query) ||
        scheme.status.toLowerCase().includes(query) ||
        (scheme.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [schemeQuery, schemes]);

  const totalRulesAcrossSchemes = useMemo(
    () => schemes.reduce((sum, scheme) => sum + scheme.totalRules, 0),
    [schemes],
  );

  const activeSchemeCount = useMemo(
    () => schemes.filter((scheme) => scheme.status === "ACTIVE").length,
    [schemes],
  );

  const draftSchemeCount = useMemo(
    () => schemes.filter((scheme) => scheme.status === "DRAFT").length,
    [schemes],
  );

  const activeRulesCount = useMemo(
    () => rules.filter((rule) => rule.status === "ACTIVE").length,
    [rules],
  );

  const completedRunsCount = useMemo(
    () => calculationRuns.filter((run) => run.status === "COMPLETED").length,
    [calculationRuns],
  );

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

  useEffect(() => {
    if (!error && !message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setError(null);
      setMessage(null);
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [error, message]);

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
    const targetRule = rules.find((rule) => rule.id === ruleId);
    const shouldDelete = window.confirm(
      `Delete rule${targetRule?.name ? ` \"${targetRule.name}\"` : ""}? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

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

  const handleConditionFieldChange = (index: number, value: string) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index].field = value;
      return next;
    });
  };

  const handleConditionOperatorChange = (index: number, value: string) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index].operator = value;
      return next;
    });
  };

  const handleConditionValue1Change = (index: number, value: string) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index].value1 = value;
      return next;
    });
  };

  const handleConditionValue2Change = (index: number, value: string) => {
    setConditions((prev) => {
      const next = [...prev];
      next[index].value2 = value;
      return next;
    });
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const addSlab = () => {
    setSlabs((prev) => [...prev, { min: "", max: "", percent: "" }]);
  };

  const handleSlabMinChange = (index: number, value: string) => {
    setSlabs((prev) => {
      const next = [...prev];
      next[index].min = value;
      return next;
    });
  };

  const handleSlabMaxChange = (index: number, value: string) => {
    setSlabs((prev) => {
      const next = [...prev];
      next[index].max = value;
      return next;
    });
  };

  const handleSlabPercentChange = (index: number, value: string) => {
    setSlabs((prev) => {
      const next = [...prev];
      next[index].percent = value;
      return next;
    });
  };

  const removeSlab = (index: number) => {
    setSlabs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditRule = (rule: IncentiveRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setRuleType(rule.type);
    setRulePriority(String(rule.priority));
    setRuleStatus(rule.status);
    setConflictStrategy(rule.conflictStrategy);
    setConditions(parseConditions(rule.conditionsJson));
    setSlabs(parseSlabs(rule.slabsJson).length > 0 ? parseSlabs(rule.slabsJson) : [{ min: "0", max: "", percent: "1" }]);
    setShowRuleBuilder(true);
  };

  return {
    activeTab,
    setActiveTab,
    selectedScheme,
    setSelectedScheme,
    showRuleBuilder,
    setShowRuleBuilder,
    showSchemeForm,
    setShowSchemeForm,
    loadingSchemes,
    loadingRules,
    loadingRuns,
    runningCalculation,
    error,
    message,
    schemes,
    rules,
    calculationRuns,
    schemeForm,
    setSchemeForm,
    ruleType,
    setRuleType,
    ruleName,
    setRuleName,
    editingRuleId,
    rulePriority,
    setRulePriority,
    ruleStatus,
    setRuleStatus,
    conflictStrategy,
    setConflictStrategy,
    conditions,
    slabs,
    schemeStatusFilter,
    setSchemeStatusFilter,
    schemeQuery,
    setSchemeQuery,
    filteredSchemes,
    totalRulesAcrossSchemes,
    activeSchemeCount,
    draftSchemeCount,
    activeRulesCount,
    completedRunsCount,
    canCreateScheme,
    canCreateRule,
    handleCreateScheme,
    handleCreateOrUpdateRule,
    handleDeleteRule,
    handleRunCalculation,
    addCondition,
    handleConditionFieldChange,
    handleConditionOperatorChange,
    handleConditionValue1Change,
    handleConditionValue2Change,
    removeCondition,
    addSlab,
    handleSlabMinChange,
    handleSlabMaxChange,
    handleSlabPercentChange,
    removeSlab,
    handleEditRule,
    resetRuleBuilder,
  };
}
