import axios from "axios";

import type { NeoQuoteResponse, PaginatedInstrumentResponse } from "@/types/trading";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const tradingApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

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
