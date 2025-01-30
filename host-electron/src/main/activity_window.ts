
import icon from '../../resources/icon.png?asset'
import { shell, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ChildProcess, spawn } from 'child_process'
import { echoProcessChannels, EchoProcessChannel } from '../preload'

const echoServers: Record<number, ChildProcess> = {}

function createProcessWindow(route: string, pid: string): void {
  const processWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }
  })

  processWindow.on('ready-to-show', () => {
    processWindow.show()
  })

  processWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const processRoute = `process/${pid}`
  const processWindowURL =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? join(process.env['ELECTRON_RENDERER_URL'], processRoute)
      : processRoute
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    processWindow.loadURL(processWindowURL)
  } else {
    const buildLocation = `file://${join(__dirname, `../renderer/index.html#/${route}/${pid}`)}`
    processWindow.loadURL(buildLocation)
  }
}

function createEchoServerProcesses(event, host, port, message): void {
  const instance = spawn('./src/processes/echo_server/echo_server', [host, port, message])
  
  instance.on('error', (err) => {
    console.error(`Failed to start subprocess. ${err}`)
    event.reply('echo-server:launch-failed', err.message)
  })

  instance.on('spawn', () => {
    if (instance.pid === undefined) {
      event.reply('echo-server:launch-failed', 'Failed to get pid')
      throw new Error('Failed to get pid')
    }
    echoServers[instance.pid] = instance
    console.log(
      `Echo server started with: pid: ${instance.pid}, host: ${host}, port: ${port}, message: ${message}`
    )
    console.log(
      'Echo servers count:',
      Object.entries(echoServers).length,
      Object.entries(echoServers)
    )
    event.reply('echo-server:launched', instance.pid, host, port, message)
  })
}

// Event listener for creating echo server processes
ipcMain.on('echo-server:launch', createEchoServerProcesses)

export default createProcessWindow

