/**
 * env — typed, validated environment config accessor.
 *
 * All properties are getters so they read process.env AFTER
 * playwright.config.ts has loaded the .env file. Plain properties
 * evaluated at import time would always capture undefined.
 */

type Environment = 'dev' | 'staging' | 'prod';

interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  env: Environment;
}

const TEST_ENV = process.env.TEST_ENV || 'dev';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Check your config/.env.${TEST_ENV} file.\n` +
      `Copy config/.env.dev → config/.env.${TEST_ENV} and fill in real values.`
    );
  }
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // ── URLs ──────────────────────────────────────────────────────────────────
  get baseUrl(): string {
    return optional('BASE_URL', 'http://bonzo.knowledgeplatform.com');
  },
  get apiBaseUrl(): string {
    return optional('API_BASE_URL', optional('BASE_URL', 'http://bonzoapi.knowledgeplatform.com'));
  },

  // ── User credentials ──────────────────────────────────────────────────────
  get userEmail(): string    { return required('TEST_USER_EMAIL'); },
  get userPassword(): string { return required('TEST_USER_PASSWORD'); },

  // ── Admin credentials (optional) ──────────────────────────────────────────
  get adminEmail(): string    { return optional('TEST_ADMIN_EMAIL'); },
  get adminPassword(): string { return optional('TEST_ADMIN_PASSWORD'); },
  get hasAdminCreds(): boolean {
    return Boolean(process.env.TEST_ADMIN_EMAIL && process.env.TEST_ADMIN_PASSWORD);
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  get slackWebhook(): string { return optional('SLACK_WEBHOOK_URL'); },

  // ── Meta ──────────────────────────────────────────────────────────────────
  get testEnv(): Environment { return TEST_ENV as Environment; },
  get isCI(): boolean        { return !!process.env.CI; },
  get isLocal(): boolean     { return !process.env.CI; },

  // ── Composed config ───────────────────────────────────────────────────────
  get config(): EnvironmentConfig {
    return {
      baseUrl:    this.baseUrl,
      apiBaseUrl: this.apiBaseUrl,
      env:        this.testEnv,
    };
  },
};