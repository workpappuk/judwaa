import type { CollectorFormValues } from "@/app/data-collector/config";
import { createApiClient } from "@/services/api-client";

export type CollectorRelatedStats = {
  steps: number;
  sections: number;
  fields: number;
  links: number;
};

export type CollectorSummary = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  importButtonLabel: string;
  related: CollectorRelatedStats;
  updatedAt: string | null;
};

export type CollectorDetail = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  importButtonLabel: string;
  related: CollectorRelatedStats;
  steps: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  links: Array<{
    label: string;
    href: string;
    external: boolean;
  }>;
  persistedValues: Record<string, string | number | boolean>;
  updatedAt: string | null;
};

export type PersistCollectorResponse = {
  message: string;
  updatedAt: string;
};

export type PersistedCollectorData = {
  collectorId: string;
  values: Record<string, string | number | boolean>;
  updatedAt: string | null;
};

const dataCollectorApi = createApiClient({ withAuth: true });

export async function fetchCollectorSummaries(): Promise<CollectorSummary[]> {
  const response = await dataCollectorApi.get<CollectorSummary[]>("/api/data-collector");
  return response.data;
}

export async function fetchCollectorDetail(collectorId: string): Promise<CollectorDetail> {
  const response = await dataCollectorApi.get<CollectorDetail>(`/api/data-collector/${collectorId}`);
  return response.data;
}

export async function persistCollectorValues(
  collectorId: string,
  values: CollectorFormValues,
): Promise<PersistCollectorResponse> {
  const response = await dataCollectorApi.put<PersistCollectorResponse>(`/api/data-collector/${collectorId}`, {
    values,
  });
  return response.data;
}

export async function fetchPersistedCollectorData(collectorId: string): Promise<PersistedCollectorData> {
  const response = await dataCollectorApi.get<PersistedCollectorData>(`/api/data-collector/${collectorId}/persisted`);
  return response.data;
}

export async function updatePersistedCollectorData(
  collectorId: string,
  values: CollectorFormValues,
): Promise<PersistedCollectorData> {
  const response = await dataCollectorApi.put<PersistedCollectorData>(
    `/api/data-collector/${collectorId}/persisted`,
    { values },
  );
  return response.data;
}
