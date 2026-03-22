import { Logger } from './logger';
import { env } from './env';

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
}

export class SlackReporter {
  private readonly logger = new Logger('SlackReporter');

  async notify(payload: {
    title: string;
    status: 'passed' | 'failed' | 'partial';
    total: number;
    passed: number;
    failed: number;
    duration: string;
    runUrl?: string;
  }): Promise<void> {
    const webhook = env.slackWebhook;
    if (!webhook) {
      this.logger.debug('SLACK_WEBHOOK_URL not set — skipping Slack notification');
      return;
    }

    const emoji = payload.status === 'passed' ? '✅' : payload.status === 'partial' ? '⚠️' : '❌';
    const color = payload.status === 'passed' ? '#36a64f' : payload.status === 'partial' ? '#ff9800' : '#e01e5a';

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${emoji} ${payload.title}` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `*Status:* ${payload.status.toUpperCase()}`,
            `*Tests:* ${payload.passed}/${payload.total} passed`,
            `*Failed:* ${payload.failed}`,
            `*Duration:* ${payload.duration}`,
            payload.runUrl ? `*Report:* <${payload.runUrl}|View Report>` : '',
          ].filter(Boolean).join('\n'),
        },
      },
    ];

    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks, attachments: [{ color }] }),
      });
      if (!res.ok) this.logger.warn(`Slack notification failed: ${res.status}`);
      else this.logger.info('Slack notification sent');
    } catch (err) {
      this.logger.error('Slack notification error', err);
    }
  }
}
