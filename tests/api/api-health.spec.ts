import { test, expect } from '../../fixtures';

/**
 * API contract tests @regression
 * Run via the 'api' project — no browser, just HTTP.
 * These verify the backend is returning expected schemas and status codes.
 */

test.describe('API Health @regression', () => {

  test('health endpoint returns 200', async ({ apiClient }) => {
    const res = await apiClient.get('/health');
    expect(res.status).toBe(200);
  });

  test('unauthenticated request to protected route returns 401', async ({ apiClient }) => {
    const res = await apiClient.get('/api/users');
    expect(res.status).toBe(401);
  });
});

test.describe('API Auth @regression', () => {

  test('login returns token', async ({ request }) => {
    const { env } = await import('../../utils/env');
    const { ApiClient } = await import('../../utils/api-client');
    const client = new ApiClient(request);

    const res = await client.post<{ token: string }>('/auth/login', {
      email: env.userEmail,
      password: env.userPassword,
    });

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('token');
    expect(typeof res.data.token).toBe('string');
    expect(res.data.token.length).toBeGreaterThan(10);
  });

  test('login with wrong password returns 401', async ({ apiClient }) => {
    const { env } = await import('../../utils/env');
    const res = await apiClient.post('/auth/login', {
      email: env.userEmail,
      password: 'definitelywrong',
    });
    expect(res.status).toBe(401);
  });

  test('login with missing fields returns 400', async ({ apiClient }) => {
    const res = await apiClient.post('/auth/login', { email: 'only@email.com' });
    expect(res.status).toBe(400);
  });
});

test.describe('API Users @regression', () => {

  test('authenticated user can fetch own profile', async ({ authedApiClient }) => {
    const res = await authedApiClient.get<{ id: string; email: string }>('/api/me');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id');
    expect(res.data).toHaveProperty('email');
  });

  test('user list is paginated', async ({ authedApiClient }) => {
    const res = await authedApiClient.get<{ data: unknown[]; total: number }>('/api/users');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('data');
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data).toHaveProperty('total');
  });

  test('non-existent user returns 404', async ({ authedApiClient }) => {
    const res = await authedApiClient.get('/api/users/nonexistent-id-00000');
    expect(res.status).toBe(404);
  });
});
