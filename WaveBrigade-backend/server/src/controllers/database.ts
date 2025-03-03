import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { IDevice, ISessionDatabaseInfo, IUser, ISessionCredentials } from "./session_controller.ts";


export const dbClient = new Client({
  user: "postgres",
  database: "WB_Database",
  password: "postgres",
  hostname: "wb-backend-database",
  port: 5432,
});

interface ISessionInitialization {
	sessionName: string;
	roomCode: string;
	selectedExperimentId: string;
	credentials: ISessionCredentials;
	allowSpectators: boolean;
}

interface ISessionCreationParams{
	hostSocketID: string,
	isPasswordProtected: boolean | null,
	password: string | null,
	isSpectatorsAllowed: boolean | null,
}

export interface IVideoLabDatabaseInfo {
	experimentID: number,
	path: string, //Image path
}
export interface IGalleryLabDatabaseInfo {
	experimentID: number,
	path: string, //Image path
	captions: string 
}

export interface IAddUserToSessionInfo {
	socketID: string;
	nickname: string | null;
	roomCode: string | null;
	serialNumberLastFour: string | null;
	deviceID: number;
}

export interface IRegisterDeviceInfo {
	sessionID: string, 
    serialNumber: string,
    ipAddress: string,
	deviceSocketID: string
}

// {
// 	wb-backend-express   |   userid: 4,
// 	wb-backend-express   |   nickname: "eman",
// 	wb-backend-express   |   device: 1,
// 	wb-backend-express   |   sessionid: null,
// 	wb-backend-express   |   ismasked: null,
// 	wb-backend-express   |   frontendsocketid: "abc123",
// 	wb-backend-express   |   leftsession: null,
// 	wb-backend-express   |   userrole: null,
// 	wb-backend-express   |   secret: null
// 	wb-backend-express   | }
export interface IUserIdentity{
	userID: number,
	nickname: string, 
	deviceID: number,
	sessionID: number,
	isMasked: boolean | null,
	frontendSocketID: string,
	leftSession: boolean | null,
	userRole: string | null,
	secret: string | null
}


export async function verifyUserExists(userID: number, socketID: string): Promise<IUserIdentity>{
	await dbClient.connect();

	
	console.log("Starting query")
	const query = await dbClient.queryObject(`SELECT * FROM "User" where "User".frontendsocketid=$1 and "User".userid=$2`, [socketID, userID]);
	console.log(query)
	console.log("[0]",query.rows[0]);

	return new Promise<IUserIdentity>((resolve, reject) => {

		if (query.rows.length > 0){
			const userInfo: IUserIdentity = {
				userID: query.rows[0].userid,
				nickname: query.rows[0].nickname,
				deviceID: query.rows[0].device,
				sessionID: query.rows[0].sessionid,
				isMasked: query.rows[0].ismasked,
				frontendSocketID: query.rows[0].frontendsocketid,
				leftSession: query.rows[0].leftSession,
				userRole: query.rows[0].userrole,
				secret: query.rows[0].secret
			};
			console.log("Final object", userInfo)

			resolve(userInfo) //return the info
			// return userInfo;
		}
		else{
			reject(null)
			//return null;
			console.log("error verifying")
			// throw new Error("Unable to verify the user");
		}
	})

	
	

}


export async function makeDeviceAvailable(deviceID: number)
{
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE device
		SET isavailable = true
		WHERE deviceid = ${deviceID}; `);
	}
	catch(error){
		console.log("Unable to make device not available", error);
	}
}


export async function makeDeviceNotAvailable(deviceID: number)
{
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE device
		SET isavailable = false
		WHERE deviceid = ${deviceID}; `);
	}
	catch(error){
		console.log("Unable to make device not available", error);
		await dbClient.end();
	}
}	



export async function getPhotoLabInfo(experimentID: number): Promise<void>{
	console.log("Experiment passed in", experimentID);

	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT experiment.experimentid, path, captions, name, description FROM photolab JOIN experiment 
			ON photolab.experimentid = ${experimentID};`,
		);
		
		console.log("Photo Lab Info: ", query.rows[0]);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve photo lab info", error);
	}
}


function generateRandomCode(length: number){
    const numbers = '0123456789';
    let lobbyCode = '';
    for (let i = 0; i < length; i++){
        lobbyCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return lobbyCode;
}


function isolateSessionIDs(sessions) 
{
	console.log("(isolateSessionIDs): recieved" + JSON.stringify(sessions))
    let sessionIDs = []
    
	for (let i = 0; i < sessions.length; i++)
    {
        sessionIDs.push(sessions[i].sessionid)
    }

    return sessionIDs
}

export async function createExperiment(experimentName: string, description: string){
    try {
        // Create the table
        await dbClient.connect();
        console.log("(database.ts): createExperiment() - Connected to Database");

        const result = await dbClient.queryObject(`INSERT INTO experiment(name,description) VALUES($1,$2) RETURNING experimentid, name, description`,
          [experimentName, description]);
        console.log("(database.ts): Result: ", result);
		return result.rows[0] as string;
      } finally {
        // Release the connection back into the pool
        await dbClient.end();
      }
    
}

export async function getAllSessionIDsFromDB()
{
	let sessionIDsInDatabase: Array<number> = []
	console.log("(database.ts): Getting all session IDs from Database")

    try {
		await dbClient.connect();
		const result = await dbClient.queryObject(`SELECT sessionid FROM session;`)
		console.log("(database.ts): result", result)
		sessionIDsInDatabase = isolateSessionIDs(result.rows)
	} finally {
		// Release the connection back into the pool
        await dbClient.end();
	}
	console.log("(database.ts): sessions in the database: ", sessionIDsInDatabase, "END")
	return sessionIDsInDatabase;
}

export async function getMaxPhotoLabIDsFromDB()
{
	let sessionIDsInDatabase: Array<number> = []
	console.log("(database.ts): Getting all photo lab IDs from Database")

    try {
		await dbClient.connect();
		const result = await dbClient.queryObject(`SELECT MAX(photolabid) FROM photolab;`)
		console.log("(database.ts): result", result)
		//sessionIDsInDatabase = isolateSessionIDs(result.rows)
	} finally {
		// Release the connection back into the pool
        await dbClient.end();
	}
	console.log("(database.ts): sessions in the database: ", sessionIDsInDatabase, "END")
	return "hi";
}


// interface ISessionDatabaseInfo {
// 	sessionID: number,
// 	experimentID: number,
// 	backendSessionID: string,
// 	roomCode: string,
// 	hostSocketId: string,
// 	users: Array<IUser>,
// 	isInitialized: boolean,
// 	configuration: ISessionConfiguration,
// 	credentials: ISessionCredentials,
// 	discoveredDevices: Array<IDevice> | JSON		
// }


export async function validateRoomCode(roomCode:string): Promise<boolean>
{

	let isValidRoomCode = false;

	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT 
			sessionid FROM session WHERE roomcode= $1 LIMIT 1`,
			[roomCode]);
		console.log(query)

		if (query.rows.length > 0){//result is valid
			console.log("(database.ts): Validated room code")
			const sessionID = query.rows[0].sessionid;
			isValidRoomCode = true;
			return {
				isValidRoomCode: isValidRoomCode,
				sessionID: sessionID
			};
		}

		console.log("returning false")
		return false;
		
	}
	catch(error){
		console.log("(database.ts): No valid room code: " + error)
		return false;
	}
}

interface ISessionCreationParams{
	hostSocketID: string,
	isPasswordProtected: boolean | null,
	password: string | null,
	isSpectatorsAllowed: boolean | null,
}


// Author: Emanuelle Pelayo
// Purpose: Adds a session to the database
export async function createSessionInDatabase(initializationInfo: ISessionCreationParams): Promise<string> {
	
	const {
		hostSocketID,
		isPasswordProtected,
		password,
		isSpectatorsAllowed, 
	} = initializationInfo;
	console.log("HELLO: ", initializationInfo)
	const roomCode = generateRandomCode(5);

	try 
	{
		await dbClient.connect(); // Connect to the database 
		console.log("(database.ts): createSessionInDatabase() - Connected to Database");
		const result = await dbClient.queryObject(
			`SELECT * FROM Create_Session('${roomCode}', '${hostSocketID}', ${isPasswordProtected}, '${password}', ${isSpectatorsAllowed});`);
		//console.log("(database.ts): ", result)
		//console.log("(database.ts): RESULT" + JSON.stringify(result));
		return (result.rows[0]);

	}
	catch (error) 
	{
		console.log("(database.ts): Could not add session to the database: ", error);
	}
	finally 
	{
		//console.log("(Database.ts): ending database connection")
		await dbClient.end();
		//console.log("(Database.ts): finished ending database connection")
	}
}

export interface IPhotoLabDatabaseInfo {
	experimentTitle: string, 
	experimentDescription: string | null,
	experimentCaptions: string | null,
	imageBlob: string;
	socketID: string;
}


export async function getSessionState(sessionID: number){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT * FROM session WHERE sessionid = $1`,
			[sessionID]
		);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve state", error);
	}
}

export async function getSessionIDFromSocketID(socketID: string){
	console.log("getSessionIDFromSocketID() -> socketID: ", socketID)

	const cleanSocketID = socketID.replace(/^"|"$/g, "");

	console.log("cleaned ", cleanSocketID)
	try {
        await dbClient.connect();
        console.log("Starting query, socketID being passed: ", socketID);

        // Properly use parameterized query: no string interpolation with ${}
        const query = await dbClient.queryObject<{ sessionid: number }>(
            `SELECT sessionid FROM session WHERE hostsocketid = $1`, 
            [cleanSocketID] // Pass socketID as a parameter
        );

        console.log("Query result sessionid", query.rows[0].sessionid);

        if (query.rows.length > 0) {
            return query.rows[0].sessionid; // Return the session ID
        } else {
            console.warn("No session found for socketID:", socketID);
            return null; // Return null if no session found
        }
    } catch (error) {
        console.error("Unable to retrieve session id", error);
        return null; // Return null on error
    } finally {
        await dbClient.end(); // Always close the database connection
    }
}



export async function createPhotoLabInDatabase(initializationInfo: IPhotoLabDatabaseInfo, sessionID: null | number=null ): Promise<number>{
	const {
		experimentTitle,
		experimentDescription,
		experimentCaptions,
		imageBlob,
		socketID
	} = initializationInfo;

	console.log(socketID);
	let experimentID = null;

	try{
		await dbClient.connect();
		
		const createExperimentQuery = await dbClient.queryObject(`
			INSERT INTO experiment(name, description)
			VALUES ($1, $2)
			returning experimentid;`, 
			[
				experimentTitle,
				experimentDescription
			]
		);


		console.log("crcreateExperimentQuery: ", createExperimentQuery.rows[0].experimentid)
		experimentID = createExperimentQuery.rows[0].experimentid;


		//Add a photo lab 
		const query = await dbClient.queryObject(`
			INSERT INTO photolab ( 
			experimentid,
			path, 
			captions
			) 
			VALUES ($1, $2, $3);
			`, [
				experimentID,
				imageBlob,
				experimentCaptions
				]
		);

		console.log("CreatePhotoLabInDatabase() -> socketID: ", socketID)
		//get session id from host socket id 
		let sessionID = -1

		try{
			sessionID = await getSessionIDFromSocketID(socketID);
			
		}catch(error)
		{
			console.log(error);;
		
		}
		console.log()
		console.log("CreatePhotoLabInDatabase() -> sessionID, experimentID", sessionID, experimentID)

		console.log("Updating session")
		//relate the experiment to the session		
		try{
			await dbClient.connect()
			const updateSessionQuery = await dbClient.queryObject(`
				UPDATE session
				SET experimentid = ${experimentID}
				WHERE sessionid = ${sessionID}; `)
		}catch(error)
		{
			console.log(error)
		}
		
		console.log("Experiment id", experimentID)


	}
	catch(error){
		console.log("Error adding photo lab to the database: " + error)
	}

	return experimentID
}

export async function createVideoLabInDatabase(initializationInfo: IVideoLabDatabaseInfo): Promise<void>{
	const {
		experimentID,
		path, 
	} = initializationInfo;

	try{
		await dbClient.connect();

		const query = await dbClient.queryObject(`
			INSERT INTO videolab ( 
			experimentid,
			path
			) 
			VALUES ($1, $2);
			`, [
				experimentID,
				path
			]);

		console.log("(database.ts): Video Lab Successfully Added")
	}
	catch(error){
		console.log("Error adding video lab to the database: " + error)
	}
}


export async function createGalleryLabInDatabase(initializationInfo: IGalleryLabDatabaseInfo): Promise<void>{
	const {
		experimentID,
		path, 
		captions
	} = initializationInfo;

	try{
		await dbClient.connect();

		const query = await dbClient.queryObject(`
			INSERT INTO gallerylab (
			experimentid,
			path, 
			captions
			) 
			VALUES ($1, $2, $3, $4);
			`, [
				experimentID,
				path,
				captions
			]);

		console.log("(database.ts): gallery Lab Successfully Added")
	}
	catch(error){
		console.log("Error adding gallery lab to the database: " + error)
	}
}


//assuming the user is a joiner.
export async function addUserToSession(initializationInfo: IAddUserToSessionInfo): Promise<void>{
	console.log("(database.ts): addUserToSession() ", initializationInfo)
	const {
		socketID,
		nickname, 
		roomCode,
		serialNumberLastFour,
		deviceID
	} = initializationInfo;
	const userRole = "joiner";
	

	console.log("(database.ts): addUserToSession() ", initializationInfo)
	try{
		await dbClient.connect();

		//add the user to the session with the emotibit
		const query = await dbClient.queryObject(`SELECT * FROM Join_Session($1, $2, $3, $4, $5, $6)`,
			[nickname, socketID, roomCode, userRole, serialNumberLastFour, deviceID]
		);
		

		const changeDeviceAvailabilityQuery = await dbClient.queryObject(`UPDATE device
		SET isavailable = false
		WHERE deviceid = ${deviceID}; `);

		const changeDeviceAvailabilityQuery2 = await dbClient.queryObject(`UPDATE device
			SET isconnected = false
			WHERE deviceid = ${deviceID}; `);
		
		return query.rows[0]; 
	}
	catch(error)
	{
		console.log("Unable to add user ", error)
		throw error;
	}
}

export async function registerDevice(initializationInfo: IRegisterDeviceInfo){
	const {
		sessionID, 
        serialNumber,
        ipAddress,
        deviceSocketID
	} = initializationInfo;

	try{

		await dbClient.connect();
		const query = await dbClient.queryObject(`
			INSERT INTO DEVICE(
				ipaddress, 
				serialnumber, 
				devicesocketid, 
				samplingfrequency, 
				isavailable, 
				isconnected)
				VALUES ($1, $2, $3, $4, $5, $6)`, 
					[initializationInfo.ipAddress, 
					initializationInfo.serialNumber,
					initializationInfo.deviceSocketID,
					50, // -> samplingFrequency
					true,  // -> isAvailable
					false // -> isConnected: only true when the joiner connects their emotibit
				]);
		console.log(query)
		console.log("registerDevice(Database): Hi")
	}
	catch(error)
	{
		console.log("Unable to add user ", error)
	}

}

export async function getUsersFromSession(sessionID: string){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT * FROM Get_Session_Users($1)`,
			[sessionID]
		);
		console.log("Users retrieved from ", sessionID, query);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve users");
	}
}

export async function removeUserFromSession(sessionID: string, socketID: string){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`DELETE FROM User WHERE sessionID = $1 AND frontendsocketid = $2`,
			[sessionID, socketID]
		);
		console.log("Deleted user");
	}
	catch(error){
		console.log("Unable to delete user");
	}
	finally{
		await dbClient.end();
	}
}

export async function validDeviceSerial(nickName: string, roomCode:number, serialCode: string){
	console.log("validDeviceSerial: ", serialCode)
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT deviceid FROM device WHERE RIGHT(device.serialnumber, 4) = $1 AND isavailable = $2`,
			[serialCode, true] 
		);

		console.log("HERE+++ ", query);
		
		return query.rows[0];
		
	}
	catch(error){
		console.log("Unable to validate emotibit");
	}
}


export async function assignExperimentToSession(sessionID: number, experimentID: string){

	//add the experiment to the session
	//assign the experiment to the session
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE session
		SET experimentid = ${experimentID}
		WHERE sessionid = ${sessionID}; `);
	}
	catch(error){
		console.log("Unable to assign experiment to session", error);
	}	

}

export async function validatePassword(sessionID:string, password:string): Promise<boolean>{
	
	let isValidPass = false;

	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT sessionid FROM session WHERE sessionid = $1 AND password = $2`,
			[sessionID, password]
		);
		if(query.rows.length > 0){
			isValidPass = true;
		}
	}
	catch(error){
		console.log("Password is not valid", error);
	}

	return isValidPass;
}

