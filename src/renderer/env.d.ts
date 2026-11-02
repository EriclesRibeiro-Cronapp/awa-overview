import type { IpcApi } from '@shared/contracts';

declare global {
  interface Window {
    api: IpcApi;
  }
}

export {};
