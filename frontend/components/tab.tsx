"use client";

import { useId, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { Box, Tab as MuiTab, Tabs as MuiTabs } from "@mui/material";

export type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showContent?: boolean;
  ariaLabel?: string;
  className?: string;
};

export default function Tabs({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  showContent = true,
  ariaLabel = "Trading views",
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabsId = useId();

  if (!tabs.length) {
    return null;
  }

  const fallbackActiveId = defaultTab && tabs.some((tab) => tab.id === defaultTab)
    ? defaultTab
    : tabs[0].id;
  const resolvedActiveTab = activeTab ?? internalActiveTab;
  const activeId = tabs.some((tab) => tab.id === resolvedActiveTab) ? resolvedActiveTab : fallbackActiveId;
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const handleTabChange = (_event: SyntheticEvent, tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <Box className={className}>
      <MuiTabs
        value={activeId}
        onChange={handleTabChange}
        aria-label={ariaLabel}
        variant="fullWidth"
        sx={{
          minHeight: 44,
          p: 0.5,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          "& .MuiTabs-indicator": {
            height: "100%",
            borderRadius: 1.5,
            bgcolor: "action.selected",
            zIndex: 0,
          },
        }}
      >
        {tabs.map((tab) => (
          <MuiTab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            id={`${tabsId}-${tab.id}-tab`}
            aria-controls={`${tabsId}-${tab.id}-panel`}
            sx={{
              zIndex: 1,
              minHeight: 40,
              borderRadius: 1.5,
              fontWeight: 600,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "text.primary",
              },
            }}
          />
        ))}
      </MuiTabs>

      {showContent ? (
        <Box id={`${tabsId}-${active.id}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${active.id}-tab`} sx={{ pt: 2 }}>
          {active.content}
        </Box>
      ) : null}
    </Box>
  );
}
