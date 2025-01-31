import {currentSessions} from "../server.ts";
import { v4 as uuid} from "npm:uuid";
import SessionManager from "../sessions_singleton.ts";
import {client} from "../main.ts";
import {createSessionInDatabase} from "./database.ts";
let foundDevicesOnNetwork: IDevice[] = [];


export interface IDevice {
    serialNumber: string;
    ipAddress: string;
    socketID: string;
}
export interface IUser {
    userId: string | null;
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
    roomCode: string;
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

    //console.log("(session_controller.ts): at getSessionState()")
    // console.log("PASSED SESSION ID " + sessionId)
    const session = sessionManager.getSession(sessionId)
    //console.log("SESSION" + JSON.stringify(session))
    // console.log("DUMB SESSION " + JSON.stringify(session))

    if (!session) throw new Error("Session is not found.").name = "SESSION_NOT_FOUND"

    return {
        sessionId: session.sessionId,
        roomCode: session.roomCode,
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
    roomCode: string;
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
                const sessionInfo = {
                    sessionId: generatedSessionId,
                    experimentId: initializationData.selectedExperimentId,
                    roomCode: initializationData.roomCode,
                    hostSocketId: socketId,
                    users: [],
                    isInitialized: false,
                    configuration: {
                        allowSpectators: initializationData.allowSpectators,
                        maskEnabled: false,
                        focusedUser: null,
                        experiment: {
                            id: "17",
                            description: "This is a test experiment",
                            labTemplate: {
                                id: "20",
                                name: "Gallery Lab"
                            },
                            experimentTemplate: undefined
                        }
                    },  
                    
                }
                //add to DB
                console.log("Adding Session to Database")
                createSessionInDatabase(sessionInfo)
                console.log("Session added to Database")
                //console.log(session.discoveredDevices);
                //console.log("Adding session")
                //sessionManager.addSession(session.sessionId, session);
                //resolve(session);
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
        console.log("joined session -- session_controller.ts (joinsession)");
        console.log("Added Names")

        return getSessionState(requestedSessionId)
     }
     else{
        throw new Error("Could not join session")
     }
        //push the user to the users array 

    }
// userId: string;
//     socketId: string;
//     nickname: string | null;
//     associatedDevice: IDevice | null;


function joinRoom(requestedSessionId: string, socketID: string, nickname: string, associatedDevice: IDevice | null){
    console.log("(session_controller.ts): at joinRoom()");
    console.log("requestedSessionId:", requestedSessionId);
    console.log("socketId:", socketID);
    console.log("nickname:", nickname);
    console.log("associatedDevice:", associatedDevice);


    if (sessionManager.getSession(requestedSessionId))//if the requested session exists
    {
        const newUser: IUser = {
            userId: "17",
            socketId: socketID,
            nickname: nickname,
            associatedDevice: associatedDevice
        }
        
        console.log("joined session -- session_controller.ts (joinRoom())");
        console.log("Added Names")
        


        const sessionState = getSessionState(requestedSessionId);
        //console.log("sessionState before adding user: " + JSON.stringify(sessionState))
        
        sessionState.users.push(newUser)

        //for debugging
        const sessionStateAfter = getSessionState(requestedSessionId);
        //console.log("sessionState AFTER adding user: " + JSON.stringify(sessionStateAfter))


        // sessionState.users = sessionState.users.concat(
        //     {
        //         userId: "1",
        //         socketId: socketID,
        //         nickname: nickname,
        //         associatedDevice: associatedDevice
        //     }
        // );
        return getSessionState(requestedSessionId)
    }
    else{
        throw new Error(`Could not join session ${requestedSessionId}`);

    }
    //push the user to the users array 

}

//works 
function removeUserBySocketID(users: Array<IUser>, socketID: string) {
    const userToRemove = users.find(user => user.socketId === socketID);

    if (userToRemove) {
        console.log("Removing user:", userToRemove);
    } else {
        console.log(`User with socketID ${socketID} not found...`);
    }

    //returns a new array with everyone minus the deleted user
    return users.filter(user => user.socketId !== socketID);
}

//works
function leaveRoom(requestedSessionId: string, socketID: string) {
    console.log("(session_controller.ts): at leaveRoom()");
    console.log("requestedSessionId:", requestedSessionId);
    console.log("socketId:", socketID);


    if (sessionManager.getSession(requestedSessionId)) {
        console.log(`session ${requestedSessionId} found`)

        
        // Get the users
        const session = sessionManager.getSession(requestedSessionId);
        if (session) {
            console.log("Users array before removing user:", session.users);

            // Remove the user with the given socket ID
            session.users = removeUserBySocketID(session.users, socketID);

            console.log("Users array AFTER removing user:", session.users);
        }

    } else {
        throw new Error(
            `Could not find session ${requestedSessionId}. Was the backend changed at all? That deletes all active sessions.`
        );
    }
}



// userId: string;
//     socketId: string;
//     nickname: string | null;
//     associatedDevice: IDevice | null;


// function addDiscoveredDevice(sessionId: string, discoveredDevice: IDevice) {
//     currentSessions[sessionId].discoveredDevices.push(discoveredDevice);
// }

export {
    createSession,
    joinSession,
    joinRoom,
    leaveRoom,
    // addDiscoveredDevice,
    getSessionState
}