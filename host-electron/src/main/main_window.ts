 

 import icon from '../../resources/icon.png?asset'
 import { shell, BrowserWindow } from 'electron'
 import { join } from 'path'
 import { is } from '@electron-toolkit/utils'
 
 function createMainWindow(): void {
   const mainWindow = new BrowserWindow({
     width: 900,
     height: 670,
     show: false,
     autoHideMenuBar: true,
     ...(process.platform === 'linux' ? { icon } : {}),
     webPreferences: {
       preload: join(__dirname, '../preload/index.js'),
       sandbox: false,
       contextIsolation: true
     }
   })
 
   mainWindow.on('ready-to-show', () => {
     mainWindow.show()
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
 }
 
 export default createMainWindow

 