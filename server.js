import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
// Just allow everything for now
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const mongo_uri = process.env.MONGO_URI;

let db;
if (mongo_uri) {
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
        }
    };
}

// JWT / token configuration
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m'; // jwt expiresIn syntax
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);

function generateAccessToken(user) {
    return jwt.sign({ id: String(user._id), user: user.user }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function generateRefreshToken(user) {
    return jwt.sign({ id: String(user._id) }, REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });
}

async function storeRefreshToken(token, userId) {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await db.collection('refreshTokens').insertOne({ token, userId, createdAt: new Date(), expiresAt });
}

async function removeRefreshToken(token) {
    await db.collection('refreshTokens').deleteOne({ token });
}

async function refreshTokenExists(token) {
    const doc = await db.collection('refreshTokens').findOne({ token });
    return !!doc;
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;
        next();
    });
}

app.post('/api/login', async (req, res, next) => {
    // expects: {ident, password}
    // ident can be either a username or email
    // produces: {_id: ObjectId(...), firstName, lastName, email, success: True | False, error}

    let ret = {
        _id: -1,
        firstName: '',
        lastName: '',
        email: '',
        success: false,
        error: ''
    };

    try {
        const {ident, password} = req.body;

        if(!(ident?.trim()) || !(password?.trim())){
            ret.error = 'Missing fields';
            res.status(400).json(ret);
            return;
        }

        const account = await db.collection('users').findOne({
            $or: [
                {user: ident},
                {email: ident}
            ],
        });

        if(!account || !(await bcrypt.compare(password, account.password))){
            ret.error = 'Invalid username/password';
            res.status(401).json(ret);
            return;
        }

        // generate tokens
        const accessToken = generateAccessToken(account);
        const refreshToken = generateRefreshToken(account);

        // store refresh token server-side
        await storeRefreshToken(refreshToken, account._id);

        // set refresh token as HttpOnly cookie
        res.cookie('jid', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        });

        ret._id = account._id;
        ret.firstName = account.firstName;
        ret.lastName = account.lastName;
        ret.email = account.email;
        ret.success = true;
        // also return access token for client use (store in memory)
        res.status(200).json({ ...ret, accessToken });
    }
    catch(err) {
        console.error('MongoDB Error:', err.message);
        ret.success = false;
        ret.error = 'Database error occurred';
        res.status(500).json(ret);
    }
});

app.post('/api/register', async (req, res, next) => {
    // expects: {firstName, lastName, user, email, password}
    // produces: {_id: ObjectId(...), success: True | False, error: ""}

    let ret = {
        _id: -1,
        success: false,
        error: ''
    };

    try {
        const {firstName, lastName, user, email, password} = req.body;

        if(!(firstName?.trim()) || !(user?.trim()) || !(email?.trim()) || !(password?.trim())){
            ret.error = 'Missing fields';
            res.status(400).json(ret);
            return;
        }

        // hash the password before storing
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const newAccount = await db.collection('users').insertOne({
            firstName: firstName,
            lastName: lastName,
            user: user,
            email: email,
            password: hashed
        });

        ret._id = newAccount.insertedId;
        ret.success = true;
        res.status(201).json(ret);
    }
    catch(err) {
        ret.success = false;
        // user and email have the 'unique' property in the database
        // This error code indicates a collision when trying to insert
        if(err?.code === 11000){
            ret.error = 'Username/email already in use';
            res.status(409).json(ret);
            return;
        }

        console.error('MongoDB Error:', err.message);
        ret.error = 'Database error occurred';
        res.status(500).json(ret);
    }
});

// Refresh token endpoint
app.post('/api/refresh', async (req, res) => {
    const token = req.cookies?.jid;
    if(!token) return res.sendStatus(401);

    // check if exists in DB
    if(!(await refreshTokenExists(token))) return res.sendStatus(403);

    jwt.verify(token, REFRESH_TOKEN_SECRET, async (err, payload) => {
        if(err) return res.sendStatus(403);
        // payload should contain user id
        const userId = payload.id;
        const account = await db.collection('users').findOne({_id: new ObjectId(userId)});
        if(!account) return res.sendStatus(403);
        const accessToken = generateAccessToken(account);
        res.json({ accessToken });
    });
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
    const token = req.cookies?.jid;
    if(token) await removeRefreshToken(token);
    res.clearCookie('jid');
    res.sendStatus(204);
});

// Protected test route
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
});

console.log('Server running');

app.listen(5000);