//keeps track of which sessions a socketID is connected to for easier removal when a user leaves a room
export const socketSessionMap: { [key: string]: string } = {};

export function addSocketToSession(socketID: string, sessionID: string) {
    console.log("{addSocketToSession): socketID is ", socketID);
    socketSessionMap[socketID] = sessionID;
}

export function removeSocket(socketID: string) {
    console.log("(removeSocket): session is " + JSON.stringify(socketSessionMap))

    delete socketSessionMap[socketID];
}

export function getSessionBySocket(socketID: string): string | undefined {
    console.log("(getSessionBySocket): session is " + JSON.stringify(socketSessionMap[socketID]))
    return socketSessionMap[socketID];
}

export default socketSessionMap;
