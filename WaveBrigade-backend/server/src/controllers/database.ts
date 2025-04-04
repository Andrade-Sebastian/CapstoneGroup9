import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts"; //for database functionality
import  dbClient from "../controllers/dbClient.ts";


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
	experimentTitle: string,
	experimentDescription: string | null,
	path?: string, //Image path
	captions?: string,
	socketID: string,
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
	articleBlob?: string,
	articleURL?: string,
	socketID: string
}


export async function checkSpectators(sessionID: number){

	try {
		
		const query = await dbClient.queryObject(`SELECT isspectatorsallowed FROM SESSION WHERE sessionid = $1`, [sessionID]);
		return query.rows[0];
	}
	catch(error){
		console.log("Error getting spectator info from session");
	}
}

export async function joinSessionAsSpectator(socketID: string, nickname: string, roomCode: string){
	
	const userRole = "spectator";
	let spectatorData = null


	try{
		
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


	}

	return spectatorData;

}



export async function makeDeviceAvailable(deviceID: number)
{
	try{
		
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
export async function getGalleryLabInfo(experimentID: number) {
	console.log("Gallery Experiment passed in", experimentID);

	try{
		
		const query = await dbClient.queryObject(`
			SELECT gallerylab.path, gallerylab.caption, experiment.name, experiment.description 
			FROM gallerylab 
			JOIN experiment ON gallerylab.experimentid = experiment.experimentid WHERE gallerylab.experimentid = $1;`,
			[experimentID]
		);
		
		console.log("Gallery Lab Info: ", query.rows[0]);
		const experimentInfo = {
			name: query.rows[0].name,
			description: query.rows[0].description,
			images:query.rows.map((row)=> ({
				path: row.path,
				caption: row.caption,
			})),
		};
		return experimentInfo;
	}
	catch(error){
		console.log("Unable to retrieve gallery lab info", error);
	}
}

export async function getArticleLabInfo(experimentID: number): Promise<void>{
	console.log("Article Experiment passed in", experimentID);

	try{
		
		const query = await dbClient.queryObject(`SELECT articlelab.experimentid, path, name, description FROM articlelab JOIN experiment 
			ON articlelab.experimentid = experiment.experimentid WHERE articlelab.experimentid = $1 LIMIT 1`,
			[experimentID]
		);
		
		console.log("Article Lab Info: ", query.rows[0]);
		return query.rows[0];
	}
	catch(error){
		console.log("Unable to retrieve article lab info", error);
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
        console.log("(database.ts): createExperiment() - Connected to Database");

        const result = await dbClient.queryObject(`INSERT INTO experiment(name,description) VALUES($1,$2) RETURNING experimentid, name, description`,
          [experimentName, description]);
        console.log("(database.ts): Result: ", result);
		return result.rows[0] as string;
    }catch(error){
		console.log(error)
	}
    
}


export async function validateRoomCode(roomCode:string): Promise<{isValidRoomCode: boolean, sessionID: string | null}>
{

	let isValidRoomCode = false;

	try{
		const query = await dbClient.queryObject(`SELECT 
			sessionid FROM session WHERE roomcode= $1 LIMIT 1`,
			[roomCode]);
		// console.log(query)
		// console.log("rows length", query.rows.length)

		if (query.rows.length > 0){//result is valid
			console.log("(database.ts): Validated room code")
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
			return {
				isValidRoomCode: isValidRoomCode,
				sessionID: null
			}
		}
		
	}
	catch(error){
		console.log("(database.ts): No valid room code: " + error)
		return {
			isValidRoomCode: isValidRoomCode,
			sessionID: ""
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
		console.log("(database.ts): createSessionInDatabase() - Connected to Database");
		const result = await dbClient.queryObject(
			`SELECT * FROM Create_Session('${roomCode}', '${hostSocketID}', ${isPasswordProtected}, '${password}', ${isSpectatorsAllowed});`);
		//console.log("(database.ts): ", result)
		//console.log("(database.ts): RESULT" + JSON.stringify(result));
		return (result.rows[0] as string);

	}
	catch (error) 
	{
		console.log("(database.ts): Could not add session to the database: ", error);
	}
}




export async function getSessionState(sessionID: number){
	try{
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
			console.log(error);
		
		}
		console.log()
		console.log("CreatePhotoLabInDatabase() -> sessionID, experimentID", sessionID, experimentID)

		console.log("Updating session")
		//relate the experiment to the session		
		try{
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



export async function createGalleryLabInDatabase(initializationInfo: IGalleryLabDatabaseInfo, images: { path: string, caption: string } [], sessionID: number): Promise<number>{
	const{
		experimentTitle,
		experimentDescription,
		socketID
	} = initializationInfo;
	let experimentID = 0;

	try{

		//Creating experiment
		const createExperimentQuery = await dbClient.queryObject(`
			INSERT INTO experiment(name, description)
			VALUES ($1, $2)
			returning experimentid;`, 
			[
				experimentTitle,
				experimentDescription
			]
		);
		console.log("Create experiment query:", createExperimentQuery.rows[0].experimentid)
		experimentID = createExperimentQuery.rows[0].experimentid;

		//add a gallery lab - insert gallery image entries
		for( const {path, caption} of images){
			await dbClient.queryObject(`
				INSERT INTO gallerylab (experimentid, path, caption)
				VALUES ($1, $2, $3)`, [experimentID, path, caption]);
		}
		console.log("(database.ts): gallery lab entries successfully added!");
		console.log("CreatePhotoLabInDatabase() -> socketID: ", socketID)
		//get session id from host socket id 
		//let sessionID = -1

		// sessionID = await getSessionIDFromSocketID(socketID);
			
	
		console.log()
		console.log("CreateGalleryLabInDatabase() -> sessionID, experimentID", sessionID, experimentID)

		console.log("Updating session")
		//relate the experiment to the session		
	
		await dbClient.queryObject(`
			UPDATE session
			SET experimentid = $1 WHERE sessionid = $2;`, 
			[experimentID, sessionID]);
		console.log("Session updated with experiment ID:", experimentID);
		console.log("Returning this Experiment id in gallery", experimentID)
		console.log("images inserted for experiment:", experimentID)
		console.table(images);
		return experimentID

		

	}
	catch(error){
		console.log("Error adding gallery lab to the database: " + error)
	}
}

export async function createArticleLabInDatabase(initializationInfo: IArticleLabDatabaseInfo, sessionID: null | number=null ): Promise<number>{
	const {
		experimentTitle,
		experimentDescription,
		articleURL,
		articleBlob,
		socketID
	} = initializationInfo;

	console.log(socketID);
	console.log(`Experiment Title: ${experimentTitle}, Description ${experimentDescription}, Article Source: ${articleURL ? articleURL: articleBlob}, SocketID ${socketID}`);
	let experimentID = null;

	try{
		
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

		const articlePath = articleURL ? articleURL : articleBlob;

		//Add an article lab 
		const query = await dbClient.queryObject(`
			INSERT INTO articlelab ( 
			experimentid,
			path
			) 
			VALUES ($1, $2);
			`, [
				experimentID,
				articlePath,
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

		//add the user to the session with the emotibit
		const query = await dbClient.queryObject(`SELECT * FROM Join_Session($1, $2, $3, $4, $5, $6)`,
			[nickname, socketID, roomCode, userRole, serialNumberLastFour, deviceID]
		);
		

		const changeDeviceAvailabilityQuery = await dbClient.queryObject(`UPDATE device
		SET isavailable = false, isconnected = false
		WHERE deviceid = $1`,
		[deviceID]);
		
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
		const query = await dbClient.queryObject(`SELECT * FROM "User" 
			WHERE "User".sessionid = $1`,
			[sessionID]
		);
		console.log("<><><><><><> Users retrieved from sessionid", sessionID, query);
		return query.rows;
	}
	catch(error){
		console.log("Unable to retrieve users");
	}
}

export async function removeUserFromSession(sessionID: string, socketID: string){
	try{
		console.log("in removeUserFromSession, sessionID is ", sessionID, "socketID: " , socketID)
		const getDevice = await dbClient.queryObject(`SELECT device FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2 AND userrole = $3`,
			[sessionID, socketID, "joiner"]
		)
		const query = await dbClient.queryObject(`DELETE FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2`,
			[sessionID, socketID]
		);
		console.log("Deleted user");
		const deviceID = getDevice.rows[0]
		console.log("(LoOk HeRe): device id is", deviceID.device )
		await makeDeviceAvailable(deviceID.device);
	}
	catch(error){
		console.log("Unable to delete user", error);
	}
}

export async function validDeviceSerial(nickName: string, roomCode:number, serialCode: string){
	try{
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
		const query = await dbClient.queryObject(`UPDATE session
		SET experimentid = ${experimentID}
		WHERE sessionid = ${sessionID}; `);
	}
	catch(error){
		console.log("Unable to assign experiment to session", error);
	}	

}

export async function validatePassword(sessionID:string){

	try{
		const query = await dbClient.queryObject(`SELECT password FROM session WHERE sessionid = $1`,
			[sessionID]
		);
		if(query.rows.length > 0){
			return query.rows[0];
		}
	}
	catch(error){
		console.log("Password is not valid", error);
	}
}

export async function getUserExperimentData(sessionID: string, userID: number, experimentType: string){
	try{
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

export async function removeSpectatorFromSession(sessionID: number, socketID: string): Promise<boolean>{

	console.log(`(database.ts): In removeUserFromSession(${sessionID}, ${socketID})`);

	let userExistsInSession = false;
	try{
		const validateUser = await dbClient.queryObject(`SELECT userid FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2 AND userrole = 'spectator'`, 
			[sessionID, socketID])
		console.log("User obj: ", validateUser.rows[0])
		userExistsInSession = validateUser.rows[0] !== undefined
		console.log("User exists in session? ", userExistsInSession)

		if (!userExistsInSession){
			console.log(`User with sessionID ${sessionID} and socketID ${socketID} was not found.`)
			return false;
		}
	}catch(error){ //If postgres couldn't find the requested user 
		console.log(error)
		return false;
	}

	
	try{
		const query = await dbClient.queryObject(`DELETE FROM "User" WHERE sessionID = $1 AND frontendsocketid = $2`,
			[sessionID, socketID]
		);
		console.log("(database.ts): removeSpectatorFromSession() -> ", query)
		
		return true;
	}catch(error){
		console.log(error)
		return false;
	}


}



