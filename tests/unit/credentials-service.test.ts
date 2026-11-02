import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { AppErrorException, ErrorCode } from '@shared/errors';
import { CredentialsService, type SecureStorageAdapter } from '../../src/main/services/credentials-service';

function fakeStorage(available = true): SecureStorageAdapter {
  return {
    isAvailable: () => available,
    encryptString: (value) => Buffer.from(`enc:${value}`, 'utf8'),
    decryptString: (value) => value.toString('utf8').replace(/^enc:/, ''),
  };
}

describe('CredentialsService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function makeDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'awa-credentials-'));
    dirs.push(dir);
    return dir;
  }

  it('salva, lê e mascara o PAT', async () => {
    const service = new CredentialsService(await makeDir(), fakeStorage());
    const result = await service.save('figd_1234567890');

    expect(result.patLast4).toBe('7890');
    expect(await service.has()).toBe(true);
    expect(await service.readPat()).toBe('figd_1234567890');
    expect(await service.getLast4()).toBe('7890');
  });

  it('remove o PAT ao limpar', async () => {
    const service = new CredentialsService(await makeDir(), fakeStorage());
    await service.save('figd_1234567890');
    await service.clear();

    expect(await service.has()).toBe(false);
    expect(await service.getLast4()).toBeNull();
  });

  it('falha fechado quando o cofre não está disponível', async () => {
    const service = new CredentialsService(await makeDir(), fakeStorage(false));

    await expect(service.save('figd_1234567890')).rejects.toMatchObject({
      code: ErrorCode.CONFIG_UNEXPECTED,
    });
  });

  it('falha ao ler PAT inexistente', async () => {
    const service = new CredentialsService(await makeDir(), fakeStorage());

    await expect(service.readPat()).rejects.toBeInstanceOf(AppErrorException);
  });
});
