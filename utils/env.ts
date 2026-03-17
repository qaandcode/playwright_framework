import type { Environment, EnvironmentConfig } from '../types';

/**
 * env — typed, validated environment config accessor.
 * Throws a clear error at startup if a required variable is missing,
 * rather than silently failing mid-test.
 */

function require(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}\nCheck your config/.env.${process.env.TEST_ENV || 'dev'} file.`);
  }
  return value;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}

export const env = {
  // ── App ─────────────────────────────────────────────────────────────────────
  get baseUrl(): string   { return require('BASE_URL'); },
  get apiBaseUrl(): string { return optional('API_BASE_URL', process.env.BASE_URL || ''); },
  get environment(): Environment {
    return (process.env.TEST_ENV || 'dev') as Environment;
  },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  get userEmail(): string    { return require('TEST_USER_EMAIL'); },
  get userPassword(): string { return require('TEST_USER_PASSWORD'); },
  get adminEmail(): string   { return optional('TEST_ADMIN_EMAIL'); },
  get adminPassword(): string { return optional('TEST_ADMIN_PASSWORD'); },

  // ── Notifications ────────────────────────────────────────────────────────────
  get slackWebhook(): string { return optional('SLACK_WEBHOOK_URL'); },

  // ── Feature flags ────────────────────────────────────────────────────────────
  get visualTestingEnabled(): boolean { return process.env.VISUAL_TESTING_ENABLED === 'true'; },
  get a11yTestingEnabled(): boolean   { return process.env.ACCESSIBILITY_TESTING_ENABLED !== 'false'; },

  // ── Composed config ──────────────────────────────────────────────────────────
  get config(): EnvironmentConfig {
    return {
      baseUrl: this.baseUrl,
      apiBaseUrl: this.apiBaseUrl,
      env: this.environment,
    };
  },

  isCI: !!process.env.CI,
  isLocal: !process.env.CI,
};
