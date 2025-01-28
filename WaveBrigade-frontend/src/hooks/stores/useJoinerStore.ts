
import { create } from 'zustand'
import {IUser} from "../../typings.ts"
import {IDevice} from "../../typings.ts"



export interface IJoinerState {
    user: IUser | null
    sessions:{
        users: Array<IUser>;
        sessionId: string | null;
        hostSocketId: string | null;
    }
}

interface JoinerActions {
    pairDevice: (newDevice: IDevice) => void;
    updateUser: (newUser: IUser) => void;
    addSessionInfo: (newUsers: Array<IUser>, newSessionId: string, newHostSocketId: string) => void;
}



export const useJoinerStore = create<IJoinerState & JoinerActions>()((set) => ({
    user: null,
    sessions: {
        users: [],
        sessionId: null,
        hostSocketId: null,
    },
    
    pairDevice: (newDevice: IDevice) => set((state) => (state.user ? {user: {...state.user, associatedDevice: newDevice}} : {user: null  } )),
    addSessionInfo: (newUsers: Array<IUser>, newSessionId: string, newHostSocketId: string) => set(() => ({sessions: {users: newUsers, sessionId: newSessionId, hostSocketId: newHostSocketId}})),
    updateUser: (newUser: IUser) => set(() => ({user: newUser})),
}))

    
    
    //Example
    // bears: 0,
    // increase: (by) => set((state) => ({ bears: state.bears + by })),


