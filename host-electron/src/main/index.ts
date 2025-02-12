import { app, BrowserWindow, ipcMain, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import createMainWindow from './main_window'
import ActivitySingleton from './activitySingleton'


// import createProcessWindow from './process_window'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  const activitySingleton = ActivitySingleton.getInstance()

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

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:filesystem:; connect-src 'self' localhost ws://localhost:3000 http://localhost:3000 http://127.0.0.1:3000;"
        ]
      }
    })
  })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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

function spawnBrainFlow(
  emotibitIpAddress: string,
  serialNumber: string,
  backendIp: string,
  userId: string,
  frontEndSocketId: string,
  sessionId: string
) {
  const activity = ActivitySingleton.getInstance().activityInstances

  const instance = spawn('node', [
    'resources/readEmotibitData.js',
    emotibitIpAddress,
    serialNumber,
    backendIp,
    userId,
    frontEndSocketId
  ])
  activity[userId] = {
    browserWindow: undefined,
    brainflowProcess: instance,
    ipAddress: emotibitIpAddress,
    serialNumber: serialNumber,
    backendIp: backendIp,
    sessionId: sessionId,
    userId: userId,
    frontEndSocketId: frontEndSocketId
  }
  return instance
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on(
  "brainflow:launch",
  (
    event: Electron.IpcMainEvent,
    emotibitIpAddress: string,
    serialNumber: string,
    backendIp: string,
    userId: string,
    frontEndSocketId: string,
    sessionId: string
  ) => {
    const activitySingleton = ActivitySingleton.getInstance()
    const brainflowInstance = spawnBrainFlow(emotibitIpAddress, serialNumber, backendIp, userId, frontEndSocketId, sessionId)

    
    brainflowInstance.on("spawn", () => {
      console.log("launching brainflow", brainflowInstance.pid ?? -1);
      event.sender.send("brainflow:launched")
    })

    brainflowInstance.on("message", (message) => {
      console.log("Process Message: " , message)
    })

    
    brainflowInstance.on("close", (code) => {
      console.log("CODE: ", code)
      if (code !== 0 )
      {
        console.log("(main/index.ts): Closing this shit, brainflow broken as shi")
      }
    })

    brainflowInstance.on("error", () => {
      console.log("(main/index.ts): Error in Brainflow script")
    })

  
  }

)
