import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const dbClient = new Client({
  user: "testadmin",
  database: "WBDatabase",
  password: "test",
  hostname: "localhost",
  port: 5432,
});

export { dbClient }

//const result = await client.connect();

// const result = await client.queryArray("SELECT ID, NAME FROM PEOPLE");
//console.log(result.rows); // [[1, 'Carlos'], [2, 'John'], ...]
//  await client.end();

// export async function createExperiment(experimentName: string, description: string){
//     try {
//         // Create the table
//         await client.connect();
//         console.log("Connected to DB" + client);
//         const result = await client.queryObject(`INSERT INTO experiment(name,description) VALUES($1,$2)`,
//           [experimentName,description]);
//         console.log(result);
//       } finally {
//         // Release the connection back into the pool
//         await client.end();
//       }
    
// }

// export async function createSession(){

// }