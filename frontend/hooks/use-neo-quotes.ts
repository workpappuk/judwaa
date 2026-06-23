"use client";

import { useCallback, useState } from "react";

import { getNeoQuotes } from "@/services/trading-api";
import type { NeoQuoteResponse } from "@/types/trading";

interface UseNeoQuotesResult {
  quotes: NeoQuoteResponse[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useNeoQuotes(neoSymbols: string[]): UseNeoQuotesResult {
  const [quotes, setQuotes] = useState<NeoQuoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!neoSymbols.length) {
      setQuotes([]);
      setLastUpdated(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getNeoQuotes(neoSymbols);
      setQuotes(data);
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to fetch quote data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [neoSymbols]);

  return { quotes, loading, error, lastUpdated, refresh };
}
