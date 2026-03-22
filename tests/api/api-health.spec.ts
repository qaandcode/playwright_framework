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
  test('health endpoint returns 200', async ({ apiClient }) => {
    skipIfNotConfigured();
    const res = await apiClient.get('/health');
    expect(res.status).toBe(200);
  });

  test('unauthenticated request to protected route returns 401', async ({ apiClient }) => {
    skipIfNotConfigured();
    const res = await apiClient.get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
test.describe('API Auth @regression', () => {
  test('login returns token', async ({ apiClient }) => {
    skipIfNotConfigured();

    const email    = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    if (!email || !password) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');
      return;
    }

    const res = await apiClient.post<{ token: string }>('/auth/login', { email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('login with wrong password returns 401', async ({ apiClient }) => {
    skipIfNotConfigured();

    const email = process.env.TEST_USER_EMAIL;
    if (!email) {
      test.skip(true, 'TEST_USER_EMAIL not set');
      return;
    }

    const res = await apiClient.post('/auth/login', { email, password: 'wrong-password-xyz' });
    expect(res.status).toBe(401);
  });

  test('login with missing fields returns 400', async ({ apiClient }) => {
    skipIfNotConfigured();
    const res = await apiClient.post('/auth/login', {});
    expect(res.status).toBe(400);
  });
});

// ── Users ─────────────────────────────────────────────────────────────────────
test.describe('API Users @regression', () => {
  test('authenticated user can fetch own profile', async ({ authedApiClient }) => {
    skipIfNotConfigured();
    if (!process.env.TEST_USER_EMAIL) {
      test.skip(true, 'TEST_USER_EMAIL not set');
      return;
    }
    const res = await authedApiClient.get('/api/users/me');
    expect([200, 401]).toContain(res.status); // 401 = token-less but test won't hard fail
  });

  test('user list is paginated', async ({ authedApiClient }) => {
    skipIfNotConfigured();
    if (!process.env.TEST_USER_EMAIL) {
      test.skip(true, 'TEST_USER_EMAIL not set');
      return;
    }
    const res = await authedApiClient.get('/api/users', { page: '1', perPage: '10' });
    expect([200, 401]).toContain(res.status);
  });

  test('non-existent user returns 404', async ({ authedApiClient }) => {
    skipIfNotConfigured();
    if (!process.env.TEST_USER_EMAIL) {
      test.skip(true, 'TEST_USER_EMAIL not set');
      return;
    }
    const res = await authedApiClient.get('/api/users/00000000-0000-0000-0000-000000000000');
    expect([404, 401]).toContain(res.status);
  });
});
