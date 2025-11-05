import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { localStorageService } from '../services/localStorageService';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../../assets/icon.png'), // Add icon later
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Initialize local storage
  localStorageService.init().catch(console.error);

  // In development, load from web dev server
  // Check if running in development (not packaged)
  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000'); // Web dev server port
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built renderer
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Focus on app
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // Show about dialog
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: `About ${app.getName()}` },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: `Hide ${app.getName()}` },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        { role: 'quit', label: `Quit ${app.getName()}` },
      ],
    });

    // Window menu for macOS
    template[4].submenu = [
      { role: 'close', label: 'Close' },
      { role: 'minimize', label: 'Minimize' },
      { role: 'zoom', label: 'Zoom' },
      { type: 'separator' },
      { role: 'front', label: 'Bring All to Front' },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
function setupIpcHandlers(): void {
  // File operations
  ipcMain.handle('file:showOpenDialog', async (_, options) => {
    const { dialog } = await import('electron');
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('file:showSaveDialog', async (_, options) => {
    const { dialog } = await import('electron');
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('file:readFile', async (_, filePath: string) => {
    const fs = await import('fs/promises');
    return await fs.readFile(filePath);
  });

  ipcMain.handle('file:writeFile', async (_, filePath: string, data: Buffer) => {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, data);
  });

  // Local storage operations
  ipcMain.handle('storage:saveUser', async (_, user: any) => {
    await localStorageService.saveUser(user);
  });

  ipcMain.handle('storage:getUser', async (_, userId: string) => {
    return await localStorageService.getUser(userId);
  });

  ipcMain.handle('storage:savePet', async (_, pet: any) => {
    await localStorageService.savePet(pet);
  });

  ipcMain.handle('storage:getPets', async (_, ownerId?: string) => {
    return await localStorageService.getPets(ownerId);
  });

  ipcMain.handle('storage:saveBooking', async (_, booking: any) => {
    await localStorageService.saveBooking(booking);
  });

  ipcMain.handle('storage:getBookings', async (_, userId?: string) => {
    return await localStorageService.getBookings(userId);
  });

  // App info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getPath', (_, name: string) => {
    return app.getPath(name as any);
  });
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Cleanup
  localStorageService.close();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  localStorageService.close();
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Open external URLs in system browser
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
});
