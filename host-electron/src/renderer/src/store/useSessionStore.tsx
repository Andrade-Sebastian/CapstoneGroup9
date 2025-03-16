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

interface IDevice {
  deviceId: string;
  serialNumber: string;
  ipAddress: string;
  deviceSocketId: string;
}
interface SessionState{
    sessionId: string;
    hostName: string;
    users: IUser[];
    roomCode: string;
    experimentId: number;
    experimentTitle: string;
    experimentDesc: string;
    experimentType: number;
    photoLabImageSource: string | null;
    videoLabSource: string | null;
    videoURL: string | null;
    videoID: string | null;
    devices: IDevice[];
    experimentTypeString: string;


    setSessionId: (id: string) => void;
    setHostName: (name: string) => void;
    setUsers: (users: IUser[]) => void;
    addUser: (user: IUser) => void;
    removeUser: (userId: string) => void;
    setRoomCode: (code: string) => void;
    setExperimentId: (id: number) => void;
    setExperimentTitle: (experimentTitle: string) => void;
    setExperimentDesc: (experimentDesc: string) => void;
    setExperimentType: (experimentType: number) => void;
    setPhotoLabImageSource: (imageSource: string) => void;
    setVideoLabSource: (videoSource: string) => void;
    setVideoURL: (videoURL: string) => void;
    setVideoID: (videoID: string) => void;
    addDevice: (device: IDevice) => void;
    removeDevice: (deviceId: string)=> void;
    setExperimentTypeString: (experimentTypeString: string) => void;
}

export const useSessionStore = create<SessionState>()(

        (set) => ({
            sessionId: '',
            hostName: '',
            users: [],
            roomCode: '',
            experimentId: 0,
            experimentTitle: '',
            experimentDesc: '',
            photoLabImageSource: '',
            videoLabSource: '',
            videoURL: '',
            videoID: '',
            devices: [],
            experimentType: 0,
            experimentTypeString: '',
            

            setSessionId: (id: string): void => set(() => ({ sessionId: id})),
            setHostName: (name: string): void => set(() => ({ hostName: name})),
            addUser: (newUser: IUser): void => set((state) => ({
              users: [...(Array.isArray(state.users) ? state.users : []), newUser],
            })),
            removeUser: (userId: string): void => set((state: SessionState) => ({users: state.users.filter((user: IUser) => user.userId !== userId),})),
            setUsers: (users: IUser[] | undefined): void => set((state) => ({
              users: Array.isArray(users) ? [...users] : [...state.users],
            })),
            setRoomCode: (code: string): void => set(() => ({ roomCode: code})),
            setExperimentId: (id: number): void => set(() => ({experimentId: id})),
            setExperimentTitle: (title: string): void => set(() => ({ experimentTitle: title})),
            setExperimentDesc: (desc: string): void => set(() => ({ experimentDesc: desc})),
            setPhotoLabImageSource: (imageSource: string | null): void => set(() => ({ photoLabImageSource: imageSource })),
            setVideoLabSource: (videoSource: string | null): void => set(() => ({ videoLabSource: videoSource })),
            setVideoURL: (videoURL: string): void => set(() => ({videoURL: videoURL})),
            setVideoID: (videoID: string): void => set(() => ({videoID: videoID})),
            addDevice: (device: IDevice): void => set((state) => ({
              devices: [...state.devices, device], // ✅ Ensures new devices are added safely
            })),
            removeDevice: (device: any): void => set((state) => ({devices: state.devices.filter((d) => d.deviceId !== device.deviceId)})),
            setExperimentType: (experimentType: number): void => set(() => ({ experimentType: experimentType})),
            setExperimentTypeString: (experimentTypeString: string): void => set(() => ({experimentTypeString: experimentTypeString}))
        }));