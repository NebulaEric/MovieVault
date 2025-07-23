const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited API to the renderer process (React)
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: send a message to main process
  sendMessage: (message: string) => {
    ipcRenderer.send('message-from-renderer', message);
  },

  // Example: listen for replies from main process
  onReply: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
    ipcRenderer.on('reply-from-main', callback);
  },

  // You can add more methods here for other IPC or Electron APIs you want to expose
});
