import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { AzureDevOpsClient } from './services/azure-devops-client';
import { CacheService, FileCacheKeyProvider } from './services/cache-service';
import { ConfigService } from './services/config-service';
import { CredentialsService } from './services/credentials-service';
import { DiagnosticsService } from './services/diagnostics-service';
import { electronSafeStorage } from './services/electron-safe-storage';
import { initLogger, logFilePath } from './services/logger';
import { OverviewCacheService } from './services/overview-cache-service';
import { OverviewService } from './services/overview-service';
import { ProjectsService } from './services/projects-service';
import { PullRequestsCacheService } from './services/pull-requests-cache-service';
import { PullRequestsService } from './services/pull-requests-service';
import { WorkItemsCacheService } from './services/work-items-cache-service';
import { WorkItemsService } from './services/work-items-service';
import { registerIpcHandlers } from './ipc/handlers';
import { applyContentSecurityPolicy } from './security/csp';

let mainWindow: BrowserWindow | null = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(bootstrap).catch((error) => {
    console.error('Falha ao iniciar a aplicação', error);
    app.quit();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}

async function bootstrap(): Promise<void> {
  const dataDir = app.getPath('userData');
  const logsDir = join(dataDir, 'logs');
  await initLogger(logsDir);

  const config = new ConfigService(dataDir);
  const credentials = new CredentialsService(dataDir, electronSafeStorage);
  const cacheKey = new FileCacheKeyProvider(dataDir, electronSafeStorage);
  const cache = new CacheService(dataDir, cacheKey);
  const overviewCache = new OverviewCacheService(dataDir, cacheKey);
  const workItemsCache = new WorkItemsCacheService(dataDir, cacheKey);
  const pullRequestsCache = new PullRequestsCacheService(dataDir, cacheKey);
  const client = new AzureDevOpsClient();
  const projects = new ProjectsService(client, cache);
  const overview = new OverviewService(client, overviewCache);
  const workItems = new WorkItemsService(client, workItemsCache);
  const pullRequests = new PullRequestsService(client, pullRequestsCache);
  const diagnostics = new DiagnosticsService(dataDir, logFilePath(logsDir), async () => {
    const current = await config.get();
    return {
      appVersion: app.getVersion(),
      platform: process.platform,
      organization: current.organization,
      status: current.status,
      integrations: { azureDevOps: 'not-checked' },
    };
  });

  registerIpcHandlers({
    config,
    credentials,
    cache,
    cacheKey,
    overviewCache,
    workItemsCache,
    pullRequestsCache,
    client,
    projects,
    overview,
    workItems,
    pullRequests,
    diagnostics,
    appVersion: app.getVersion(),
  });

  applyContentSecurityPolicy();
  createWindow();
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    show: false,
    backgroundColor: '#FBFBFB',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
