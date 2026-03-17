// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript interfaces & types for the test framework
// ─────────────────────────────────────────────────────────────────────────────

// ── Users ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin' | 'manager' | 'viewer';

export interface User {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface RegisteredUser extends User {
  id: string;
  createdAt: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ── Test data ─────────────────────────────────────────────────────────────────
export interface TestProduct {
  id?: string;
  name: string;
  price: number;
  category: string;
  sku?: string;
  inStock?: boolean;
}

export interface TestOrder {
  id?: string;
  userId: string;
  products: TestProduct[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// ── Environment ───────────────────────────────────────────────────────────────
export type Environment = 'dev' | 'staging' | 'prod';

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  env: Environment;
}

// ── Reporting ─────────────────────────────────────────────────────────────────
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  environment: string;
  branch?: string;
  runUrl?: string;
}

// ── Form helpers ──────────────────────────────────────────────────────────────
export type FormFields = Record<string, string | boolean | number>;

// ── Navigation ────────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
