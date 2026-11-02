import log from 'electron-log/main';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { redactText, redactValue } from '../security/redaction';

const MAX_LOG_SIZE = 5 * 1024 * 1024;
const DEFAULT_RETENTION_DAYS = 14;

export async function initLogger(logsDir: string, retentionDays = DEFAULT_RETENTION_DAYS): Promise<void> {
  await mkdir(logsDir, { recursive: true });
  log.transports.file.level = 'info';
  log.transports.console.level = 'info';
  log.transports.file.maxSize = MAX_LOG_SIZE;
  log.transports.file.resolvePathFn = () => join(logsDir, 'main.log');
  await cleanupOldLogs(logsDir, retentionDays);
}

export function logEvent(event: string, context?: Record<string, unknown>): void {
  log.info(event, redactValue(context ?? {}));
}

export function logError(code: string, message: string, context?: Record<string, unknown>): void {
  log.error(code, redactText(message), redactValue(context ?? {}));
}

export function logFilePath(logsDir: string): string {
  return join(logsDir, 'main.log');
}

async function cleanupOldLogs(logsDir: string, retentionDays: number): Promise<void> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const entries = await readdir(logsDir).catch(() => []);
  for (const entry of entries) {
    if (!entry.endsWith('.log')) continue;
    const filePath = join(logsDir, entry);
    const info = await stat(filePath).catch(() => null);
    if (info && info.mtimeMs < cutoff) {
      await unlink(filePath).catch(() => undefined);
    }
  }
}
