import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from 'mongodb';

let client;
let memoryServer;

// Create an instance of the mongo memory server
export async function setupDatabase() {
    memoryServer = await MongoMemoryServer.create();
    client = new MongoClient(memoryServer.getUri());
    
    await client.connect();
    
    return client.db();
}

export async function closeDatabase() {
    if(client)
        await client.close();
    if(memoryServer)
        await memoryServer.stop();
} 

export async function reset(db) {
    const collections = await db.collections();
    for(const c of collections) {
        await c.deleteMany({});
    }
}