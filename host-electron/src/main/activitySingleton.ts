import { BrowserWindow } from 'electron'
import { ChildProcess } from 'child_process'

export interface IActivityInstance {
  browserWindow: BrowserWindow | undefined
  brainflowProcess: ChildProcess
  ipAddress: string
  serialNumber: string
  backendIp: string
  sessionId: string
  userId: string
  frontEndSocketId: string
}

export default class ActivitySingleton {
  private static _instance: ActivitySingleton
  activityInstances: Record<string, IActivityInstance> = {}

  private constructor() {
    this.activityInstances = {}
  }

  public static getInstance(): ActivitySingleton {
    if (this._instance) {
      //if the instance exists
      return this._instance
    }

    //otherwise create a new singleton and return it
    this._instance = new ActivitySingleton()
    return this._instance
  }
}
