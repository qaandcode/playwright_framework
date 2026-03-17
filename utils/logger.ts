/**
 * Logger — lightweight structured logger for test output.
 * In CI, all output goes to stdout and is captured by the reporter.
 */
export class Logger {
  private readonly prefix: string;
  private static readonly ENABLED = process.env.LOG_LEVEL !== 'silent';

  constructor(context: string) {
    this.prefix = `[${context}]`;
  }

  info(message: string, data?: unknown) {
    if (Logger.ENABLED) {
      const extra = data ? ` ${JSON.stringify(data)}` : '';
      process.stdout.write(`ℹ ${this.prefix} ${message}${extra}\n`);
    }
  }

  debug(message: string, data?: unknown) {
    if (process.env.LOG_LEVEL === 'debug') {
      const extra = data ? ` ${JSON.stringify(data)}` : '';
      process.stdout.write(`🐛 ${this.prefix} ${message}${extra}\n`);
    }
  }

  warn(message: string, data?: unknown) {
    if (Logger.ENABLED) {
      const extra = data ? ` ${JSON.stringify(data)}` : '';
      process.stderr.write(`⚠ ${this.prefix} ${message}${extra}\n`);
    }
  }

  error(message: string, error?: unknown) {
    const detail = error instanceof Error ? ` ${error.message}` : error ? ` ${JSON.stringify(error)}` : '';
    process.stderr.write(`✖ ${this.prefix} ${message}${detail}\n`);
  }

  step(message: string) {
    if (Logger.ENABLED) {
      process.stdout.write(`→ ${this.prefix} ${message}\n`);
    }
  }
}
