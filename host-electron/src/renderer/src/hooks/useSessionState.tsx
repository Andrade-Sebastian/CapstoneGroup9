import {create} from "zustand";


export interface IUser {
    userId: string; //serial
    socketId: string | null; //Frontend socket ID 
    nickname: string | null;
    associatedDevice: IDevice | null;
}

export interface IDevice {
    serialNumber: string;
    ipAddress: string;
    socketID: string | null;
    isConnected: boolean;
}

export interface IExperiment {
    id: string;
    description: string;
    labTemplate: ILab;
    experimentTemplate: unknown;
}

export interface ILab {
    id: string;
    name: string;
    iconPath?: string;
}

export interface ISessionConfiguration {
    allowSpectators: boolean;
    maskEnabled: boolean;
    focusedUser: IUser | null;
    experiment: IExperiment;
}

export interface ISessionCredentials {
    passwordEnabled: boolean;
    password: string;
}

export interface IAppState {
    sessionID: string | undefined,
    roomCode: string | undefined,
    experimentID: IExperiment | undefined,

    // backendSessionID: string,
    // roomCode: string,
    // hostSocketId: string,
    users: IUser[];
    // isInitialized: boolean,
    // configuration: ISessionConfiguration,
    // credentials: ISessionCredentials,
    discoveredDevices: IDevice[];
    isSpectatorAllowed: boolean;	
}


interface Actions{
    //add actions
    addUser: (user: IUser) => void,

    //remove a user
    removeUser: (userID: number) => void,

    //create a session
    createSession: (sessionID: number, roomCode: string, experimentID: number) => void,

    //remove a session if session is ended
    removeSession: (sessionID: number) => void,

    // add device
    addDevice: (device: IDevice) => void,

    // remove device
    removeDevice: (serialNumber: string) => void,

    addExperiment: (experiment: IExperiment) => void

}


const useSessionStore = create<IAppState & Actions>((set) => ({
    //Returning a new array containing the passed in user 
    sessionID: undefined,
    roomCode: undefined,
    experiment: null,
    users: [],
    discoveredDevices: [],
    isSpectatorAllowed: false,

    addUser: (user: IUser) => set((state: IAppState) => ({users: [...state.users, user]})),
    removeUser: (userID: number) => set((state: IAppState) => ({users: state.users.filter((user) => user.userId == userID)})),

    createSession: (sessionID: number, experimentID: number) => set(() => ({
        sessionID: sessionID,
        experimentID: experimentID,
        users: [],
    })),

    removeSession: () => set(() => (
    {
        sessionID: undefined,
        experimentID: undefined, 
        users: []
    })),


    addDevice: (device: IDevice) => set((state: IAppState) => ({discoveredDevices: [...state.discoveredDevices, device]})),
    removeDevice: (serialNumber: string) => set((state: IAppState) => ({discoveredDevices: state.discoveredDevices.filter((device) => device.serialNumber == serialNumber)})),

    addExperiment: (experiment: IExperiment) => set((state: IExperiment) => ({
        id: experiment.id,
        description: experiment.description,
        labTemplate: experiment.labTemplate,
        experimentTemplate: experiment.experimentTemplate,

    }))
}));
export default useSessionStore