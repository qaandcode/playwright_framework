type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL: Level = (process.env.LOG_LEVEL as Level) ?? 'info';

export class Logger {
  constructor(private readonly context: string) {}

  private log(level: Level, msg: string, meta?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[CURRENT_LEVEL]) return;
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] [${this.context}] ${msg}`;
    if (meta !== undefined) {
      console[level === 'debug' ? 'log' : level](base, meta);
    } else {
      console[level === 'debug' ? 'log' : level](base);
    }
  }

  debug(msg: string, meta?: unknown) { this.log('debug', msg, meta); }
  info(msg: string, meta?: unknown)  { this.log('info',  msg, meta); }
  warn(msg: string, meta?: unknown)  { this.log('warn',  msg, meta); }
  error(msg: string, meta?: unknown) { this.log('error', msg, meta); }
}
