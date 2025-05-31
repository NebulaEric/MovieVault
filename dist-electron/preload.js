"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose a limited API to the renderer process (React)
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Example: send a message to main process
    sendMessage: (message) => {
        electron_1.ipcRenderer.send('message-from-renderer', message);
    },
    // Example: listen for replies from main process
    onReply: (callback) => {
        electron_1.ipcRenderer.on('reply-from-main', callback);
    },
    // You can add more methods here for other IPC or Electron APIs you want to expose
});
