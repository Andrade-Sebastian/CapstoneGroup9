
import { create } from 'zustand'
import {ISessionState} from "../../typings.ts"
import {IUser} from "../../typings.ts"
import {IDevice} from "../../typings.ts"
import {ISession} from "../../typings.ts"

userId: string;
socketId: string;
nickname: string | null;
associatedDevice: IDevice | null;

export interface IJoinerState extends Omit<IUser, "credentials" | "isInitialized">{
    userId: string | null;
    socketId: string | null;
    nickname: string | null;
    associatedDevice: IDevice | null;
}

interface JoinerActions {
    pairDevice: (device: IDevice) => void;
    updateJoinerSocketId: (JoinerSocketId: string) => void
    discoveredDevices: (discoveredDevices: Array<IDevice>) => void
}





const useJoinerStore = create<IJoinerState & JoinerActions>()((set) => ({
    userId: null,
    socketId: null,
    nickname: null,
    associatedDevice: null,
    
    pairDevice: (device: IDevice) => set((state) => ({ pairedDevice: device })),
    addUser: (user: IUser) => set((state) => { users: [...state.users, user]}),
    
    
    //Example
    // bears: 0,
    // increase: (by) => set((state) => ({ bears: state.bears + by })),
}))

