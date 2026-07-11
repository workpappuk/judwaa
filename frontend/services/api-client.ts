import axios, { type AxiosInstance } from "axios";

type CreateApiClientOptions = {
  withAuth?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_TIMEOUT_MS = 15000;

type JudwaaEnvelope = {
  data?: unknown;
  message?: unknown;
  status?: unknown;
  timestamp?: unknown;
};

function isJudwaaEnvelope(value: unknown): value is JudwaaEnvelope {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "status" in value && "timestamp" in value && "message" in value;
}

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { withAuth = false } = options;

  const client = axios.create({
    timeout: API_TIMEOUT_MS,
  });

  if (withAuth) {
    client.interceptors.request.use((config) => {
      if (typeof window === "undefined") {
        return config;
      }

      try {
        const rawSession = window.localStorage.getItem("judwaa.auth.session");
        if (!rawSession) {
          return config;
        }

        const parsed = JSON.parse(rawSession) as { token?: string };
        if (typeof parsed.token === "string" && parsed.token.length > 0) {
          config.headers.set("Authorization", `Bearer ${parsed.token}`);
        }
      } catch {
        // Ignore malformed local storage payloads and continue request without auth header.
      }

      return config;
    });
  }

  client.interceptors.response.use((response) => {
    if (!isJudwaaEnvelope(response.data)) {
      return response;
    }

    const payload = response.data.data;
    if (payload !== undefined && payload !== null) {
      response.data = payload;
      return response;
    }

    if (typeof response.data.message === "string") {
      response.data = response.data.message;
      return response;
    }

    response.data = null;
    return response;
  });

  return client;
}
