
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

interface IGallery{
    id: number;
    src:string;
    file: File
    title?: string;
    caption?: string;
    uploadedAt?: Date; 
  }

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
    experimentType: number;
    experimentTypeString: string;
    experimentPath: string;
    galleryPhotos: IGallery[];
    users: Array<IUser>;
    sessionId: string;
    secret: string | undefined;
    userRole: string;
    wasKicked: boolean;
    messages: [];

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
    setExperimentType: (experimentType: number) => void;
    setUsers: (users: Array<IUser>) => void;
    setSessionId: (id: string) => void;
    setMessages:(messages: []) => void;
    addMessage: (messages: []) => void;
    setSecret: (secret: string) => void;
    setExperimentTypeString: (experimentTypeString: string) => void;
    setExperimentPath: (experimentPath: string) => void;
    addPhoto: (photo: IGallery) => void;
    setUserRole: (role: string) => void;
    setWasKicked: (wasKicked: boolean) => void;
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
        experimentType: 0,
        experimentTypeString: '',
        experimentPath: '',
        galleryPhotos: [],
        users: [],
        sessionId: '',
        secret: undefined,
        userRole: '',
        wasKicked: false,
        messages: [],
        
        

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
        setExperimentType: (type: number): void => set(() =>({experimentType: type})),
        setMessages: (newMessages) => set({messages: newMessages}),
        addMessage: (message) => set((state) => ({ messages: [...state.messages, message]})),
        setSecret: (secret: string): void => set(() => ({secret})),
        setUsers: (users: Array<IUser>): void => set(() => ({users: users})),
        setSessionId: (id: string): void => set(() => ({sessionId: id})),
        setExperimentTypeString: (experimentTypeString: string): void => set(() => ({experimentTypeString: experimentTypeString})),
        setExperimentPath: (experimentPath: string): void => set(() => ({experimentPath: experimentPath})),
        addPhoto: (photo): void => set((state) => ({galleryPhotos: [...state.galleryPhotos, photo]})),
        setUserRole: (role: string): void => set(() => ({userRole: role})),
        setWasKicked: (wasKicked: boolean): void => set(() => ({wasKicked: wasKicked})),
        
}));