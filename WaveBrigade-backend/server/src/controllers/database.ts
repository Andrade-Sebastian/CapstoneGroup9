import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { IUser, ISessionDatabaseInfo } from "./session_controller.ts";
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.17.0/query/query.ts";
import { ISessionConfiguration, ISessionCredentials, IDevice } from "../typings.ts";

const dbClient = new Client({
  user: "postgres",
  database: "WB_Database",
  password: "postgres",
  hostname: "wb-backend-database",
  port: 5432,
});
interface sessionID{
	sessionid: number
}
export { dbClient }
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
        const result = await dbClient.queryObject(`INSERT INTO experiment(name,description) VALUES($1,$2)`,
          [experimentName,description]);
        console.log("(database.ts): Result: ", result);
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
//getAllSessionIDsFromDB()


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


// Author: Emanuelle Pelayo
// Purpose: Adds a session to the database
export async function createSessionInDatabase(initializationInfo: ISessionDatabaseInfo): Promise<void> {
	const {
		sessionID, 
		experimentID, 
		backendSessionID,
		roomCode, 
		hostSocketId, 
		users, 
		isInitialized, 
		configuration, 
		credentials, 
		discoveredDevices
	} = initializationInfo;

	//const initializationInfoToPrint = JSON.stringify(initializationInfo);
	//console.log("(database.ts): Receieved initialization Info: "+ initializationInfoToPrint)


	try 
	{
		await dbClient.connect(); // Connect to the database 
		console.log("(database.ts): createSessionInDatabase() - Connected to Database");
		const result = await dbClient.queryObject(
			`INSERT INTO session(
				sessionid, 
				experimentid, 
				besessionid, 
				roomcode, 
				hostsocketid, 
				users,
				isinitialized,
				configuration, 
				credentials,
				discovereddevices)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
				[
					sessionID,                // $1 -> sessionid
					experimentID,             // $2 -> experimentid
					backendSessionID,         // $3 -> besessionid
					roomCode,                 // $4 -> roomcode
					hostSocketId,             // $5 -> hostsocketid
					users,                    // $6 -> users (should be JSON array)
					isInitialized,            // $7 -> isinitialized
					configuration,            // $8 -> configuration (should be JSON)
					credentials,              // $9 -> credentials (should be JSON)
					discoveredDevices         // $10 -> discovereddevices (should be JSON or array -- JSON for now)
				]);
				console.log("(database.ts): Session created successfully");
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