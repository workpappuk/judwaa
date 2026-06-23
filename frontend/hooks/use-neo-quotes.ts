"use client";

import { useCallback, useRef, useState } from "react";

import { getNeoQuotes } from "@/services/trading-api";
import type { NeoQuoteResponse } from "@/types/trading";

interface UseNeoQuotesResult {
  quotes: NeoQuoteResponse[];
  loading: boolean;
  error: string | null;
  isStale: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useNeoQuotes(neoSymbols: string[]): UseNeoQuotesResult {
  const [quotes, setQuotes] = useState<NeoQuoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasSuccessfulDataRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!neoSymbols.length) {
      setQuotes([]);
      setIsStale(false);
      setLastUpdated(null);
      hasSuccessfulDataRef.current = false;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getNeoQuotes(neoSymbols);
      setQuotes(data);
      setLastUpdated(new Date());
      setIsStale(false);
      hasSuccessfulDataRef.current = true;
    } catch {
      const message = hasSuccessfulDataRef.current
        ? "Live update failed. Showing last synced data."
        : "Unable to fetch live quotes right now. Please try again.";
      setIsStale(hasSuccessfulDataRef.current);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [neoSymbols]);

  return { quotes, loading, error, isStale, lastUpdated, refresh };
}
