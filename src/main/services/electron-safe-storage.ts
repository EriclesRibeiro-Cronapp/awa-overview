import { safeStorage } from 'electron';
import type { SecureStorageAdapter } from './credentials-service';

export const electronSafeStorage: SecureStorageAdapter = {
  isAvailable: () => safeStorage.isEncryptionAvailable(),
  encryptString: (value) => safeStorage.encryptString(value),
  decryptString: (value) => safeStorage.decryptString(value),
};
