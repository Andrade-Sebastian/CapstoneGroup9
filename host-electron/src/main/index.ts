import { app, BrowserWindow, ipcMain, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { spawn } from 'child_process'
import createMainWindow from './main_window.ts'
import ActivitySingleton from './activitySingleton.ts'
import createProcessWindow from './activity_window.ts'
import { IActivityInstance } from './activitySingleton.ts'
import axios from 'axios'
import { useSessionStore } from '../renderer/src/store/useSessionStore.tsx';


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

  app.on('ready', () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-eval' data: blob: filesystem: gap:;",
            "script-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;",
            "connect-src 'self' https://www.youtube.com https://www.youtube-nocookie.com http://localhost:3000;",
            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;",
            "child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
          ]
        }
      });
    });
  });
  

  windows.push({
    instance: createMainWindow('/main'),
    type: 'main',
    label: 'main'
  })


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
    app.quit()
})

function handleViewUser(
  event: Electron.IpcMainEvent, sessionId: string, userId: string, nickName:string, experimentType: number
){
  const newProcessWindow = createProcessWindow(sessionId, userId, nickName, experimentType);

  const mainWindow = windows.find(w => w.type === 'main')?.instance;

  if(mainWindow){
    mainWindow.webContents.send('session:request-data', {
      sessionId,
      userId,
      experimentType,
      targetWindowId: newProcessWindow.webContents.id
    });
  }
  event.reply("activity:viewUser", {userId: userId});
}

function spawnBrainFlow(
  emotibitIpAddress: string,
  serialNumber: string,
  backendIp: string,
  userId: number,
  frontEndSocketId: string,
  sessionId: string
) {
  const activity = ActivitySingleton.getInstance().activityInstances

  const instance = spawn('node', [
    'resources/readEmotibitData.js',
    emotibitIpAddress,
    serialNumber,
    backendIp,
    String(userId),
    frontEndSocketId,
  ])
  activity[userId] = {
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

function verifyEmotiBitUsage(ipAddress: string): IActivityInstance | undefined {
  const activity = ActivitySingleton.getInstance().activityInstances;
    return Object.values(activity).find(
      (instance) => instance.ipAddress === ipAddress
    )
}
 

function processDestroyer(event, userId: number): void{
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
  async (
    event: Electron.IpcMainEvent,
    emotibitIpAddress: string,
    serialNumber: string,
    backendIp: string,
    userId: number,
    frontEndSocketId: string,
    sessionId: string
  ) => {
    console.log("BRAINFOW START HIT: ", emotibitIpAddress, serialNumber);
    const found = verifyEmotiBitUsage(emotibitIpAddress);
    console.log("EmotiBit found: ", found);
    if(verifyEmotiBitUsage(emotibitIpAddress) !== undefined) return 
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
      if (code === 7)
      {
        console.log("(main/index.ts): Closing this shit, brainflow broken as shi")
        const activity = ActivitySingleton.getInstance().activityInstances;
        const foundInstance = Object.entries(activity).find(
          ([userID, instance]) => instance.brainflowProcess.pid === brainflowInstance.pid
        )
        if(foundInstance){
          delete activity[foundInstance[1].userId];
        }
        brainflowInstance.kill();
      }
    })

    brainflowInstance.on("error", () => {
      console.log("(main/index.ts): Error in Brainflow script");
      brainflowInstance.kill();
    })
    
    event.reply("brainflow:launched", { sessionId, serialNumber, status: "success"});

    //check if data is being recieved
    brainflowInstance.stdout.on("data", (message) =>{
      //console.log("INSIDE STDOUT: ", brainflowInstance.pid, message.toString());
    })

    //log any errors from brainflow script
    brainflowInstance.stderr.on("data", (message) => {
      console.log("INSIDE STDERR: ", brainflowInstance.pid, message.toString());
    })
  }
)

function destroyAllProcesses(event){
  console.log("Brainflow proccesses being destroyed. Good day.");
}
ipcMain.on('brainflow:destroy-user', processDestroyer);
ipcMain.on('brainflow:status', processStatus);
ipcMain.on('activity:viewUser', handleViewUser);
ipcMain.on('brainflow:destroy', destroyAllProcesses)

ipcMain.on('session:send-to-window', (event) => {
  const sessionData = useSessionStore.getState();
  const senderWebContents = event.sender;

  senderWebContents.send('session:sync', sessionData);
})

ipcMain.on('session:request-data', (event) => {
  const sessionData = useSessionStore.getState(); // or however you store your host session
  console.log("💾 Sending session data to student window:", sessionData);

  event.sender.send('session:sync', sessionData);
});

ipcMain.on('activity:closeAllWindows', (event) => {
  BrowserWindow.getAllWindows().forEach(window => {
    if(window.title === 'WaveBrigade'){
      return;
    }
    else{
      window.close()
    }
  })
})

ipcMain.on('activity:closeUserWindow', (event, nickName) => {
  BrowserWindow.getAllWindows().forEach(window =>{
    if(window.title === nickName){
      window.close();
    }
  })
})

