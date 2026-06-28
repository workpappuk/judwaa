import axios from "axios";

import type {
  IncentiveCalculationRun,
  IncentiveRule,
  IncentiveRuleRequest,
  IncentiveScheme,
  IncentiveSchemeRequest,
  IncentiveSchemeStatus,
  PaginatedResponse,
} from "@/types/incentive";
import { createApiClient } from "@/services/api-client";

const incentiveApi = createApiClient({ withAuth: true });

function ensureValidId(id: string | null | undefined, label: string): string {
  const normalized = (id ?? "").trim();
  if (!normalized || normalized === "undefined" || normalized === "null") {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }
  }

  return fallbackMessage;
}

export async function listIncentiveSchemes(
  page = 1,
  size = 20,
  status?: IncentiveSchemeStatus,
  signal?: AbortSignal,
): Promise<PaginatedResponse<IncentiveScheme>> {
  const response = await incentiveApi.get<PaginatedResponse<IncentiveScheme>>("/api/incentives/schemes", {
    params: {
      page,
      size,
      ...(status ? { status } : {}),
    },
    signal,
  });

  return response.data;
}

export async function createIncentiveScheme(payload: IncentiveSchemeRequest): Promise<IncentiveScheme> {
  try {
    const response = await incentiveApi.post<IncentiveScheme>("/api/incentives/schemes", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create scheme right now."));
  }
}

export async function updateIncentiveScheme(schemeId: string, payload: IncentiveSchemeRequest): Promise<IncentiveScheme> {
  try {
    const safeSchemeId = ensureValidId(schemeId, "Scheme ID");
    const response = await incentiveApi.put<IncentiveScheme>(`/api/incentives/schemes/${safeSchemeId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update scheme right now."));
  }
}

export async function listIncentiveRules(
  schemeId: string,
  page = 1,
  size = 20,
  signal?: AbortSignal,
): Promise<PaginatedResponse<IncentiveRule>> {
  const safeSchemeId = ensureValidId(schemeId, "Scheme ID");
  const response = await incentiveApi.get<PaginatedResponse<IncentiveRule>>(`/api/incentives/schemes/${safeSchemeId}/rules`, {
    params: { page, size },
    signal,
  });

  return response.data;
}

export async function createIncentiveRule(schemeId: string, payload: IncentiveRuleRequest): Promise<IncentiveRule> {
  try {
    const safeSchemeId = ensureValidId(schemeId, "Scheme ID");
    const response = await incentiveApi.post<IncentiveRule>(`/api/incentives/schemes/${safeSchemeId}/rules`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create rule right now."));
  }
}

export async function updateIncentiveRule(ruleId: string, payload: IncentiveRuleRequest): Promise<IncentiveRule> {
  try {
    const safeRuleId = ensureValidId(ruleId, "Rule ID");
    const response = await incentiveApi.put<IncentiveRule>(`/api/incentives/rules/${safeRuleId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to update rule right now."));
  }
}

export async function deleteIncentiveRule(ruleId: string): Promise<void> {
  try {
    const safeRuleId = ensureValidId(ruleId, "Rule ID");
    await incentiveApi.delete(`/api/incentives/rules/${safeRuleId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete rule right now."));
  }
}

export async function runIncentiveCalculation(schemeId: string): Promise<IncentiveCalculationRun> {
  try {
    const safeSchemeId = ensureValidId(schemeId, "Scheme ID");
    const response = await incentiveApi.post<IncentiveCalculationRun>(`/api/incentives/schemes/${safeSchemeId}/runs`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to run calculation right now."));
  }
}

export async function listIncentiveRuns(
  schemeId: string,
  page = 1,
  size = 20,
  signal?: AbortSignal,
): Promise<PaginatedResponse<IncentiveCalculationRun>> {
  const safeSchemeId = ensureValidId(schemeId, "Scheme ID");
  const response = await incentiveApi.get<PaginatedResponse<IncentiveCalculationRun>>(`/api/incentives/schemes/${safeSchemeId}/runs`, {
    params: { page, size },
    signal,
  });

  return response.data;
}
