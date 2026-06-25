import { FiBarChart2, FiEdit2, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";

import type {
  IncentiveConflictStrategy,
  IncentiveRule,
  IncentiveRuleStatus,
  IncentiveRuleType,
  IncentiveScheme,
} from "@/types/incentive";
import { incentiveTheme, parseConditions, parseSlabs, type ConditionRow, type SlabRow } from "@/components/incentive/utils";

interface RulesTabProps {
  selectedScheme: IncentiveScheme | null;
  showRuleBuilder: boolean;
  editingRuleId: string | null;
  ruleName: string;
  ruleType: IncentiveRuleType;
  rulePriority: string;
  ruleStatus: IncentiveRuleStatus;
  conflictStrategy: IncentiveConflictStrategy;
  conditions: ConditionRow[];
  slabs: SlabRow[];
  canCreateRule: boolean;
  loadingRules: boolean;
  rules: IncentiveRule[];
  activeRulesCount: number;
  onBackToSchemes: () => void;
  onShowRuleBuilder: () => void;
  onRuleNameChange: (value: string) => void;
  onRuleTypeChange: (value: IncentiveRuleType) => void;
  onRulePriorityChange: (value: string) => void;
  onRuleStatusChange: (value: IncentiveRuleStatus) => void;
  onConflictStrategyChange: (value: IncentiveConflictStrategy) => void;
  onConditionFieldChange: (index: number, value: string) => void;
  onConditionOperatorChange: (index: number, value: string) => void;
  onConditionValue1Change: (index: number, value: string) => void;
  onConditionValue2Change: (index: number, value: string) => void;
  onAddCondition: () => void;
  onRemoveCondition: (index: number) => void;
  onSlabMinChange: (index: number, value: string) => void;
  onSlabMaxChange: (index: number, value: string) => void;
  onSlabPercentChange: (index: number, value: string) => void;
  onAddSlab: () => void;
  onRemoveSlab: (index: number) => void;
  onSaveRule: () => void;
  onCancelRuleBuilder: () => void;
  onEditRule: (rule: IncentiveRule) => void;
  onDeleteRule: (ruleId: string) => void;
}

export default function RulesTab({
  selectedScheme,
  showRuleBuilder,
  editingRuleId,
  ruleName,
  ruleType,
  rulePriority,
  ruleStatus,
  conflictStrategy,
  conditions,
  slabs,
  canCreateRule,
  loadingRules,
  rules,
  activeRulesCount,
  onBackToSchemes,
  onShowRuleBuilder,
  onRuleNameChange,
  onRuleTypeChange,
  onRulePriorityChange,
  onRuleStatusChange,
  onConflictStrategyChange,
  onConditionFieldChange,
  onConditionOperatorChange,
  onConditionValue1Change,
  onConditionValue2Change,
  onAddCondition,
  onRemoveCondition,
  onSlabMinChange,
  onSlabMaxChange,
  onSlabPercentChange,
  onAddSlab,
  onRemoveSlab,
  onSaveRule,
  onCancelRuleBuilder,
  onEditRule,
  onDeleteRule,
}: RulesTabProps) {
  if (!selectedScheme) {
    return (
      <div className={`rounded-lg p-6 text-center text-sm ${incentiveTheme.panelSubtle} ${incentiveTheme.mutedText}`}>
        Select a scheme from Schemes tab to manage rules.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <button
            onClick={onBackToSchemes}
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Back to Schemes
          </button>
          <h2 className="mt-1 text-xl font-semibold">{selectedScheme.name}</h2>
          <p className={`text-sm ${incentiveTheme.mutedText}`}>Manage rules for this scheme</p>
        </div>
        <button
          onClick={onShowRuleBuilder}
          type="button"
          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Add Rule
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <article className={incentiveTheme.metricCard}>
          <p className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>
            <FiBarChart2 className="h-3 w-3" />
            Total Rules
          </p>
          <p className="mt-0.5 text-sm font-semibold">{rules.length}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>
            <FiTarget className="h-3 w-3" />
            Active
          </p>
          <p className="mt-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{activeRulesCount}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Scheme</p>
          <p className="mt-0.5 truncate text-sm font-semibold">{selectedScheme.name}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Version</p>
          <p className="mt-0.5 text-sm font-semibold">v{selectedScheme.version}</p>
        </article>
      </div>

      {showRuleBuilder ? (
        <div className={`mb-5 rounded-lg p-4 ${incentiveTheme.panelSubtle}`}>
          <h3 className="mb-3 text-base font-semibold">{editingRuleId ? "Edit Incentive Rule" : "Build Incentive Rule"}</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Rule Name</span>
              <input
                type="text"
                value={ruleName}
                onChange={(event) => onRuleNameChange(event.target.value)}
                className={incentiveTheme.inputControl}
                placeholder="e.g. High Volume Slab"
              />
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Rule Type</span>
              <select
                value={ruleType}
                onChange={(event) => onRuleTypeChange(event.target.value as IncentiveRuleType)}
                className={incentiveTheme.inputControl}
              >
                <option value="SLAB">Slab-based Incentive</option>
                <option value="GROWTH">Growth-based Bonus</option>
                <option value="TARGET">Target Achievement</option>
                <option value="FLAT">Flat Percentage</option>
                <option value="MIX">Product Mix Incentive</option>
              </select>
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Priority</span>
              <input
                type="number"
                min={1}
                value={rulePriority}
                onChange={(event) => onRulePriorityChange(event.target.value)}
                className={incentiveTheme.inputControl}
              />
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Status</span>
              <select
                value={ruleStatus}
                onChange={(event) => onRuleStatusChange(event.target.value as IncentiveRuleStatus)}
                className={incentiveTheme.inputControl}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>

            <label className="text-xs md:col-span-2">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Conflict Strategy</span>
              <select
                value={conflictStrategy}
                onChange={(event) => onConflictStrategyChange(event.target.value as IncentiveConflictStrategy)}
                className={incentiveTheme.inputControl}
              >
                <option value="ADDITIVE">ADDITIVE</option>
                <option value="MAX">MAX</option>
                <option value="PRIORITY">PRIORITY</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className={`text-xs font-semibold ${incentiveTheme.labelText}`}>Conditions (IF)</h4>
              <button
                onClick={onAddCondition}
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
                    className={`${incentiveTheme.inputControlCompact} md:col-span-3`}
                    value={condition.field}
                    onChange={(event) => onConditionFieldChange(idx, event.target.value)}
                  >
                    <option value="net_sales">Net Sales</option>
                    <option value="quantity">Quantity</option>
                    <option value="category">Product Category</option>
                    <option value="region">Region</option>
                    <option value="growth">Growth %</option>
                  </select>
                  <select
                    className={`${incentiveTheme.inputControlCompact} md:col-span-2`}
                    value={condition.operator}
                    onChange={(event) => onConditionOperatorChange(idx, event.target.value)}
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
                    className={`${incentiveTheme.inputControlCompact} md:col-span-3`}
                    value={condition.value1}
                    onChange={(event) => onConditionValue1Change(idx, event.target.value)}
                    placeholder="Value"
                  />
                  {condition.operator === "BETWEEN" ? (
                    <input
                      type="text"
                      className={`${incentiveTheme.inputControlCompact} md:col-span-3`}
                      value={condition.value2}
                      onChange={(event) => onConditionValue2Change(idx, event.target.value)}
                      placeholder="To"
                    />
                  ) : (
                    <div className="md:col-span-3" />
                  )}
                  <button
                    onClick={() => onRemoveCondition(idx)}
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
                <h4 className={`text-xs font-semibold ${incentiveTheme.labelText}`}>Slab Configuration (THEN)</h4>
                <button
                  onClick={onAddSlab}
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                  Add Slab
                </button>
              </div>

              <div className={incentiveTheme.tableShell}>
                <table className="w-full text-left text-xs">
                  <thead className={incentiveTheme.tableHead}>
                    <tr>
                      <th className="px-3 py-2">Min Sales</th>
                      <th className="px-3 py-2">Max Sales</th>
                      <th className="px-3 py-2">Incentive %</th>
                      <th className="w-10 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {slabs.map((slab, idx) => (
                      <tr key={`slab-${idx}`} className={incentiveTheme.rowBorder}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={slab.min}
                            onChange={(event) => onSlabMinChange(idx, event.target.value)}
                            className={incentiveTheme.inputControlCompact}
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={slab.max}
                            onChange={(event) => onSlabMaxChange(idx, event.target.value)}
                            className={incentiveTheme.inputControlCompact}
                            placeholder="Unlimited"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={slab.percent}
                            onChange={(event) => onSlabPercentChange(idx, event.target.value)}
                            className={incentiveTheme.inputControlCompact}
                            placeholder="2.5"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => onRemoveSlab(idx)}
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
              onClick={onSaveRule}
              type="button"
              disabled={!canCreateRule}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingRuleId ? "Update Rule" : "Save Rule"}
            </button>
            <button
              onClick={onCancelRuleBuilder}
              type="button"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loadingRules ? (
        <div className={`rounded-lg p-3 text-sm ${incentiveTheme.panelSubtle} ${incentiveTheme.mutedText}`}>
          Loading rules...
        </div>
      ) : null}

      {!loadingRules && !showRuleBuilder ? (
        <div className="grid gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg p-4 ${incentiveTheme.panelSubtle}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold">{rule.name}</h3>
                    <span className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {rule.type}
                    </span>
                    <span className={`text-[11px] ${incentiveTheme.mutedText}`}>Priority {rule.priority}</span>
                  </div>

                  <div className={`flex flex-wrap gap-3 text-[11px] ${incentiveTheme.mutedText}`}>
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
                    onClick={() => onEditRule(rule)}
                    className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Edit"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
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
            <div className={`rounded-lg p-3 text-sm ${incentiveTheme.panelSubtle} ${incentiveTheme.mutedText}`}>
              No rules found for this scheme.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
