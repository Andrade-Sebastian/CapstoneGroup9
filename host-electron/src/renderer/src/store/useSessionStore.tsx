import { create } from 'zustand'

interface IUser {
  userId: string
  socketId: string
  nickname: string | null
  associatedDevice: {
    serialNumber: string
    ipAddress: string
  } | null
}

interface SessionState{
    sessionId: string;
    hostName: string;
    users: IUser[];
    roomCode: string;
    experimentId: string;
    experimentTitle: string;
    experimentDesc: string;
    experimentType: number;
    photoLabImageSource: string | null;
    devices: any[];


    setSessionId: (id: string) => void;
    setHostName: (name: string) => void;
    setUsers: (users: IUser[]) => void;
    addUser: (user: IUser) => void;
    removeUser: (userId: string) => void;
    setRoomCode: (code: string) => void;
    setExperimentId: (id: string) => void;
    setExperimentTitle: (experimentTitle: string) => void;
    setExperimentDesc: (experimentDesc: string) => void;
    setExperimentType: (experimentType: number) => void;
    addDevice: (device: any) => void;
    removeDevice: (device: any)=> void;
}

export const useSessionStore = create<SessionState>()(

        (set) => ({
            sessionId: '',
            hostName: '',
            users: [],
            roomCode: '',
            experimentId: '',
            experimentTitle: '',
            experimentDesc: '',
            photoLabImageSource: '',
            devices: [],
            experimentType: 0,

            setSessionId: (id: string): void => set(() => ({ sessionId: id})),
            setHostName: (name: string): void => set(() => ({ hostName: name})),
            addUser: (user: IUser): void => set((state: SessionState) => ({ users: [...state.users, user] })),
            removeUser: (userId: string): void => set((state: SessionState) => ({users: state.users.filter((user: IUser) => user.userId !== userId),})),
            setUsers: (users: IUser[]): void => set(() => ({ users })),
            setRoomCode: (code: string): void => set(() => ({ roomCode: code})),
            setExperimentId: (id: string): void => set(() => ({experimentId: id})),
            setExperimentTitle: (title: string): void => set(() => ({ experimentTitle: title})),
            setExperimentDesc: (desc: string): void => set(() => ({ experimentDesc: desc})),
            setPhotoLabImageSource: (imageSource: string | null): void => set(() => ({ photoLabImageSource: imageSource })),
            addDevice: (device: any): void => set((state) => ({devices: [...state.devices, device]})),
            removeDevice: (device: any): void => set((state) => ({devices: state.devices.filter((d) => d.deviceId !== device.deviceId)})),
            setExperimentType: (experimentType: number): void => set(() => ({ experimentType: experimentType}))
        }));