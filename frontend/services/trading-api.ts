import type { NeoQuoteResponse, PaginatedInstrumentResponse } from "@/types/trading";
import { createApiClient } from "@/services/api-client";

const tradingApi = createApiClient({ withAuth: true });

export async function loginNeoSession(totp: string): Promise<string> {
  const response = await tradingApi.post<string>("/api/neo/login", undefined, {
    params: { totp },
  });

  return response.data;
}

export async function downloadNeoScriptMaster(): Promise<string> {
  const response = await tradingApi.get<string>("/api/neo/script-download");

  return response.data;
}

export async function getNeoQuotes(
  neoSymbols: string[],
  signal?: AbortSignal,
): Promise<NeoQuoteResponse[]> {
  const params = new URLSearchParams();
  neoSymbols.forEach((symbol) => params.append("neoSymbols", symbol));

  const response = await tradingApi.get<NeoQuoteResponse[]>("/api/neo/quotes", {
    params,
    signal,
  });

  return response.data;
}

export async function getInstruments(
  page: number,
  size: number,
  signal?: AbortSignal,
): Promise<PaginatedInstrumentResponse> {
  const response = await tradingApi.get<PaginatedInstrumentResponse>("/api/neo/instruments", {
    params: { page, size },
    signal,
  });

  return response.data;
}
