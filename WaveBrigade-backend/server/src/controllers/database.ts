import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts"; //for database functionality

export const dbClient = new Client({
	user: "postgres",
	database: "WB_Database",
	password: "postgres",
	hostname: "wb-backend-database",
	port: 5432,
});
  


interface ISessionCreationParams{
	hostSocketID: string,
	isPasswordProtected: boolean | null,
	password: string | null,
	isSpectatorsAllowed: boolean | null,
}

export interface IPhotoLabDatabaseInfo {
	experimentTitle: string, 
	experimentDescription: string | null,
	experimentCaptions: string | null,
	imageBlob: string;
	socketID: string;
}

export interface IVideoLabDatabaseInfo {
	experimentTitle: string,
	experimentDescription: string | null,
	videoBlob?: string;
	videoID?: string;
	socketID: string;
}
export interface IGalleryLabDatabaseInfo {
	experimentID: number,
	path: string, //Image path
	captions: string 
}


export interface IRegisterDeviceInfo {
	sessionID: string, 
    serialNumber: string,
    ipAddress: string,
	deviceSocketID: string
}

export interface IAddUserToSessionInfo {
	socketID: string;
	nickname: string | null;
	roomCode: string | null;
	serialNumberLastFour: string | null;
	deviceID: number;
}

export interface IArticleLabDatabaseInfo{
	experimentTitle: string,
	experimentDescription: string | null,
	article: string,
	socketID: string
}




export async function joinSessionAsSpectator(socketID: string, nickname: string, roomCode: string){
	
	const userRole = "spectator";
	let spectatorData = null


	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT * from Join_Session_Without_EmotiBit($1, $2, $3, $4)`,
			[
				nickname, 
				socketID, 
				roomCode, 
				userRole
			]
		);

		console.log("Query rows", query.rows[0]);
		
		spectatorData = query.rows[0];

	}catch(error){
		console.log("Unable to add user ", error)
		throw new Error("Unable to add user");


	}finally{
		await dbClient.end();
	}

	return spectatorData;

}



export async function makeDeviceAvailable(deviceID: number)
{
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE device
		SET isavailable = true,
		devicesocketid = ' '
		WHERE deviceid = $1 `,
		[deviceID]);
		console.log("Device made available");
	}
	catch(error){
		console.log("Unable to make device available", error);
	}
}

export async function makeDeviceNotAvailable(deviceID: number)
{
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE device
		SET isavailable = false
		WHERE deviceid = $1`,
		[deviceID]);
	}
	catch(error){
		console.log("Unable to make device not available", error);
	}
}	



export async function getPhotoLabInfo(experimentID: number): Promise<void>{
	console.log("Photo Experiment passed in", experimentID);

	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT photolab.experimentid, path, captions, name, description FROM photolab JOIN experiment 
			ON photolab.experimentid = experiment.experimentid WHERE photolab.experimentid = $1 LIMIT 1`,
			[experimentID]
		);
		
		console.log("Photo Lab Info: ", query.rows[0]);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve photo lab info", error);
	}
}
export async function getVideoLabInfo(experimentID: number): Promise<void>{
	console.log("Video Experiment passed in", experimentID);

	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT videolab.experimentid, path, name, description FROM videolab JOIN experiment 
			ON videolab.experimentid = experiment.experimentid WHERE videolab.experimentid = $1 LIMIT 1`,
			[experimentID]
		);
		
		console.log("Video Lab Info: ", query.rows[0]);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve video lab info", error);
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


export async function validateRoomCode(roomCode:string): Promise<{isValidRoomCode: boolean, sessionID: number | null}>
{

	let isValidRoomCode = false;

	try{
		console.log("-------------------");
		console.log("Initializing db")
		console.log("Connecting to database")
		await dbClient.connect();
		console.log("Finished connecting to database")
		console.log(`query is: SELECT sessionid FROM session WHERE roomcode= ${roomCode} LIMIT 1`)
		const query = await dbClient.queryObject(`SELECT 
			sessionid FROM session WHERE roomcode= $1 LIMIT 1`,
			[roomCode]);
		console.log("After queryobject")
		console.log(query);
		console.log("rows length", query.rows.length);
		
		if (query.rows.length > 0){//result is valid
			console.log("(database.ts): Validated room code")
			console.log("-------------------");
			const sessionID = query.rows[0].sessionid;
			isValidRoomCode = true;
			
			const roomCodeValidationInfo = {
				isValidRoomCode: isValidRoomCode,
				sessionID: sessionID
			}
			console.log("roomCodeValidationInfo: ", roomCodeValidationInfo)	
			return {
				isValidRoomCode: isValidRoomCode,
				sessionID: sessionID
			};
		}
		else{
			console.log("(database.ts): Invalid room code");
			console.log("-------------------");
			return {
				isValidRoomCode: isValidRoomCode,
				sessionID: -1
			}
		}
		
	}
	catch(error){
		console.log("(database.ts): No valid room code: " + error)
		return {
			isValidRoomCode: isValidRoomCode,
			sessionID: -1
		}
	}
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
	const cleanSocketID = socketID.replace(/^"|"$/g, "");

	try {
        await dbClient.connect();

        const query = await dbClient.queryObject<{ sessionid: number }>(
            `SELECT sessionid FROM session WHERE hostsocketid = $1`, 
            [cleanSocketID] 
        );

        if (query.rows.length > 0) {
            return query.rows[0].sessionid; 
        } else {
            console.warn("No session found for socketID:", socketID);
            return null; 
        }
    } 
	catch (error) {
        console.error("Unable to retrieve session id", error);
        return null; 
    } 
	finally {
        await dbClient.end();
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
		return experimentID


	}
	catch(error){
		console.log("Error adding photo lab to the database: " + error)
	}

	
}


export async function createVideoLabInDatabase(initializationInfo: IVideoLabDatabaseInfo, sessionID: number): Promise<void>{
	const {
		experimentTitle,
		experimentDescription,
		videoID,
		videoBlob,
		socketID
	} = initializationInfo;

	console.log(socketID);
	console.log(`Experiment Title: ${experimentTitle}, Description ${experimentDescription}, Video Source: ${videoID ? videoID: videoBlob}, SocketID ${socketID}`);
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
	console.log("createExperimentQuery: ", createExperimentQuery.rows[0].experimentid)
	experimentID = createExperimentQuery.rows[0].experimentid;

	const videoPath = videoID ? videoID : videoBlob;

	//add a video lab
	const query = await dbClient.queryObject(`
		INSERT INTO videolab ( 
		experimentid,
		path
		) 
		VALUES ($1, $2);
		`, [
			experimentID,
			videoPath
			]
	);
	console.log("CreateVideoLabInDatabase() -> socketID: ", socketID)
		//get session id from host socket id 
		let sessionID = -1

		try{
			sessionID = await getSessionIDFromSocketID(socketID);
			
		}catch(error)
		{
			console.log(error);;
		
		}
		console.log()
		console.log("CreateVideoLabInDatabase() -> sessionID, experimentID", sessionID, experimentID)

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
		return experimentID


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

export async function createArticleLabInDatabase(initializationInfo: IArticleLabDatabaseInfo, sessionID: null | number=null ): Promise<number>{
	const {
		experimentTitle,
		experimentDescription,
		article,
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


		console.log("createExperimentQuery: ", createExperimentQuery.rows[0].experimentid)
		experimentID = createExperimentQuery.rows[0].experimentid;


		//Add an article lab 
		const query = await dbClient.queryObject(`
			INSERT INTO articlelab ( 
			experimentid,
			path
			) 
			VALUES ($1, $2);
			`, [
				experimentID,
				article,
				]
		);

		console.log("CreateArticleLabInDatabase() -> socketID: ", socketID)
		//get session id from host socket id 
		let sessionID = -1

		try{
			sessionID = await getSessionIDFromSocketID(socketID);
			
		}catch(error)
		{
			console.log(error);;
		
		}
		console.log()
		console.log("CreateArticleLabInDatabase() -> sessionID, experimentID", sessionID, experimentID)

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
		return experimentID


	}
	catch(error){
		console.log("Error adding article lab to the database: " + error)
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
		const query = await dbClient.queryObject(`SELECT * FROM "User" 
			JOIN device ON "User".sessionid = $1`,
			[sessionID]
		);
		// console.log("Users retrieved from ", sessionID, query);
		return query.rows;
	}
	catch(error){
		console.log("Unable to retrieve users");
	}
}

export async function removeUserFromSession(sessionID: string, socketID: string){
	console.log("in removeUserFromSession, sessionID is ", sessionID, "socketID is ", socketID);
	try{
		await dbClient.connect();
		const getDevice = await dbClient.queryObject(`SELECT device FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2`,
			[sessionID, socketID]
		)
		const query = await dbClient.queryObject(`DELETE FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2`,
			[sessionID, socketID]
		);
		console.log("here: ", query)
		console.log("Deleted user");
		const deviceID = (getDevice.rows[0] as { device: number }) || null;
		// console.log("(LoOk HeRe): device id is", deviceID.device )
		if (deviceID !== null){ //bc the spectator's device is null
			await makeDeviceAvailable(deviceID.device);
		}
	}
	catch(error){
		console.log("Unable to delete user", error);
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

export async function getUserExperimentData(sessionID: string, userID: number, experimentType: string){
	try{
		await dbClient.connect();
		switch(experimentType){
			case "photo-lab":
				const userInfo = await dbClient.queryObject(`SELECT "User".*, device.*, photolab.path FROM "User"
					LEFT JOIN session ON "User".sessionid = session.sessionid
					LEFT JOIN experiment ON session.experimentid = experiment.experimentid
					LEFT JOIN photolab ON experiment.experimentid = photolab.experimentid
					JOIN device ON "User".device = device.deviceid
					WHERE "User".userid = $1`,
					[userID]
				);
				return userInfo.rows[0];
				break;
		}
		
	}
	catch(error){
		console.log("Data is not available", error);
	}
}

export async function updateDeviceConnection(serialNumber: string, socketId: string, connection: true){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`UPDATE device
			SET isconnected = $1
			WHERE serialnumber = $2
			RETURNING *`,
			[connection, serialNumber]
		);
		console.log("Updated device to connected in database: ", query.rows[0]);
		return true;
	}
	catch(error){
		console.log("Unable to update isconnected in database", error);
		return false;
	}
}

export async function getSessionDevices(sessionId: string){
	try{
		await dbClient.connect();
		const query = await dbClient.queryObject(`SELECT device.deviceid, device.isconnected 
			FROM "User"
			JOIN session ON "User".sessionid = session.sessionid
			JOIN device ON "User".device = device.deviceid
			WHERE session.sessionid = $1`,
			[sessionId]
		);
		console.log("DEVICES IN SESSION: ", query.rows);
		return query.rows
	}
	catch(error){
		console.log("Unable to get devices in session", error);
	}

}

