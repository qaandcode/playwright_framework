import { type APIRequestContext, expect } from '@playwright/test';
import { Logger } from './logger';
import type { ApiResponse, PaginatedResponse } from '../types';

/**
 * ApiClient — typed wrapper around Playwright's request context.
 * Use in tests for API-level setup/teardown and contract assertions.
 */
export class ApiClient {
  private readonly logger = new Logger('ApiClient');
  private authToken?: string;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = process.env.API_BASE_URL || process.env.BASE_URL || ''
  ) {}

  // ── Auth ────────────────────────────────────────────────────────────────────

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...extra,
    };
  }

  // ── Core methods ─────────────────────────────────────────────────────────────

  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    this.logger.debug(`GET ${path}`);
    const url = new URL(path, this.baseUrl);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const response = await this.request.get(url.toString(), {
      headers: this.buildHeaders(),
    });

    return this.parseResponse<T>(response);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    this.logger.debug(`POST ${path}`, body);
    const response = await this.request.post(`${this.baseUrl}${path}`, {
      headers: this.buildHeaders(),
      data: body,
    });

    return this.parseResponse<T>(response);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    this.logger.debug(`PUT ${path}`, body);
    const response = await this.request.put(`${this.baseUrl}${path}`, {
      headers: this.buildHeaders(),
      data: body,
    });

    return this.parseResponse<T>(response);
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    this.logger.debug(`PATCH ${path}`, body);
    const response = await this.request.patch(`${this.baseUrl}${path}`, {
      headers: this.buildHeaders(),
      data: body,
    });

    return this.parseResponse<T>(response);
  }

  async delete(path: string): Promise<ApiResponse<void>> {
    this.logger.debug(`DELETE ${path}`);
    const response = await this.request.delete(`${this.baseUrl}${path}`, {
      headers: this.buildHeaders(),
    });

    return this.parseResponse<void>(response);
  }

  // ── High-level helpers ───────────────────────────────────────────────────────

  async getPaginated<T>(path: string, params?: Record<string, string>): Promise<PaginatedResponse<T>> {
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
    expect(response.status, `Expected status ${expected}, got ${response.status}`).toBe(expected);
  }

  assertOk(response: ApiResponse<unknown>) {
    expect(response.status, `Expected 2xx, got ${response.status}`).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private async parseResponse<T>(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<ApiResponse<T>> {
    const status = response.status();
    let data: T;

    try {
      data = await response.json();
    } catch {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok()) {
      this.logger.warn(`API error ${status}`, data);
    }

    return {
      status,
      data,
      headers: response.headers(),
    };
  }
}
