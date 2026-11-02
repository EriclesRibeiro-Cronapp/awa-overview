import { contextBridge, ipcRenderer } from 'electron';
import type { IpcApi } from '@shared/contracts';

const api: IpcApi = {
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    save: (input) => ipcRenderer.invoke('config:save', input),
    remove: () => ipcRenderer.invoke('config:remove'),
  },
  projects: {
    list: (input) => ipcRenderer.invoke('projects:list', input),
    teams: (input) => ipcRenderer.invoke('teams:list', input),
  },
  overview: {
    load: (input) => ipcRenderer.invoke('overview:load', input),
  },
  workItems: {
    load: (input) => ipcRenderer.invoke('workItems:load', input),
  },
  pullRequests: {
    load: (input) => ipcRenderer.invoke('pullRequests:load', input),
  },
  pipelines: {
    load: (input) => ipcRenderer.invoke('pipelines:load', input),
  },
  session: {
    select: (input) => ipcRenderer.invoke('session:select', input),
  },
  diagnostics: {
    export: () => ipcRenderer.invoke('diagnostics:export'),
  },
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    openExternal: (input) => ipcRenderer.invoke('app:openExternal', input),
  },
};

contextBridge.exposeInMainWorld('api', api);
