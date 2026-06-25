import { FiCheckCircle, FiClock, FiEye, FiPlay, FiXCircle } from "react-icons/fi";

import type { IncentiveCalculationRun, IncentiveScheme } from "@/types/incentive";
import { formatDateTime, formatDuration, incentiveTheme } from "@/components/incentive/utils";

interface RunsTabProps {
  selectedScheme: IncentiveScheme | null;
  calculationRuns: IncentiveCalculationRun[];
  completedRunsCount: number;
  loadingRuns: boolean;
  runningCalculation: boolean;
  onRunNewCalculation: () => void;
}

export default function RunsTab({
  selectedScheme,
  calculationRuns,
  completedRunsCount,
  loadingRuns,
  runningCalculation,
  onRunNewCalculation,
}: RunsTabProps) {
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Runs</p>
          <p className="mt-0.5 text-sm font-semibold">{calculationRuns.length}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Completed</p>
          <p className="mt-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-300">{completedRunsCount}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Selected Scheme</p>
          <p className="mt-0.5 truncate text-sm font-semibold">{selectedScheme?.name ?? "None"}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Total Payout</p>
          <p className="mt-0.5 text-sm font-semibold">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
              calculationRuns.reduce((sum, run) => sum + run.totalPayout, 0),
            )}
          </p>
        </article>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Calculation History</h2>
        <button
          onClick={onRunNewCalculation}
          type="button"
          disabled={runningCalculation || !selectedScheme}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <FiPlay className="h-3.5 w-3.5" />
          {runningCalculation ? "Running..." : "Run New Calculation"}
        </button>
      </div>

      {loadingRuns ? (
        <div className={`p-3 text-sm ${incentiveTheme.panelSubtle} ${incentiveTheme.mutedText}`}>
          Loading calculation history...
        </div>
      ) : null}

      {!loadingRuns ? (
        <div className={incentiveTheme.tableShell}>
          <table className="w-full text-left text-xs">
            <thead className={incentiveTheme.tableHead}>
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
                <tr key={run.id} className={incentiveTheme.rowBorder}>
                  <td className="px-3 py-2 font-medium">{selectedScheme?.name ?? "-"}</td>
                  <td className={`px-3 py-2 ${incentiveTheme.mutedText}`}>{formatDateTime(run.runAt)}</td>
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
                  <td className={`px-3 py-2 ${incentiveTheme.mutedText}`}>{formatDuration(run.durationMs)}</td>
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
                  <td colSpan={7} className={`px-3 py-5 text-center text-sm ${incentiveTheme.mutedText}`}>
                    No calculation runs yet for selected scheme.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
