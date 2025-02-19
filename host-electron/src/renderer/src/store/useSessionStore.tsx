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
    users: IUser[];
    roomCode: string;
    experimentId: string;

    setSessionId: (id: string) => void;
    setUsers: (users: IUser[]) => void;
    addUser: (user: IUser) => void;
    removeUser: (userId: string) => void;
    setRoomCode: (code: string) => void;
    setExperimentId: (id: string) => void;
}

export const useSessionStore = create<SessionState>()(

        (set) => ({
            sessionId: '',
            users: [],
            roomCode: '',
            experimentId: '',

            setSessionId: (id: string): void => set(() => ({ sessionId: id})),
            setUsers: (users: IUser[]): void => set(() => ({ users})),
            addUser: (user: IUser): void => set((state) => ({ users: [...state.users, user] })),
            removeUser: (userId: string): void =>
                set((state) => ({
                    users: state.users.filter((user) => user.userId !== userId),
                })),
            setRoomCode: (code: string): void => set(() => ({ roomCode: code})),
            setExperimentId: (id: string): void => set(() => ({experimentId: id})),
        }),
);