
// import { create } from 'zustand'
import {IUser} from "../../typings.ts"
// import {IDevice} from "../../typings.ts"



// export interface IJoinerState {
//     user: IUser | null
//     sessions:{
//         users: Array<IUser>;
//         sessionId: string | null;
//         hostSocketId: string | null;
//     }
// }

// interface JoinerActions {
//     pairDevice: (newDevice: IDevice) => void;
//     updateUser: (newUser: IUser) => void;
//     addSessionInfo: (newUsers: Array<IUser>, newSessionId: string, newHostSocketId: string) => void;
// }



// export const useJoinerStore = create<IJoinerState & JoinerActions>()((set) => ({
//     user: null,
//     sessions: {
//         users: [],
//         sessionId: null,
//         hostSocketId: null,
//     },
    
//     pairDevice: (newDevice: IDevice) => set((state) => (state.user ? {user: {...state.user, associatedDevice: newDevice}} : {user: null  } )),
//     addSessionInfo: (newUsers: Array<IUser>, newSessionId: string, newHostSocketId: string) => set(() => ({sessions: {users: newUsers, sessionId: newSessionId, hostSocketId: newHostSocketId}})),
//     updateUser: (newUser: IUser) => set(() => ({user: newUser})),
// }))

import { create } from 'zustand';

interface JoinerState{
    joinerId: string;
    nickname: string | null;
    roomCode: string;
    socketId: string;
    isConnected: boolean;
    serial: string;
    deviceId: string;
    experimentId: number;
    experimentTitle: string;
    experimentDesc: string;
    users: Array<IUser>;
    sessionId: string;
    secret: string | undefined;

    setJoinerId: (id: string) => void;
    setNickname: (nickname: string | null) => void;
    setRoomCode: (roomCode: string) => void;
    setUserSocketId: (socket: string) => void;
    setIsConnected: (isConnected: boolean) => void;
    setSerial: (serial: string) => void;
    setDeviceId: (deviceid: string) => void;
    setExperimentId: (id: number) => void;
    setExperimentTitle: (experimentTitle: string) => void;
    setExperimentDesc: (experimentDesc: string) => void;
    setUsers: (users: Array<IUser>) => void;
    setSessionId: (id: string) => void;
    setSecret: (secret: string) => void;
}

export const useJoinerStore = create<JoinerState>()(
    (set) => ({
        joinerId: '',
        nickname: null,
        roomCode: '',
        socketId: '',
        isConnected: false,
        serial: '',
        deviceId: '',
        experimentId: 0,
        experimentTitle: '',
        experimentDesc: '',
        users: [],
        sessionId: '',
        secret: undefined,

        setJoinerId: (id:string): void => set(() => ({ joinerId: id})),
        setNickname: (nickname: string | null): void => set(() => ({nickname})),
        setRoomCode: (roomCode: string): void => set(() => ({ roomCode})),
        setUserSocketId: (socketId: string): void => set(() => ({ socketId: socketId})),
        setIsConnected: (isConnected: boolean): void => set(() => ({ isConnected})),
        setSerial: (serial: string): void => set(() => ({serial})),
        setDeviceId: (deviceid: string): void => set(() => ({deviceId: deviceid})),
        setExperimentId: (id: number): void => set(() => ({experimentId: id})),
        setExperimentTitle: (title: string): void => set(() => ({ experimentTitle: title})),
        setExperimentDesc: (desc: string): void => set(() => ({ experimentDesc: desc})),
        setSecret: (secret: string): void => set(() => ({secret})),
        setUsers: (users: Array<IUser>): void => set(() => ({users: users})),
        setSessionId: (id: string): void => set(() => ({sessionId: id}))
}));