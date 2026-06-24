"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import { store } from "@/store";
import type { RootState } from "@/store";
import { setDraftPositions } from "@/store/slices/tradingSlice";
import type { FnOPositionDraft } from "@/types/trading";

const DRAFTS_STORAGE_KEY = "judwaa.trading.draftPositions";

interface ProvidersProps {
  children: React.ReactNode;
}

function DraftPositionsPersistence() {
  const dispatch = useDispatch();
  const draftPositions = useSelector((state: RootState) => state.trading.draftPositions);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as FnOPositionDraft[];
      if (Array.isArray(parsed)) {
        dispatch(setDraftPositions(parsed));
      }
    } catch {
      window.localStorage.removeItem(DRAFTS_STORAGE_KEY);
    }
  }, [dispatch]);

  useEffect(() => {
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftPositions));
  }, [draftPositions]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <DraftPositionsPersistence />
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
