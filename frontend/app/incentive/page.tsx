"use client";

import { Alert, Box, Container } from "@mui/material";

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
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 1.5, md: 2.5 },
        background:
          "radial-gradient(circle at 0% 0%, rgba(13,110,253,0.12), rgba(255,255,255,0.96) 45%, rgba(236,242,255,0.92) 100%)",
      }}
    >
      <Container maxWidth="xl">
        <HeroSection
          schemesCount={schemes.length}
          activeSchemeCount={activeSchemeCount}
          draftSchemeCount={draftSchemeCount}
          totalRulesAcrossSchemes={totalRulesAcrossSchemes}
          onCreateScheme={() => setShowSchemeForm(true)}
        />

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}

        <Tabs
          className="incentive-tabs"
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
      </Container>
    </Box>
  );
}
