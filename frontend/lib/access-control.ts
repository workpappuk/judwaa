import type { UserRole } from "@/types/auth";

type RouteAccessInput = {
  requiresAuth?: boolean;
  requiresRole?: UserRole | UserRole[];
};

export const normalizeRole = (role?: string | null): UserRole => {
  if (role === "admin") {
    return "admin";
  }

  return "user";
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const readClaimRole = (payload: Record<string, unknown>): UserRole | null => {
  const roleCandidate = payload.role;
  if (typeof roleCandidate === "string") {
    return normalizeRole(roleCandidate.toLowerCase());
  }

  const rolesCandidate = payload.roles;
  if (Array.isArray(rolesCandidate)) {
    const hasAdmin = rolesCandidate.some((role) => typeof role === "string" && role.toLowerCase().includes("admin"));
    return hasAdmin ? "admin" : "user";
  }

  const authoritiesCandidate = payload.authorities;
  if (Array.isArray(authoritiesCandidate)) {
    const hasAdmin = authoritiesCandidate.some(
      (authority) => typeof authority === "string" && authority.toLowerCase().includes("admin"),
    );
    return hasAdmin ? "admin" : "user";
  }

  return null;
};

export const inferUserRole = (input: { username?: string; token?: string; role?: string | null }): UserRole => {
  const explicitRole = normalizeRole(input.role ?? undefined);
  if (input.role) {
    return explicitRole;
  }

  if (typeof input.token === "string" && input.token.trim().length > 0) {
    const payload = decodeJwtPayload(input.token);
    if (payload) {
      const claimRole = readClaimRole(payload);
      if (claimRole) {
        return claimRole;
      }
    }
  }

  if (typeof input.username === "string" && input.username.trim().toLowerCase() === "admin") {
    return "admin";
  }

  return "user";
};

export const hasRequiredRole = (currentRole: UserRole, requiresRole?: UserRole | UserRole[]): boolean => {
  if (!requiresRole) {
    return true;
  }

  if (Array.isArray(requiresRole)) {
    return requiresRole.includes(currentRole);
  }

  return currentRole === requiresRole;
};

export const canAccessRoute = (
  current: { isAuthenticated: boolean; role: UserRole },
  route: RouteAccessInput,
): boolean => {
  if (route.requiresAuth && !current.isAuthenticated) {
    return false;
  }

  if (!current.isAuthenticated) {
    return true;
  }

  return hasRequiredRole(current.role, route.requiresRole);
};
