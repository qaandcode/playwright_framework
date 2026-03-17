import type {
  Reporter,
  FullConfig,
  Suite,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import type { TestSummary } from '../types';

/**
 * SlackReporter — posts a pass/fail summary to a Slack channel after the run.
 * Set SLACK_WEBHOOK_URL in your environment to activate.
 */
export default class SlackReporter implements Reporter {
  private startTime = Date.now();
  private summary: TestSummary = {
    total: 0, passed: 0, failed: 0, skipped: 0,
    duration: 0, environment: process.env.TEST_ENV || 'dev',
    branch: process.env.GITHUB_REF_NAME,
    runUrl: process.env.GITHUB_SERVER_URL
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined,
  };

  onBegin(_config: FullConfig, suite: Suite) {
    this.summary.total = suite.allTests().length;
    this.startTime = Date.now();
  }

  onTestEnd(_test: unknown, result: TestResult) {
    if (result.status === 'passed')  this.summary.passed++;
    if (result.status === 'failed')  this.summary.failed++;
    if (result.status === 'skipped') this.summary.skipped++;
  }

  async onEnd(result: FullResult) {
    this.summary.duration = Math.round((Date.now() - this.startTime) / 1000);
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return;

    const status = result.status === 'passed' ? '✅ Passed' : '❌ Failed';
    const emoji  = result.status === 'passed' ? ':white_check_mark:' : ':x:';
    const envLabel = this.summary.environment.toUpperCase();
    const dur = `${Math.floor(this.summary.duration / 60)}m ${this.summary.duration % 60}s`;

    const body = {
      text: `${emoji} *E2E Test Run — ${envLabel}*`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${status} — ${envLabel}` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Total:*\n${this.summary.total}` },
            { type: 'mrkdwn', text: `*Passed:*\n${this.summary.passed}` },
            { type: 'mrkdwn', text: `*Failed:*\n${this.summary.failed}` },
            { type: 'mrkdwn', text: `*Skipped:*\n${this.summary.skipped}` },
            { type: 'mrkdwn', text: `*Duration:*\n${dur}` },
            { type: 'mrkdwn', text: `*Branch:*\n${this.summary.branch || 'local'}` },
          ],
        },
        ...(this.summary.runUrl
          ? [{
              type: 'actions',
              elements: [{
                type: 'button',
                text: { type: 'plain_text', text: 'View Run' },
                url: this.summary.runUrl,
              }],
            }]
          : []),
      ],
    };

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      process.stderr.write(`[SlackReporter] Failed to send notification: ${err}\n`);
    }
  }
}
