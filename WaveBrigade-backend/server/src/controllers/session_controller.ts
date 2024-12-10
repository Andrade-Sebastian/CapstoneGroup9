import {currentSessions} from "../server.ts";
import { v4 as uuid} from "npm:uuid";
import SessionManager from "../sessions_singleton.ts";
import {client} from "../main.ts";
let foundDevicesOnNetwork: IDevice[] = [];


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
    description: string;
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
export type TSessionState = Omit<ISession, "credentials">

// =====
const sessionManager = SessionManager.getInstance()

function generateSessionId(): string {
    let isUnique = false;
    let sessionId: string = uuid().split("-")[0];

    return sessionId;
}

// function getExperiment(experimentId: string): IExperiment {
//     // Query database for an experimentId.
//     if (experimentId === "17") {
//         return {
//             experimentTemplate: undefined,
//             id: "17",
//             labTemplate: {
//                 id: "20",
//                 name: "Gallery Lab"
//             }
//         }
//     } else {
//         throw new Error("Experiment is not found within the database.").name = "EXPERIMENT_NOT_FOUND";
//     }
// }

function getSessionState(sessionId: string): TSessionState {

    console.log("PASSED SESSION ID " + sessionId)
    const session = sessionManager.getSession(sessionId)
    console.log("DUMB SESSION " + JSON.stringify(session))

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

function requestDevices(sessionId) {
    return new Promise((resolve, reject) => {
      const message = { sessionId: sessionId };
      let foundDevicesOnNetwork = [];  // Store the found devices
  
      // Call the gRPC method
      client.foundDevices({ sessionId: sessionId }, (error, devices) => {
        if (error) {
          // If there's an error, reject the Promise with the error
          console.error("Error", error);
          reject(error);
          return;
        }
  
        // Iterate over the devices and push to the array
        devices.allDevices.forEach((device) => {
          console.log("DEVICE", device);
          foundDevicesOnNetwork.push({
            serialNumber: device.serial,
            ipAddress: device.ip,
          });
        });
  
        // Resolve the Promise with the found devices data
        resolve(foundDevicesOnNetwork);
      });
    });
  }

function createSession(initializationData: ISessionInitialization, socketId: string) {
    console.log("Entered: createSession routine");
    const generatedSessionId = generateSessionId();
    let deviceList = []
    return new Promise<ISession>((resolve, reject) => {
        requestDevices(generatedSessionId)
            .then(devices => {
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
                    experiment: "dsdadf", //hardcoded
                    },
                    credentials: {
                        passwordEnabled: initializationData.credentials.passwordEnabled,
                        password: initializationData.credentials.password
                    },
                    discoveredDevices: devices
                }
                console.log(session.discoveredDevices);
                sessionManager.addSession(session.sessionId, session);
                resolve(session);
            })
            .catch(error =>{
                console.error("Error creating the session: ", error);
                reject(error);
            })
    })
    //return getSessionState(session.sessionId)
}

//go through singleton session, find sessionid user requested, if it finds, add it to the session's users, return sessionState
function joinSession(requestedSessionId: string, socketID: string){
    console.log("Entered: joinSession routine");
    console.log("requestedSessionId", requestedSessionId)

     if (sessionManager.getSession(requestedSessionId))//if the requested session exists
     {
        console.log("joined session -- session_controller.ts");
        return getSessionState(requestedSessionId)
     }
     else{
        throw new Error("Could not join session")
     }
        //push the user to the users array 

    }




// function addDiscoveredDevice(sessionId: string, discoveredDevice: IDevice) {
//     currentSessions[sessionId].discoveredDevices.push(discoveredDevice);
// }

export {
    createSession,
    joinSession,
    // addDiscoveredDevice,
    getSessionState
}