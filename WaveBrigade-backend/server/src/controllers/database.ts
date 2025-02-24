import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { IDevice, ISessionDatabaseInfo, IUser } from "./session_controller.ts";


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


export async function getPhotoLabInfo(experimentID: number){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT * FROM photolab JOIN experiment 
			ON photolab.experimentid = ${experimentID};`,
		);
		console.log("Photo Lab Info: ", query);
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
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT 
			roomcode FROM session WHERE roomcode= $1`,
			[roomCode]);
		console.log(query)

		if (query.rows.length > 0){//result is valid
			console.log("(database.ts): Validated room code")
			return true;
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

	const roomCode = generateRandomCode(6);

	try 
	{
		await dbClient.connect(); // Connect to the database 
		console.log("(database.ts): createSessionInDatabase() - Connected to Database");
		const result = await dbClient.queryObject(
			`SELECT * FROM Create_Session('${roomCode}', '${hostSocketID}', ${isPasswordProtected}, '${password}', ${isSpectatorsAllowed});`);
		console.log("(database.ts): ", result)
		console.log("(database.ts): RESULT" + JSON.stringify(result));
		return (result.rows[0]);

	}
	catch (error) 
	{
		console.log("(database.ts): Could not add session to the database: ", error);
	}
	finally 
	{
		console.log("(Database.ts): ending database connection")
		await dbClient.end();
		console.log("(Database.ts): finished ending database connection")
	}
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

export interface IPhotoLabDatabaseInfo {
	experimentTitle: string, 
	experimentDescription: string | null,
	experimentCaptions: string | null,
	imageBlob: string;
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


export async function createPhotoLabInDatabase(initializationInfo: IPhotoLabDatabaseInfo, sessionID: null | number=null ): Promise<void>{
	const {
		experimentTitle,
		experimentDescription,
		experimentCaptions,
	} = initializationInfo;
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
		experimentID = createExperimentQuery.rows[0].experimentid;


		const query = await dbClient.queryObject(`
			INSERT INTO photolab ( 
			experimentid,
			path, 
			captions
			) 
			VALUES ($1, $2, $3);
			`, [
				experimentID,
				"hardcoded string",
				experimentCaptions
			]);
		
		console.log(query);
		console.log("(database.ts): Photo Lab Successfully Added")
		if (sessionID !== null){
			assignExperimentToSession(sessionID, experimentID);
		}
		console.log("HERE" +  experimentID);
		return experimentID;
	}
	catch(error){
		console.log("Error adding photo lab to the database: " + error)
	}
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



export interface IAddUserToSessionInfo {
	socketID: string;
	nickname: string | null;
	roomCode: string | null;
	serialNumberLastFour: string | null;
}

//assuming the user is a joiner.
export async function addUserToSession(initializationInfo: IAddUserToSessionInfo): Promise<void>{
	const {
		socketID,
		nickname, 
		roomCode,
		serialNumberLastFour
	} = initializationInfo;
	const userRole = "joiner";

	console.log("(database.ts): addUserToSession() ", initializationInfo)
	try{
		await dbClient.connect();

		//add the user to the session
		const query = await dbClient.queryObject(`SELECT * FROM
			Join_Session('${nickname}', '${socketID}', '${roomCode}', '${userRole}','${serialNumberLastFour}');`) 
		
		//console.log("(database.ts): ", query)
		console.log("(database.ts): User Successfully Added To Session")
	}
	catch(error)
	{
		console.log("Unable to add user ", error)
		throw error;
	}
}

export interface IRegisterDeviceInfo {
	sessionID: string, 
    serialNumber: string,
    ipAddress: string,
	deviceSocketID: string
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

export async function valideDeviceSerial(nickName: string, roomCode:string, serialCode: string){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT FROM `);
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
