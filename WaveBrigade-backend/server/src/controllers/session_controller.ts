import {currentSessions} from "../server.ts";
import { v4 as uuid} from "npm:uuid";

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
interface ILab {
    id: string;
    name: string;
    iconPath?: string;
}
interface IExperiment {
    id: string;
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
export type TSessionState = Omit<ISession, "credentials">

// =====

function generateSessionId(): string {
    let isUnique = false;
    let sessionId: string = uuid().split("-")[0];

    return sessionId;
}

function getExperiment(experimentId: string): IExperiment {
    // Query database for an experimentId.
    if (experimentId === "17") {
        return {
            experimentTemplate: undefined,
            id: "17",
            labTemplate: {
                id: "20",
                name: "Gallery Lab"
            }
        }
    } else {
        throw new Error("Experiment is not found within the database.").name = "EXPERIMENT_NOT_FOUND";
    }
}

function getSessionState(sessionId: string): TSessionState {

    const session = currentSessions[sessionId];

    if (!session) throw new Error("Session is not found.").name = "SESSION_NOT_FOUND"

    return {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        hostSocketId: session.hostSocketId,
        configuration: session.configuration,
        discoveredDevices: session.discoveredDevices,
        isInitialized: session.isInitialized,
        users: session.users
    }
}

interface ISessionInitialization {
    sessionName: string;
    selectedExperimentId: string;
    credentials: ISessionCredentials;
    allowSpectators: boolean;
}
function createSession(initializationData: ISessionInitialization, socketId: string) {
    console.log("Entered: createSession routine")
    const generatedSessionId = generateSessionId();
    const session: ISession = {
        sessionId: generatedSessionId,
        sessionName: initializationData.sessionName,
        hostSocketId: socketId,
        users: [],
        isInitialized: false,
        configuration: {
          allowSpectators: false,
          maskEnabled: false,
          focusedUser: null,
          experiment: getExperiment(initializationData.selectedExperimentId),
        },
        credentials: {
            passwordEnabled: initializationData.credentials.passwordEnabled,
            password: initializationData.credentials.password
        },
        discoveredDevices: []
    }

    currentSessions[session.sessionId] = session;

    return getSessionState(generatedSessionId)
}

function addDiscoveredDevice(sessionId: string, discoveredDevice: IDevice) {
    currentSessions[sessionId].discoveredDevices.push(discoveredDevice);
}

export {
    createSession,
    addDiscoveredDevice,
    getSessionState
}