import { FiCopy, FiEye, FiPlay, FiPlus, FiSearch } from "react-icons/fi";

import type { IncentiveScheme, IncentiveSchemeRequest, IncentiveSchemeStatus } from "@/types/incentive";
import { formatDate, formatDateTime, incentiveTheme } from "@/components/incentive/utils";

interface SchemesTabProps {
  schemeStatusFilter: IncentiveSchemeStatus | "ALL";
  schemeQuery: string;
  onSchemeStatusFilterChange: (value: IncentiveSchemeStatus | "ALL") => void;
  onSchemeQueryChange: (value: string) => void;
  onShowSchemeForm: () => void;
  showSchemeForm: boolean;
  schemeForm: IncentiveSchemeRequest;
  onSchemeFormChange: (changes: Partial<IncentiveSchemeRequest>) => void;
  canCreateScheme: boolean;
  onCreateScheme: () => void;
  onCancelSchemeForm: () => void;
  loadingSchemes: boolean;
  filteredSchemes: IncentiveScheme[];
  selectedSchemeId?: string;
  onSelectScheme: (scheme: IncentiveScheme) => void;
  onViewRules: (scheme: IncentiveScheme) => void;
  onRunCalculation: (scheme: IncentiveScheme) => void;
  runningCalculation: boolean;
  onDuplicateScheme: (scheme: IncentiveScheme) => void;
}

export default function SchemesTab({
  schemeStatusFilter,
  schemeQuery,
  onSchemeStatusFilterChange,
  onSchemeQueryChange,
  onShowSchemeForm,
  showSchemeForm,
  schemeForm,
  onSchemeFormChange,
  canCreateScheme,
  onCreateScheme,
  onCancelSchemeForm,
  loadingSchemes,
  filteredSchemes,
  selectedSchemeId,
  onSelectScheme,
  onViewRules,
  onRunCalculation,
  runningCalculation,
  onDuplicateScheme,
}: SchemesTabProps) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Incentive Schemes</h2>
          <p className={`text-xs ${incentiveTheme.mutedText}`}>Pick a scheme to manage rules or run payout calculations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <FiSearch className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={schemeQuery}
              onChange={(event) => onSchemeQueryChange(event.target.value)}
              placeholder="Search schemes"
              className={`${incentiveTheme.inputControlCompact} pl-8 pr-2`}
            />
          </label>
          <select
            className={`${incentiveTheme.inputControlCompact} px-2`}
            value={schemeStatusFilter}
            onChange={(event) => onSchemeStatusFilterChange(event.target.value as IncentiveSchemeStatus | "ALL")}
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="LOCKED">LOCKED</option>
          </select>
          <button
            onClick={onShowSchemeForm}
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <FiPlus className="h-3.5 w-3.5" />
            New Scheme
          </button>
        </div>
      </div>

      {showSchemeForm ? (
        <div className={`mb-5 p-4 ${incentiveTheme.panel}`}>
          <h3 className="text-base font-semibold">Create New Scheme</h3>
          <p className={`mb-3 text-xs ${incentiveTheme.mutedText}`}>Define timeline and status first. You can add rules right after creating.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Scheme Name</span>
              <input
                type="text"
                value={schemeForm.name}
                onChange={(event) => onSchemeFormChange({ name: event.target.value })}
                className={incentiveTheme.inputControl}
                placeholder="e.g. Q2 Revenue Incentive"
              />
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Status</span>
              <select
                value={schemeForm.status}
                onChange={(event) => onSchemeFormChange({ status: event.target.value as IncentiveSchemeStatus })}
                className={incentiveTheme.inputControl}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOCKED">LOCKED</option>
              </select>
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Start Date</span>
              <input
                type="date"
                value={schemeForm.startDate}
                onChange={(event) => onSchemeFormChange({ startDate: event.target.value })}
                className={incentiveTheme.inputControl}
              />
            </label>

            <label className="text-xs">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>End Date</span>
              <input
                type="date"
                value={schemeForm.endDate}
                onChange={(event) => onSchemeFormChange({ endDate: event.target.value })}
                className={incentiveTheme.inputControl}
              />
            </label>

            <label className="text-xs md:col-span-2">
              <span className={`mb-1 block ${incentiveTheme.labelText}`}>Description</span>
              <textarea
                value={schemeForm.description}
                onChange={(event) => onSchemeFormChange({ description: event.target.value })}
                rows={3}
                className={incentiveTheme.inputControl}
              />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onCreateScheme}
              type="button"
              disabled={!canCreateScheme}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Create Scheme
            </button>
            <button
              onClick={onCancelSchemeForm}
              type="button"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {loadingSchemes ? (
        <div className={`p-4 text-sm ${incentiveTheme.panel} ${incentiveTheme.mutedText}`}>
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ) : null}

      {!loadingSchemes && filteredSchemes.length === 0 ? (
        <div className={`rounded-xl border border-dashed border-zinc-300 p-5 text-sm ${incentiveTheme.mutedText} bg-white/90 dark:border-zinc-700 dark:bg-zinc-900/80`}>
          No schemes match the current search and filter.
        </div>
      ) : null}

      <div className="grid gap-3">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            onClick={() => onSelectScheme(scheme)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onSelectScheme(scheme);
              }
            }}
            className={`rounded-xl border bg-white/90 p-4 shadow-sm transition cursor-pointer dark:bg-zinc-900/85 ${
              selectedSchemeId === scheme.id
                ? "border-blue-300 ring-2 ring-blue-100 dark:border-blue-700 dark:ring-blue-900/40"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
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
                  {selectedSchemeId === scheme.id ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      Selected
                    </span>
                  ) : null}
                </div>

                <div className={`flex flex-wrap gap-4 text-[11px] ${incentiveTheme.mutedText}`}>
                  <span>
                    {formatDate(scheme.startDate)} to {formatDate(scheme.endDate)}
                  </span>
                  <span>{scheme.totalRules} rules</span>
                  {scheme.lastRunAt ? <span>Last run: {formatDateTime(scheme.lastRunAt)}</span> : null}
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => onViewRules(scheme)}
                  type="button"
                  className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  title="View Rules"
                >
                  <FiEye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRunCalculation(scheme)}
                  type="button"
                  disabled={runningCalculation}
                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50"
                  title="Run Calculation"
                >
                  <FiPlay className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDuplicateScheme(scheme)}
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
  );
}
