
import { create } from 'zustand'
import {ISessionState} from "../../typings.ts"
import {IUser} from "../../typings.ts"
import {IDevice} from "../../typings.ts"
import {ISession} from "../../typings.ts"

sessionId: null;
sessionName: string;
hostSocketId: string;

export interface IHostState extends Omit<ISession, "credentials" | "isInitialized">{
    pairedDevice: IDevice | null;
    sessionId: null | string;
    sessionName: null | string;
    hostSocketId: null | string;
    configuration: null | ISessionConfiguration;
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





const useHostStore = create<HostState & HostActions>()((set) => ({
    pairedDevice: null,
    sessionId: null,
    sessionName: null,
    hostSocketId: null,
    configuration: null,
    users: null,
    
    pairDevice: (device: IDevice) => set((state) => ({ pairedDevice: device })),
    addUser: (user: IUser) => set((state) => { users: [...state.users, user]}),
    
    
    //Example
    bears: 0,
    increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

