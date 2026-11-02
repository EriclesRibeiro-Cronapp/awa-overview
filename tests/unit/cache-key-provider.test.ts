import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ErrorCode } from '@shared/errors';
import { FileCacheKeyProvider } from '../../src/main/services/cache-service';

const storage = {
  isAvailable: () => true,
  encryptString: (value: string) => Buffer.from(`enc:${value}`, 'utf8'),
  decryptString: (value: Buffer) => value.toString('utf8').replace(/^enc:/, ''),
};

describe('FileCacheKeyProvider', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function makeDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'awa-cache-key-'));
    dirs.push(dir);
    return dir;
  }

  it('cria e reutiliza a chave de 32 bytes', async () => {
    const provider = new FileCacheKeyProvider(await makeDir(), storage);
    const first = await provider.getKey();
    const second = await provider.getKey();

    expect(first).toHaveLength(32);
    expect(second.equals(first)).toBe(true);
  });

  it('remove a chave ao limpar', async () => {
    const provider = new FileCacheKeyProvider(await makeDir(), storage);
    await provider.getKey();
    await provider.clear();

    const newKey = await provider.getKey();
    expect(newKey).toHaveLength(32);
  });

  it('falha fechado sem cofre e sem chave existente', async () => {
    const provider = new FileCacheKeyProvider(await makeDir(), {
      ...storage,
      isAvailable: () => false,
    });

    await expect(provider.getKey()).rejects.toMatchObject({
      code: ErrorCode.CONFIG_UNEXPECTED,
    });
  });
});
