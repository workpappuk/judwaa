import axios from "axios";

import type { AuthCredentials, AuthResponse } from "@/types/auth";
import { createApiClient } from "@/services/api-client";

const authApi = createApiClient();

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

export async function loginUser(credentials: AuthCredentials): Promise<AuthResponse> {
  try {
    const response = await authApi.post<AuthResponse>("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to login right now."));
  }
}

export async function registerUser(credentials: AuthCredentials): Promise<string> {
  try {
    const response = await authApi.post<string>("/api/auth/register", credentials);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to register right now."));
  }
}

export async function logoutUser(token: string): Promise<string> {
  try {
    const response = await authApi.post<string>(
      "/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to logout right now."));
  }
}

export async function forceLogoutToken(adminToken: string, tokenToRevoke: string): Promise<string> {
  try {
    const response = await authApi.post<string>(
      "/api/auth/force-logout",
      { token: tokenToRevoke },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to force logout token right now."));
  }
}