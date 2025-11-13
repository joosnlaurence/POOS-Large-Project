import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken } from './middleware/auth.js';
import { createUsersRouter } from './routes/users.js';
import { createBuildingsRouter } from './routes/buildings.js';
import { createFountainsRouter } from './routes/fountains.js';
import { createVotesRouter } from './routes/votes.js';

export function createApp(db) {
    const app = express();
    // Just allow everything for now
    app.use(cors({
        origin: true,
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    // Give the express app access to the API endpoints found in ./router/users
    app.use('/api/users', createUsersRouter(db));

    // Give the express app access to the API endpoints found in ./router/buildings
    app.use('/api/buildings', createBuildingsRouter(db));

    // Give the express app access to the API endpoints found in ./router/fountains
    app.use('/api/fountains', createFountainsRouter(db));
    // Give app access to endpoints related to the voting system
    app.use('/api/votes', createVotesRouter(db));

    // Protected test route
    app.get('/api/protected', verifyToken, (req, res) => {
        res.json({ message: 'Protected data', user: req.user });
    });

    return app;
}

export async function setupDatabase() {
    let mongo_uri;

    if(process.env.CI) {
        mongo_uri = 'mongodb://localhost:27017';
    }
    else{
        mongo_uri = process.env.MONGO_URI;
    }
    
    let db;
    if (mongo_uri) {
        console.log("MONGO_URI found, connecting to database");
        const client = new MongoClient(mongo_uri);
        await client.connect();
        console.log("connected to database");
        db = client.db('large-proj-data');
        const secondsInDay = 24 * 60 * 60;

        // Initialize indexes if we're using the test database through GitHub Actions
        await db.collection('votes').createIndex(
            { timestamp: 1 },
            { expireAfterSeconds: 2 * secondsInDay }
        );
        await db.collection('votes').createIndex(
            { userId: 1, fountainId: 1, timestamp: -1 }
        );        

        await db.collection('users').createIndex(
            { email: 1 },
            { unique: true }
        );
        await db.collection('users').createIndex(
            { user: 1 },
            { unique: true }
        );
    } 
    return db;
}
