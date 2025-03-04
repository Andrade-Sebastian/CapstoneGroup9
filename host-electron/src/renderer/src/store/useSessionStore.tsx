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
    photoLabImageSource: string | null;
    experimentType: number;

    setSessionId: (id: string) => void;
    setHostName: (name: string) => void;
    setUsers: (users: IUser[]) => void;
    addUser: (user: IUser) => void;
    removeUser: (userId: string) => void;
    setRoomCode: (code: string) => void;
    setExperimentId: (id: string) => void;
    setExperimentTitle: (experimentTitle: string) => void;
    setExperimentDesc: (experimentDesc: string) => void;
    setPhotoLabImageSource: (imageSource: string) => void;
    setExperimentType: (experimentType: number) => void;
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
            experimentType: 0,

            setSessionId: (id: string): void => set(() => ({ sessionId: id})),
            setHostName: (name: string): void => set(() => ({ hostName: name})),
            setUsers: (users: IUser[]): void => set(() => ({ users})),
            addUser: (user: IUser): void => set((state) => ({ users: [...state.users, user] })),
            removeUser: (userId: string): void =>
                set((state) => ({
                    users: state.users.filter((user) => user.userId !== userId),
                })),
            setRoomCode: (code: string): void => set(() => ({ roomCode: code})),
            setExperimentId: (id: string): void => set(() => ({experimentId: id})),
            setExperimentTitle: (title: string): void => set(() => ({ experimentTitle: title})),
            setExperimentDesc: (desc: string): void => set(() => ({ experimentDesc: desc})),
            setPhotoLabImageSource: (imageSource: string | null): void => set(() => ({ photoLabImageSource: imageSource })),
            setExperimentType: (experimentType: number): void => set(() => ({experimentType: experimentType}))
        })
);