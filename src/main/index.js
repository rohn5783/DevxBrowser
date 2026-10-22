import electron from 'electron';
const { app, BrowserWindow, protocol, session } = electron;
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import store from './storage/store.js';
import shieldsEngine from './shields/shields-engine.js';
import { registerBraveProtocol } from './protocols/brave-protocol.js';
import { setupIpcHandlers } from './ipc-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register custom brave:// scheme as privileged before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'brave',
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

let mainWindow = null;

function createBrowserWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 850,
    minHeight: 550,
    frame: false, // Sleek frameless Brave styling with integrated tab bar & controls
    backgroundColor: '#1E2029',
    title: 'Brave Browser',
    icon: path.join(__dirname, '../../assets/icons/brave-lion.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/browser-preload.cjs'),
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: true
    }
  });

  // Load the browser chrome UI
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  setupIpcHandlers(mainWindow);

  // Handle downloads
  mainWindow.webContents.session.on('will-download', (_event, item) => {
    const totalBytes = item.getTotalBytes();
    const fileName = item.getFilename();

    item.on('updated', (_evt, state) => {
      if (state === 'interrupted') {
        console.log('[Download] interrupted');
      } else if (state === 'progressing') {
        if (!item.isPaused() && mainWindow && !mainWindow.isDestroyed()) {
          const received = item.getReceivedBytes();
          const percent = totalBytes > 0 ? Math.round((received / totalBytes) * 100) : 0;
          mainWindow.webContents.send('download:progress', {
            fileName,
            received,
            total: totalBytes,
            percent,
            state: 'downloading'
          });
        }
      }
    });

    item.once('done', (_evt, state) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download:progress', {
          fileName,
          state: state === 'completed' ? 'completed' : 'failed'
        });
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  store.init();
  registerBraveProtocol();
  shieldsEngine.init(session.defaultSession);

  createBrowserWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBrowserWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
