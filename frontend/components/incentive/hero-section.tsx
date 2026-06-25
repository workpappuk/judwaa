import { FiLayers, FiPlus } from "react-icons/fi";

import { formatCompactNumber, incentiveTheme } from "@/components/incentive/utils";

interface HeroSectionProps {
  schemesCount: number;
  activeSchemeCount: number;
  draftSchemeCount: number;
  totalRulesAcrossSchemes: number;
  onCreateScheme: () => void;
}

export default function HeroSection({
  schemesCount,
  activeSchemeCount,
  draftSchemeCount,
  totalRulesAcrossSchemes,
  onCreateScheme,
}: HeroSectionProps) {
  return (
    <div className={`mb-6 overflow-hidden rounded-2xl p-5 backdrop-blur-sm ${incentiveTheme.panel}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <FiLayers className="h-3 w-3" />
            Incentive Engine
          </p>
          <h1 className="display-face text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Distributor Incentive Manager</h1>
          <p className={`mt-1 text-sm ${incentiveTheme.mutedText}`}>Build schemes, author rules, and run payout calculations from one place.</p>
        </div>
        <button
          onClick={onCreateScheme}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FiPlus className="h-3.5 w-3.5" />
          Create Scheme
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Schemes</p>
          <p className="mt-0.5 text-base font-semibold">{formatCompactNumber(schemesCount)}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Active</p>
          <p className="mt-0.5 text-base font-semibold text-emerald-600 dark:text-emerald-300">{formatCompactNumber(activeSchemeCount)}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Drafts</p>
          <p className="mt-0.5 text-base font-semibold text-amber-600 dark:text-amber-300">{formatCompactNumber(draftSchemeCount)}</p>
        </article>
        <article className={incentiveTheme.metricCard}>
          <p className={`text-[10px] uppercase tracking-wide ${incentiveTheme.mutedText}`}>Total Rules</p>
          <p className="mt-0.5 text-base font-semibold">{formatCompactNumber(totalRulesAcrossSchemes)}</p>
        </article>
      </div>
    </div>
  );
}
