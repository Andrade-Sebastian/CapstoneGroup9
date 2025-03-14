 

 import icon from '../../resources/icon.png?asset'
 import { shell, BrowserWindow, ipcMain } from 'electron'
 import { join } from 'path'
 import { is } from '@electron-toolkit/utils'
 import createProcessWindow from './activity_window.ts'
 import { windows } from '.'
 import { windowsStore } from 'process';
 
 function createMainWindow(route:string): BrowserWindow {
   const mainWindow = new BrowserWindow({
     
     width: 900,
     height: 670,
     show: false,
     title: 'WaveBrigade',
     autoHideMenuBar: true,
     ...(process.platform === 'linux' ? { icon } : {}),
     webPreferences: {
       preload: join(__dirname, '../preload/index.js'),
       sandbox: false,
       contextIsolation: true,
       nodeIntegration: false, // Disable Node.js integration
       webSecurity: true, // Allows embedding YouTube videos
       allowRunningInsecureContent: true // Prevents CSP blocking
     }
   })
 
   mainWindow.on('ready-to-show', () => {
    
     mainWindow.show()
     mainWindow.webContents.openDevTools();
   })
 
   mainWindow.webContents.setWindowOpenHandler((details) => {
     shell.openExternal(details.url)
     return { action: 'deny' }
   })
 
   // HMR for renderer base on electron-vite cli.
   // Load the remote URL for development or the local html file for production.
   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
     mainWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], "/"))
   } else {
     const buildLocation = `file://${join(__dirname, `../renderer/index.html#/${"/"}`)}`
     mainWindow.loadURL(buildLocation)
   }
   return mainWindow
 }

 ipcMain.on('main-window:open-process-viewer', (_event, processObject) =>
  windows.push({
    instance: createProcessWindow(`/process/`, processObject.pid),
    type: 'process',
    label: processObject.pid
  })
)
 
 export default createMainWindow

 