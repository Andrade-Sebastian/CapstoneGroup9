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

export type TSessionState = Omit<ISession, "credentials">;


class SessionManager {
    private static instance: SessionManager;
    private currentSessions: { [key: string]: ISession } = {};

    private constructor() {} 


    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public addSession(sessionId: string, session: ISession): void {
        this.currentSessions[sessionId] = session;
    }


    public getSession(sessionId: string): ISession | undefined {
        return this.currentSessions[sessionId];
        
    }

    public removeSession(sessionId: string): void {
        delete this.currentSessions[sessionId];
    }

    public listSessions(): { [key: string]: ISession } {
        return this.currentSessions;
    }
}

export default SessionManager;
