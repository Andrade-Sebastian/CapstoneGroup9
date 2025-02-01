
import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ChildProcess, spawn } from 'child_process'
import { echoProcessChannels, EchoProcessChannel } from '../preload'
import os from 'os'

//import echo_server_binary_aarch64_apple_darwin from '../../resources'
const echoServers: Record<number, {
  BrainFlowProcess: ChildProcess
  windows: [BrowserWindow]
  userID: string
  socketID: string
}> = {
  
}

function loadEchoServerBinary(): string{ //need binary files under resources
  if (os.platform() === 'darwin' && os.arch() === 'arm64')
    return 
  else if (os.platform() === 'darwin' && os.arch() === 'x64')
    return
  else return //windows
}

function createProcessWindow(sessionId: string, userId: string): BrowserWindow {
  const processWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  processWindow.on('ready-to-show', () => {
    processWindow.show()
  })

  processWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const activityRoute = `${process.env['ELECTRON_RENDERER_URL']}/activity/${sessionId}/${userId}`
  const processWindowURL =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? join(process.env['ELECTRON_RENDERER_URL'], activityRoute)
      : activityRoute
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    processWindow.loadURL(activityRoute)
  } else {
    const buildLocation = `file://${join(__dirname, `../renderer/index.html#/${activityRoute}`)}`
    processWindow.loadURL(buildLocation)
  }
  return processWindow
}

function createEchoServerProcesses(event, BrainFlowProcess, windows, userID, socketID): void {
  const instance = spawn(loadEchoServerBinary(), [BrainFlowProcess, windows, userID, socketID])
  
  instance.on('error', (err) => {
    console.error(`Failed to start subprocess. ${err}`)
    event.reply('echo-server:launch-failed', err.message)
  })

  instance.on('spawn', () => {
    if (instance.pid === undefined) {
      event.reply('echo-server:launch-failed', 'Failed to get pid')
      throw new Error('Failed to get pid')
    }
    echoServers[instance.pid] = {
      instance: instance,
      BrainFlowProcess: BrainFlowProcess,
      windows: windows,
      userID: userID,
      socketID: socketID
      
    }
    console.log(
      `Echo server started with: pid: ${instance.pid}, BrainFlowProcess: ${BrainFlowProcess}, window: ${windows}, UserID: ${userID}, SocketID: ${socketID}`
    )
    console.log(
      'Echo servers count:',
      Object.entries(echoServers).length,
      Object.entries(echoServers)
    )
    event.reply('echo-server:launched', instance.pid, BrainFlowProcess, windows, userID, socketID)
  })
}

function sendEchoProcessInformation(event, processPID): void {
  console.log(echoServers[processPID])
  const process = echoServers[processPID]

  event.reply('echo-server:info', {
    pid: processPID,
    BrainFlowProcess: process.BrainFlowProcess,
    windows: process.windows,
    userID: process.userID,
    socketID: process.socketID
    })

  }

  function destroyEchoProcess(event, processPID): void{
    const window = BrowserWindow.fromId(event.send.id)
    const process = echoServers[processPID]
    const successfully_killed = [SpeechRecognitionResultList.instance.kill()]
    if(successfully_killed && window ) {
      window.close()
      const process_window_index = windows.findIndex((windowItem) => windowItem.label === processPID)
      windows.splice(process_window_index, 1)
      const main_window = windows.find((windowItem) => windowItem.type === 'main')
      main_window?.instance.webContents.send('echo-server:destroyed', processPID)
    }
    else console.error(`Could not find process viewer window for ${processPID}`)
  }

// Event listener for creating echo server processes
ipcMain.on('echo-server:launch', createEchoServerProcesses)
ipcMain.on('echo-server:info', sendEchoProcessInformation)
ipcMain.on('echo-server:destroy', destroyEchoProcess)
//app.on('quit', killAllEchoProcesses)

export default createProcessWindow

