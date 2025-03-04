import { app, BrowserWindow, ipcMain, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import createMainWindow from './main_window.ts'
import ActivitySingleton from './activitySingleton.ts'


export const windows:Array<{
  instance: BrowserWindow
  type: 'main' | 'process'
  label: string
}> = []

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

  windows.push({
    instance: createMainWindow('/main'),
    type: 'main',
    label: 'main'
  })

  // createProcessWindow("1234", "69")
  // 4343 is the argument that will be passed to the process window
  // createProcessWindow('/process/', '4343')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // 'Content-Security-Policy': [
        //   "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:filesystem:; connect-src 'self' localhost ws://localhost:3000 http://localhost:3000 http://127.0.0.1:3000;"
        // ]
      }
    })
  })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow('/main')
  })
})


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

function processDestroyer(event, userId: string): void{
  //const process = echoServers[userId]
  const activitySingleton = ActivitySingleton.getInstance()
  const processEntry = activitySingleton.activityInstances[userId];

  if(!processEntry){ //if processEntry is empty
    console.log(`Could not find a process for user: ${userId}`)
    event.reply('echo-server:destroy-failed', `No process found for userID: ${userId}`);
    return;
  }

  console.log(`Destroying process for userID: ${userId}`)

  const successfully_killed = processEntry.brainflowProcess.kill() //returns bool

  if(successfully_killed){
    delete activitySingleton.activityInstances[userId]; //deletes from echo servers
    console.log(`Deleted process for userId: ${userId}, ProcessPID ${processEntry.brainflowProcess!.pid}`)

    event.reply('echo-server:destroyed', {userId});
  }
  else{
    console.log(`could not destroy process for userId: ${userId}`)
    event.reply('echo-server:destroyed-failed', `Failed to destroy process for userId: ${userId}`);
  }
}

function processStatus(event, userId: string): void{
  const activitySingleton = ActivitySingleton.getInstance()
  const processEntry = activitySingleton.activityInstances[userId];

  if(!processEntry){ 
    console.log(`Could not find a process for user: ${userId}`)
    event.reply('echo-server:destroy-failed', `No process found for userID: ${userId}`);
    return;
  }
  console.log(`Checking status for process of userID: ${userId}, ProcessPID ${processEntry.brainflowProcess!.pid}`)
  
  event.reply('echo-server:status', {user: userId}) //what other variables needs to be shared?
}

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
    event.reply("brainflow:launched", { sessionId, status: "success"});
  }
)
ipcMain.on('echo-server:destroy-user', processDestroyer);
ipcMain.on('echo-server:status', processStatus);