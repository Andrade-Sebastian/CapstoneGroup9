
import { create } from 'zustand'
import {ISessionCredentials} from "../../typings.ts"
import {ISessionConfiguration} from "../../typings.ts"
import {IUser} from "../../typings.ts"
import {IDevice} from "../../typings.ts"
import {ISession} from "../../typings.ts"

export interface IHostState extends Omit<ISession, "credentials" | "isInitialized">{
    pairedDevice: IDevice | null;
    sessionId: string | null;
    sessionName: string | null;
    hostSocketId: string | null;
    configuration: ISessionConfiguration | null;
    users: Array<IUser>;
}

interface HostActions {
    pairDevice: (device: IDevice) => void;
    addUser: (user: IUser) => void;
    discoverDevice: (device: IDevice) => void
    updateSessionId: (sessionId: string) => void
    updateSessionName: (sessionName: string) => void 
    updateHostSocketId: (hostSocketId: string) => void
    updateUsers: (users: Array<IUser>) => void
    updateConfiguration: (configuration: ISessionCredentials) => void
    discoveredDevices: (discoveredDevices: Array<IDevice>) => void
}





export const useHostStore = create<IHostState & HostActions>()((set) => ({
    pairedDevice: null,
    sessionId: null,
    sessionName: null,
    hostSocketId: null,
    configuration: null,
    users: null,
    
    pairDevice: (device: IDevice) => set((state) => ({ pairedDevice: device })),
    addUser: (user: IUser) => set((state) => { users: [...state.users, user]}),
    
    
}))

