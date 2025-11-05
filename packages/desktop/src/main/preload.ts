import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld('electron', {
  // File operations
  file: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('file:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('file:showSaveDialog', options),
    readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),
    writeFile: (filePath: string, data: Buffer) => ipcRenderer.invoke('file:writeFile', filePath, data),
  },

  // Local storage operations
  storage: {
    saveUser: (user: any) => ipcRenderer.invoke('storage:saveUser', user),
    getUser: (userId: string) => ipcRenderer.invoke('storage:getUser', userId),
    savePet: (pet: any) => ipcRenderer.invoke('storage:savePet', pet),
    getPets: (ownerId?: string) => ipcRenderer.invoke('storage:getPets', ownerId),
    saveBooking: (booking: any) => ipcRenderer.invoke('storage:saveBooking', booking),
    getBookings: (userId?: string) => ipcRenderer.invoke('storage:getBookings', userId),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },
});

// Type declarations for TypeScript
declare global {
  interface Window {
    electron: {
      file: {
        showOpenDialog: (options: any) => Promise<any>;
        showSaveDialog: (options: any) => Promise<any>;
        readFile: (filePath: string) => Promise<Buffer>;
        writeFile: (filePath: string, data: Buffer) => Promise<void>;
      };
      storage: {
        saveUser: (user: any) => Promise<void>;
        getUser: (userId: string) => Promise<any>;
        savePet: (pet: any) => Promise<void>;
        getPets: (ownerId?: string) => Promise<any[]>;
        saveBooking: (booking: any) => Promise<void>;
        getBookings: (userId?: string) => Promise<any[]>;
      };
      app: {
        getVersion: () => Promise<string>;
        getPath: (name: string) => Promise<string>;
      };
    };
  }
}
