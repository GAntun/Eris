const { app, nativeImage, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env in the root directory
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

let mainWindow;
let serverProcess;
const appIcon = nativeImage.createFromPath('./icon.png')

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1376,
    height: 800,
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove the menu bar
  Menu.setApplicationMenu(null);

  // Load the server URL. We wait for the server to be ready in the spawned process.
  mainWindow.loadURL('http://localhost:3200/eris/');

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Failed to load URL: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set the application icon for the dock/taskbar
  const iconPath = path.join(__dirname, 'icon.png');

  // If SKIP_SERVER is set, don't spawn the server; just create the window
  if (process.env.SKIP_SERVER) {
    createWindow();
    return;
  }

  // Spawn the server as a separate Node.js process
  const serverPath = path.join(__dirname, '../server.js');
  serverProcess = spawn('node', [serverPath], {
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.stdout.on('data', (data) => {
    const message = data.toString();
    console.log(`[Server]: ${message}`);
    // Wait for the server to be ready before loading the URL
    if (message.includes('Server running on http://localhost:3200')) {
      createWindow();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error]: ${data}`);
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err);
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.isMac) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});
