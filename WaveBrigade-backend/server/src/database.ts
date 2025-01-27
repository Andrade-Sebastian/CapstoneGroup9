import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { IUser } from "./controllers/session_controller.ts";
import { ISessionConfiguration, ISessionCredentials, IDevice } from "/Users/emanpelayo/Documents/real_docs/CS/Current_Classes/CS425/CapstoneGroup9/WaveBrigade-frontend/src/typings.ts";

const dbClient = new Client({
  user: "postgres",
  database: "postgres",
  password: "postgres",
  hostname: "localhost",
  port: 5432,
});

export { dbClient }

export async function createExperiment(experimentName: string, description: string){
    try {
        // Create the table
        await dbClient.connect();
        console.log("(database.ts): createExperiment - Connected to Database");
        const result = await dbClient.queryObject(`INSERT INTO experiment(name,description) VALUES($1,$2)`,
          [experimentName,description]);
        console.log("(database.ts): Result: ", result);
      } finally {
        // Release the connection back into the pool
        await dbClient.end();
      }
    
}


interface ISessionDatabaseInfo {
	sessionID: number,
	experimentID: number,
	backendSessionID: string,
	roomCode: string,
	hostSocketId: string,
	users: Array<IUser>,
	isInitialized: boolean,
	configuration: ISessionConfiguration,
	credentials: ISessionCredentials,
	discoveredDevices: Array<IDevice> | JSON		
}

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


	try 
	{
		await dbClient.connect();// Connect to the database 
		console.log("(database.ts): createSessionInDatabase - Connected to Database");
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
					discoveredDevices         // $10 -> discovereddevices (should be JSON or array)
				]);
				console.log("(database.ts): Session created successfully", result);
	}
	catch (error) 
	{
		console.log("(database.ts): Could not add session to the database: ", error);
	}
	finally 
	{
		await dbClient.end();
	}
}