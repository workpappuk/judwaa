"use client";

import Tabs from "@/components/tab";
import HeroSection from "@/components/incentive/hero-section";
import SchemesTab from "@/components/incentive/schemes-tab";
import RulesTab from "@/components/incentive/rules-tab";
import RunsTab from "@/components/incentive/runs-tab";
import { type ActiveTab, useIncentivePageState } from "@/hooks/use-incentive-page";

export default function IncentivePage() {
  const {
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
  } = useIncentivePageState();

  return (
    <div className="min-h-screen rounded-xl bg-[radial-gradient(circle_at_top_left,#dbeafe,#f4f7ff_45%,#eef2ff_75%)] pb-8 p-3 text-zinc-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,#1e293b_0%,#111827_42%,#090d16_100%)] dark:text-zinc-100">
      <div className="mx-auto max-w-7xl">
        <HeroSection
          schemesCount={schemes.length}
          activeSchemeCount={activeSchemeCount}
          draftSchemeCount={draftSchemeCount}
          totalRulesAcrossSchemes={totalRulesAcrossSchemes}
          onCreateScheme={() => setShowSchemeForm(true)}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
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
          <SchemesTab
            schemeStatusFilter={schemeStatusFilter}
            schemeQuery={schemeQuery}
            onSchemeStatusFilterChange={setSchemeStatusFilter}
            onSchemeQueryChange={setSchemeQuery}
            onShowSchemeForm={() => setShowSchemeForm(true)}
            showSchemeForm={showSchemeForm}
            schemeForm={schemeForm}
            onSchemeFormChange={(changes) => setSchemeForm((prev) => ({ ...prev, ...changes }))}
            canCreateScheme={canCreateScheme}
            onCreateScheme={() => void handleCreateScheme()}
            onCancelSchemeForm={() => setShowSchemeForm(false)}
            loadingSchemes={loadingSchemes}
            filteredSchemes={filteredSchemes}
            selectedSchemeId={selectedScheme?.id}
            onSelectScheme={setSelectedScheme}
            onViewRules={(scheme) => {
              setSelectedScheme(scheme);
              setActiveTab("rules");
            }}
            onRunCalculation={(scheme) => void handleRunCalculation(scheme)}
            runningCalculation={runningCalculation}
            onDuplicateScheme={(scheme) => {
              setShowSchemeForm(true);
              setSchemeForm({
                name: `${scheme.name} Copy`,
                description: scheme.description,
                status: "DRAFT",
                startDate: scheme.startDate,
                endDate: scheme.endDate,
              });
            }}
          />
        ) : null}

        {activeTab === "rules" ? (
          <RulesTab
            selectedScheme={selectedScheme}
            showRuleBuilder={showRuleBuilder}
            editingRuleId={editingRuleId}
            ruleName={ruleName}
            ruleType={ruleType}
            rulePriority={rulePriority}
            ruleStatus={ruleStatus}
            conflictStrategy={conflictStrategy}
            conditions={conditions}
            slabs={slabs}
            canCreateRule={canCreateRule}
            loadingRules={loadingRules}
            rules={rules}
            activeRulesCount={activeRulesCount}
            onBackToSchemes={() => {
              setActiveTab("schemes");
              setShowRuleBuilder(false);
            }}
            onShowRuleBuilder={() => setShowRuleBuilder(true)}
            onRuleNameChange={setRuleName}
            onRuleTypeChange={setRuleType}
            onRulePriorityChange={setRulePriority}
            onRuleStatusChange={setRuleStatus}
            onConflictStrategyChange={setConflictStrategy}
            onConditionFieldChange={handleConditionFieldChange}
            onConditionOperatorChange={handleConditionOperatorChange}
            onConditionValue1Change={handleConditionValue1Change}
            onConditionValue2Change={handleConditionValue2Change}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            onSlabMinChange={handleSlabMinChange}
            onSlabMaxChange={handleSlabMaxChange}
            onSlabPercentChange={handleSlabPercentChange}
            onAddSlab={addSlab}
            onRemoveSlab={removeSlab}
            onSaveRule={() => void handleCreateOrUpdateRule()}
            onCancelRuleBuilder={() => {
              setShowRuleBuilder(false);
              resetRuleBuilder();
            }}
            onEditRule={handleEditRule}
            onDeleteRule={(ruleId) => void handleDeleteRule(ruleId)}
          />
        ) : null}

        {activeTab === "runs" ? (
          <RunsTab
            selectedScheme={selectedScheme}
            calculationRuns={calculationRuns}
            completedRunsCount={completedRunsCount}
            loadingRuns={loadingRuns}
            runningCalculation={runningCalculation}
            onRunNewCalculation={() => void handleRunCalculation()}
          />
        ) : null}
      </div>
    </div>
  );
}
