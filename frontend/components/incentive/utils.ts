export type ConditionRow = {
  field: string;
  operator: string;
  value1: string;
  value2: string;
};

export type SlabRow = {
  min: string;
  max: string;
  percent: string;
};

export const incentiveTheme = {
  panel:
    "rounded-xl border border-zinc-200/80 bg-white/90 text-zinc-900 shadow-sm transition-colors dark:border-zinc-700/70 dark:bg-zinc-900/95 dark:text-zinc-100 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
  panelSubtle:
    "rounded-lg border border-zinc-200/80 bg-white/85 text-zinc-900 transition-colors dark:border-zinc-700/60 dark:bg-zinc-900/85 dark:text-zinc-100",
  metricCard:
    "rounded-xl border border-zinc-200/80 bg-white/85 px-3 py-2 text-zinc-900 transition-colors dark:border-zinc-700/60 dark:bg-zinc-900/90 dark:text-zinc-100",
  mutedText: "text-zinc-500 dark:text-zinc-300",
  labelText: "text-zinc-600 dark:text-zinc-200",
  inputControl:
    "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-zinc-700/80 dark:bg-zinc-950/70 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:ring-blue-400/30",
  inputControlCompact:
    "rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-zinc-700/80 dark:bg-zinc-950/70 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:ring-blue-400/30",
  tableShell:
    "overflow-x-auto rounded-lg border border-zinc-200/80 bg-white/95 transition-colors dark:border-zinc-700/70 dark:bg-zinc-900/95",
  tableHead: "bg-zinc-100/80 text-zinc-700 dark:bg-zinc-800/85 dark:text-zinc-100",
  rowBorder: "border-t border-zinc-200/80 dark:border-zinc-700/60",
};

export const formatDate = (isoDate: string): string => {
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

export const formatDateTime = (isoDate: string): string => {
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

export const formatDuration = (durationMs: number): string => `${(durationMs / 1000).toFixed(1)}s`;

export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const parseConditions = (conditionsJson: string): ConditionRow[] => {
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

export const parseSlabs = (slabsJson: string | null): SlabRow[] => {
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
