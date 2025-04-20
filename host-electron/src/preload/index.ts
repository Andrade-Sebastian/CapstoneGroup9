import { contextBridge, ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type TYPE_BRAINFLOW_LAUNCH = "brainflow:launch" 
export const BRAINFLOW_LAUNCH: TYPE_BRAINFLOW_LAUNCH = "brainflow:launch"
export type BRAINFLOW_STATUS = "brainflow:status"
export type BRAINFLOW_DESTROY = "brainflow:destroy"
export type BRAINFLOW_DESTROY_USER = "brainflow:destroy-user"


//event names for renderer
export type ActivityEvents =
  //each one of these is called a "channel"
  "session:request-data" |
  "session:send-to-window" |
  "session:sync" |
  TYPE_BRAINFLOW_LAUNCH | //launches brainflow
  BRAINFLOW_STATUS | //status
  BRAINFLOW_DESTROY | //closes brainflow
  BRAINFLOW_DESTROY_USER | //user destruction
  "brainflow:launched"|
  "brainflow:launch"|
  "activity:viewUser"| //host selects student to view
  "brainflow:launchError"| 
  "brainflow:connectingEmotibit"|
  "brainflow:connectedEmotibit"|
  "brainflow:disconnectEmotibit"|  //disconnect emotibit
  "activity:closeUserWindow"|
  "activity:closeAllWindows"| //close all active user windows
  


const activityEventsChannels: Array<ActivityEvents> = [
  "session:request-data",
  "session:send-to-window",
  "session:sync",
  "brainflow:launched",
  "brainflow:launch",
  "brainflow:status",
  "brainflow:destroy",
  "brainflow:destroy-user",
  "activity:viewUser",
  "brainflow:launchError",
  "brainflow:connectingEmotibit",
  "brainflow:connectedEmotibit",
  "brainflow:disconnectEmotibit",
  "activity:closeUserWindow",
  "activity:closeAllWindows",
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
