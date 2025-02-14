import { contextBridge, ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type TYPE_BRAINFLOW_LAUNCH = "brainflow:launch" 
export const BRAINFLOW_LAUNCH: TYPE_BRAINFLOW_LAUNCH = "brainflow:launch"
export type BRAINFLOW_DESTROY = "brainflow:destroy"


//event names for renderer
export type ActivityEvents =
  //each one of these is called a "channel"
  TYPE_BRAINFLOW_LAUNCH | //launches brainflow
  BRAINFLOW_DESTROY | //closes brainflow
  "brainflow:launched"|
  "activity:viewUser"| //host selects student to view
  "brainflow:launchError"| 
  "brainflow:connectingEmotibit"|
  "brainflow:connectedEmotibit"|
  "brainflow:disconnectEmotibit"  //disconnect emotibit
  


const activityEventsChannels: Array<ActivityEvents> = [
  "brainflow:launch",
  "brainflow:destroy",
  "activity:viewUser",
  "brainflow:launchError",
  "brainflow:connectingEmotibit",
  "brainflow:connectedEmotibit",
  "brainflow:disconnectEmotibit",
]

// Custom APIs for renderer
const api = {
  send: (channel: ActivityEvents, ...args): void => {
    if (!activityEventsChannels.includes(channel)) {
      throw new Error(`Invalid send channel: ${channel}`)
    }

    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: ActivityEvents, callback): (() => Electron.IpcRenderer) => {
    if (!activityEventsChannels.includes(channel)) {
      throw new Error(`Invalid receive channel: ${channel}`)
    }

    const subscription = (event, ...args): (() => void) => callback(event, ...args)

    ipcRenderer.on(channel, subscription)

    return () => ipcRenderer.removeListener(channel, subscription)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
