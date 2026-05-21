import { test, expect } from '../../fixtures';
import { env } from '../../utils/env';

// ── Helpers ───────────────────────────────────────────────────────────────────
const isConfigured = Boolean(process.env.API_BASE_URL || process.env.BASE_URL);

function skipIfNotConfigured() {
  if (!isConfigured) {
    test.skip(true, 'API_BASE_URL not set — configure config/.env.dev to run API tests');
  }
}

// ── Health ────────────────────────────────────────────────────────────────────
test.describe('API Health @regression', () => {
 test('API reachable', async ({ apiClient }) => {
  skipIfNotConfigured();

  const res = await apiClient.get('/api/competition/anonymous/report');
  expect(res.status).not.toBeGreaterThanOrEqual(500);
});

 test('unauthenticated request to protected route returns 401', async ({ apiClient }) => {
  skipIfNotConfigured();

  const res = await apiClient.post('/api/users/profile');
  expect([401, 403]).toContain(res.status);
});
});

// ── Auth ──────────────────────────────────────────────────────────────────────
test.describe('API Auth @regression', () => {
test('login returns token', async ({ apiClient }) => {
  skipIfNotConfigured();

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');
    return;
  }

  type LoginResponse = {
    error_code: number;
    data: Array<{
      auth_token: string;
      refresh_token?: string;
      [key: string]: any;
    }>;
  };

  const res = await apiClient.post<LoginResponse>('/api/login', {
    username: email,
    password,
    instance_id: 4
  });

  expect(res.status).toBe(200);
  expect(res.data.error_code).toBe(0);

  const token = res.data.data?.[0]?.auth_token;

  expect(token).toBeTruthy();
});

  test('login with wrong password returns error', async ({ apiClient }) => {
  skipIfNotConfigured();

  const email = process.env.TEST_USER_EMAIL;
  if (!email) {
    test.skip(true, 'TEST_USER_EMAIL not set');
    return;
  }

  type LoginResponse = {
    error_code: number;
    error_message?: string;
    data?: any;
  };

  const res = await apiClient.post<LoginResponse>('/api/login', {
    username: email,
    password: 'wrong-password-xyz',
    instance_id: 4
  });

  // API returns 200 even for invalid login
  expect(res.status).toBe(200);

  // Business-level validation
  expect(res.data.error_code).not.toBe(0);
});

  test('login with missing fields returns 400', async ({ apiClient }) => {
    skipIfNotConfigured();
    const res = await apiClient.post('/api/login', {});
    expect(res.status).toBe(400);
  });
});
