import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { redactText } from '../security/redaction';

export interface DiagnosticsInfo {
  appVersion: string;
  platform: string;
  organization: string | null;
  status: string;
  integrations: Record<string, string>;
}

export class DiagnosticsService {
  constructor(
    private readonly dataDir: string,
    private readonly logPath: string,
    private readonly info: () => Promise<DiagnosticsInfo>,
  ) {}

  async export(): Promise<string> {
    const logTail = await readLogTail(this.logPath);
    const info = await this.info();
    const payload = {
      generatedAt: new Date().toISOString(),
      ...info,
      logTail: redactText(logTail),
    };

    await mkdir(this.dataDir, { recursive: true });
    const fileName = `diagnostics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = join(this.dataDir, fileName);
    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return filePath;
  }
}

async function readLogTail(filePath: string, maxLines = 200): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf8');
    return content.split(/\r?\n/).slice(-maxLines).join('\n');
  } catch {
    return '';
  }
}
