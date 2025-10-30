import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken } from './middleware/auth.js';
import { createUsersRouter } from './routes/users.js';

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

    // Protected test route
    app.get('/api/protected', verifyToken, (req, res) => {
        res.json({ message: 'Protected data', user: req.user });
    });

    return app;
}

export async function setupDatabase() {
    const mongo_uri = process.env.MONGO_URI;

    let db;
    if (mongo_uri) {
        console.log("MONGO_URI found, connecting to database");
        const client = new MongoClient(mongo_uri);
        await client.connect();
        db = client.db('large-proj-data');
    } else {
        // Fallback in-memory store for local testing when MONGO_URI is not provided
        console.warn('MONGO_URI not set — using in-memory store (for testing only)');
        const users = [];
        const refreshTokens = [];

        db = {
            collection(name) {
                if (name === 'users') {
                    return {
                        async findOne(query) {
                            // support $or: [{user: ident}, {email: ident}]
                            if (query.$or && Array.isArray(query.$or)) {
                                const conds = query.$or;
                                for (const u of users) {
                                    for (const c of conds) {
                                        const key = Object.keys(c)[0];
                                        if (u[key] === c[key]) return u;
                                    }
                                }
                                return null;
                            }
                            if (query._id) {
                                const idStr = String(query._id);
                                return users.find(u => String(u._id) === idStr) || null;
                            }
                            return users.find(u => Object.keys(query).every(k => u[k] === query[k])) || null;
                        },
                        async insertOne(doc) {
                            // 'user' and 'email' have the 'unique' property in the db, so
                            // we need to make sure we throw an error if we try to insert duplicates
                            const duplicateUser = users.find(u => u.user === doc.user);
                            const duplicateEmail = users.find(u => u.email === doc.email);
                            
                            if (duplicateUser || duplicateEmail) {
                                const error = new Error('Duplicate key error');
                                error.code = 11000;
                                throw error;
                            }

                            const id = new ObjectId();
                            const toInsert = { ...doc, _id: id };
                            users.push(toInsert);
                            return { insertedId: id };
                        }
                    };
                }
                if (name === 'refreshTokens') {
                    return {
                        async insertOne(doc) {
                            refreshTokens.push(doc);
                            return { insertedId: new ObjectId() };
                        },
                        async findOne(query) {
                            return refreshTokens.find(r => r.token === query.token) || null;
                        },
                        async deleteOne(query) {
                            const idx = refreshTokens.findIndex(r => r.token === query.token);
                            if (idx >= 0) refreshTokens.splice(idx, 1);
                            return { deletedCount: idx >= 0 ? 1 : 0 };
                        }
                    };
                }
                return {
                    async findOne() { return null; },
                    async insertOne() { return { insertedId: new ObjectId() }; },
                    async deleteOne() { return { deletedCount: 0 }; }
                };
            }, 
            // Reset method for testing
            reset() {
                users.length = 0;
                refreshTokens.length = 0;
            }
        };
    }
    return db;
}