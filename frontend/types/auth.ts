export interface AuthCredentials {
  username: string;
  password: string;
}

export type UserRole = "admin" | "user";

export interface AuthResponse {
  token: string;
  role?: UserRole;
}

export interface AuthSession {
  username: string;
  token: string;
  role: UserRole;
}