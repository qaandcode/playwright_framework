export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

export interface ApiCredentials {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version?: string;
  timestamp?: string;
}
