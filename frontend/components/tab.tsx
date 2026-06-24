"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

export type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

export default function Tabs({
  tabs,
  defaultTab,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabsId = useId();

  if (!tabs.length) {
    return null;
  }

  const fallbackActiveId = defaultTab && tabs.some((tab) => tab.id === defaultTab)
    ? defaultTab
    : tabs[0].id;
  const activeId = tabs.some((tab) => tab.id === activeTab) ? activeTab : fallbackActiveId;
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className={className}>
      <div
        className="inline-flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-1"
        role="tablist"
        aria-label="Trading views"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            role="tab"
            aria-selected={active.id === tab.id}
            aria-controls={`${tabsId}-${tab.id}-panel`}
            id={`${tabsId}-${tab.id}-tab`}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeId === tab.id
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`${tabsId}-${active.id}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-${active.id}-tab`}
        className="pt-3"
      >
        {active.content}
      </div>
    </div>
  );
}