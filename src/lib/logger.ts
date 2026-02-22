/**
 * Minimal logger. Respects LOG_LEVEL. Never log secrets (tokens).
 */

const LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type Level = (typeof LEVELS)[number];

function currentLevel(): Level {
  const raw = (process.env.LOG_LEVEL ?? 'info').toString().toLowerCase();
  return LEVELS.includes(raw as Level) ? (raw as Level) : 'info';
}

const levelIndex = (): number => LEVELS.indexOf(currentLevel());

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (LEVELS.indexOf(level) < levelIndex()) return;
  const ts = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const line = `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  if (level === 'error') process.stderr.write(line);
  else process.stdout.write(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
