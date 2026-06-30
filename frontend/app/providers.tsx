"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

import { store } from "@/store";
import type { RootState } from "@/store";
import { setSession } from "@/store/slices/authSlice";
import { markDraftPositionsHydrated, setDraftPositions } from "@/store/slices/tradingSlice";
import type { AuthSession } from "@/types/auth";
import type { FnOPositionDraft } from "@/types/trading";

const DRAFTS_STORAGE_KEY = "judwaa.trading.draftPositions";
const AUTH_STORAGE_KEY = "judwaa.auth.session";

interface ProvidersProps {
  children: React.ReactNode;
}

function DraftPositionsPersistence() {
  const dispatch = useDispatch();
  const draftPositions = useSelector((state: RootState) => state.trading.draftPositions);
  const hydrated = useSelector((state: RootState) => state.trading.hydrated);

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
    } finally {
      dispatch(markDraftPositionsHydrated());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftPositions));
  }, [draftPositions, hydrated]);

  return null;
}

function AuthSessionPersistence() {
  const dispatch = useDispatch();
  const authSession = useSelector((state: RootState) => state.auth.session);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (typeof parsed.username === "string" && typeof parsed.token === "string") {
        dispatch(setSession({ username: parsed.username, token: parsed.token }));
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!authSession) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
  }, [authSession]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <DraftPositionsPersistence />
      <AuthSessionPersistence />
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
