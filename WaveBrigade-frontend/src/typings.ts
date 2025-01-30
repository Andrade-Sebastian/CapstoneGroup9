
export interface IDevice {
    serialNumber: string;
    ipAddress: string;
}
export interface IUser {
    userId: string;
    socketId: string;
    nickname: string | null;
    associatedDevice: IDevice | null;
}
export interface ILab {
    id: string;
    name: string;
    iconPath?: string;
}
export interface IExperiment {
    id: string;
    description: string;
    labTemplate: ILab;
    experimentTemplate: unknown;
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
export interface ISession {
    sessionId: string;
    sessionName: string;
    hostSocketId: string;
    users: Array<IUser>;
    isInitialized: boolean;
    configuration: ISessionConfiguration;
    credentials: ISessionCredentials;
    discoveredDevices: Array<IDevice>;
}

export interface ISessionState extends Omit<ISession, "credentials">{
    pairedDevice: IDevice | null;
}

export interface ISessionInitialization {
    sessionName: string;
    selectedExperimentId: string;
    credentials: ISessionCredentials;
    allowSpectators: boolean;
}

