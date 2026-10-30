import { app, nativeImage, BrowserWindow, Menu } from 'electron';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

/**
 * Finds an environment file relative to the current working directory or the
 * Electron source/build directory.
 *
 * @param name - Environment file name to locate, such as `.env`.
 * @returns The absolute path to the first matching file, or `null` when absent.
 * @remarks
 * Multiple candidates are checked so the same code works from TypeScript
 * sources, the compiled `build/` output, and packaged application layouts.
 */
function findEnvFile(name: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), name),
    path.resolve(__dirname, name),
    path.resolve(__dirname, '..', name),
    path.resolve(__dirname, '..', '..', name)
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

// Load environment variables from .env in the root directory
const envPath = findEnvFile('.env');
if (envPath) {
  dotenv.config({ path: envPath });
}

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
const appIcon = nativeImage.createFromPath('./icon.png');

/**
 * Creates the main application window and loads the Eris web interface.
 *
 * @returns Nothing.
 * @remarks
 * The window uses context isolation with Node integration disabled. The menu bar
 * is removed, and the module-level `mainWindow` reference is cleared on close.
 */
function createWindow(): void {
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

  /**
   * Logs failures that occur while loading the application URL.
   *
   * @param _event - Electron navigation event, unused.
   * @param errorCode - Chromium error code describing the failure.
   * @param errorDescription - Human-readable failure description.
   */
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Failed to load URL: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

/**
 * Initializes the Electron application after the framework is ready.
 *
 * @returns A promise that resolves after startup handling is registered.
 * @remarks
 * When `SKIP_SERVER` is set, only the window is created. Otherwise the compiled
 * server is spawned as a child process and the window opens once it is listening.
 */
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
  const child = spawn('node', [serverPath], {
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  serverProcess = child;

  /**
   * Forwards server output to the Electron console and opens the window when ready.
   *
   * @param data - Chunk of text written by the server process.
   */
  child.stdout.on('data', (data: Buffer) => {
    const message = data.toString();
    console.log(`[Server]: ${message}`);
    // Wait for the server to be ready before loading the URL
    if (message.includes('Server running on http://localhost:3200')) {
      createWindow();
    }
  });

  /**
   * Forwards server error output to the Electron console.
   *
   * @param data - Chunk of error text written by the server process.
   */
  child.stderr.on('data', (data: Buffer) => {
    console.error(`[Server Error]: ${data}`);
  });

  /**
   * Handles failure to launch the server process.
   *
   * @param err - Error raised by the child process.
   * @remarks
   * The application quits because the window cannot function without the server.
   */
  child.on('error', (err) => {
    console.error('Failed to start server process:', err);
    app.quit();
  });

  /**
   * Recreates the window when the application is activated on macOS.
   */
  app.on('activate', () => {
    if ((BrowserWindow as unknown as { isMac?: boolean }).isMac) createWindow();
  });
});

/**
 * Shuts down the spawned server and quits when all windows are closed.
 *
 * @remarks
 * macOS keeps applications alive after closing windows, so the process remains
 * running on the `darwin` platform.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});
