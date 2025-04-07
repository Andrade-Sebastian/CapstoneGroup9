import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts"; //for database functionality

const dbClient = new Client({
	user: "postgres",
	database: "WB_Database",
	password: "postgres",
	hostname: "wb-backend-database",
	port: 5432,
    tls: {enabled: false, enforce: false}
    
});

dbClient.connect()

export default dbClient;



