import { app, BrowserWindow, ipcMain, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import createMainWindow from './main_window.ts'
import createProcessWindow from './activity_window.js'
import ActivitySingleton, { IActivityInstance } from './activitySingleton'
import { ActivityEvents, BRAINFLOW_LAUNCH } from '../preload/index.js'

// import createProcessWindow from './process_window'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  const activitySingleton = ActivitySingleton.getInstance();

  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow()
  // createProcessWindow("1234", "69")
  // 4343 is the argument that will be passed to the process window
  // createProcessWindow('/process/', '4343')

  session.defaultSession.webRequest.onHeadersReceived((details,callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:filesystem:;"
        ]
      }
    })
  })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow('/main')
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function spawnBrainFlow(emotibitIpAddress: string, serialNumber: string, backendIp: string, userId: string, frontEndSocketId: string )
{
  
}
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("brainflow:launch", (event: Electron.IpcMainEvent, emotibitIpAddress: string, serialNumber: string, backendIp: string, userId: string, frontEndSocketId: string) => {
  const activitySingleton = ActivitySingleton.getInstance();

})