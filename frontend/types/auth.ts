export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface AuthSession {
  username: string;
  token: string;
}