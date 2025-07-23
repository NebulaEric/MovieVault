// import { app, BrowserWindow } from 'electron'
// import path from 'path'
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// function createWindow() {
//   const win = new BrowserWindow({
//     width: 2090,
//     height: 1320,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//     },
//   })
//   // In development, load from Vite dev server
//   if (!app.isPackaged) {
//     win.loadURL('http://localhost:5173')
//   } else {
//     win.loadFile(path.join(__dirname, '../index.html'))
//   }
// }
// app.whenReady().then(() => {
//   createWindow()
//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit()
// })
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
// Convert import.meta.url to __filename and __dirname equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
    const win = new BrowserWindow({
        width: 2090,
        height: 1320,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // make sure preload.js exists here
        },
    });
    if (!app.isPackaged) {
        win.loadURL('http://localhost:5173');
    }
    else {
        win.loadFile(path.join(__dirname, '../index.html'));
    }
}
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
