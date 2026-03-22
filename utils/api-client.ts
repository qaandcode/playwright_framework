import { type APIRequestContext, expect } from '@playwright/test';
import { Logger } from './logger';

/**
 * ApiClient - typed wrapper around Playwright's request context.
 * Types are defined inline to avoid path resolution issues.
 */

// ── Inline types (avoids ../types import resolution issues) ───────────────────
interface ApiResponse<T = unknown> {
  body: any;
  status: number;
  data: T;
  headers: Record<string, string>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ApiClient {
  private readonly logger = new Logger('ApiClient');
  private authToken?: string;

  constructor(
    private readonly request: APIRequestContext,
    private readonly _baseUrl?: string
  ) {}

  // Resolved at call time - always reads the current process.env value
  private get baseUrl(): string {
    return this._baseUrl
      ?? process.env.API_BASE_URL
      ?? process.env.BASE_URL
      ?? '';
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...extra,
    };
  }

  // ── Core HTTP methods ────────────────────────────────────────────────────────

  async get<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseUrl);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    this.logger.debug(`GET ${url.toString()}`);
    const response = await this.request.get(url.toString(), {
      headers: this.buildHeaders(),
    });
    return this.parseResponse<T>(response);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`POST ${url}`);
    const response = await this.request.post(url, {
      headers: this.buildHeaders(),
      data: body,
    });
    return this.parseResponse<T>(response);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`PUT ${url}`);
    const response = await this.request.put(url, {
      headers: this.buildHeaders(),
      data: body,
    });
    return this.parseResponse<T>(response);
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`PATCH ${url}`);
    const response = await this.request.patch(url, {
      headers: this.buildHeaders(),
      data: body,
    });
    return this.parseResponse<T>(response);
  }

  async delete(path: string): Promise<ApiResponse<void>> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`DELETE ${url}`);
    const response = await this.request.delete(url, {
      headers: this.buildHeaders(),
    });
    return this.parseResponse<void>(response);
  }

  // ── High-level helpers ───────────────────────────────────────────────────────

  async getPaginated<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(path, params);
    return response.data;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.post<{ token: string }>('/auth/login', { email, password });
    expect(response.status).toBe(200);
    this.authToken = response.data.token;
    return response.data.token;
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  assertStatus(response: ApiResponse<unknown>, expected: number) {
    expect(
      response.status,
      `Expected HTTP ${expected}, got ${response.status}`
    ).toBe(expected);
  }

  assertOk(response: ApiResponse<unknown>) {
    expect(response.status, `Expected 2xx, got ${response.status}`)
      .toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private async parseResponse<T>(
    response: Awaited<ReturnType<APIRequestContext['get']>>
  ): Promise<ApiResponse<T>> {
    const status = response.status();
    let data: T;

    try {
      data = await response.json();
    } catch {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok()) {
      this.logger.warn(`HTTP ${status} from ${response.url()}`, data);
    }

    return {
      status,
      data,
      headers: response.headers(),
    };
  }
}