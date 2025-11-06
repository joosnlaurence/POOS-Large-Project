import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Import our utility functions for using tokens
import {
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    removeRefreshToken,
    refreshTokenExists,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_DAYS
} from '../utils/tokens.js';

// Import utility for email verification and password reset
import { sendMail } from '../utils/mailer.js';

/**
 * Modularizes the API endpoints related to user accounts for ease of use in production and testing.
 * Contains the 
 * POST /login, 
 * POST /register, 
 * POST /refresh, and
 * POST /logout,
 * endpoints
 * @param {*} db The MongoDB database to use (use either test or real db)
 * @returns A mini-app that contains the endpoints.
 */
export function createUsersRouter(db) {
    const router = express.Router();
    
    router.post('/login', async (req, res, next) => {
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
            await storeRefreshToken(db, refreshToken, account._id);

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
            console.error('Error in /api/users/login:', err.message);
            ret.success = false;
            ret.error = 'Database error occurred';
            res.status(500).json(ret);
        }
    });

        router.post('/register', async (req, res, next) => {
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
                password: hashed,
                isVerified: false
            });

            // Generate a short-lived verification token (1 hour)
            const verifyToken = jwt.sign(
                { id: newAccount.insertedId.toString(), email: email },
                process.env.JWT_EMAIL_SECRET || 'temp_secret',
                { expiresIn: '1h' }
            );

            // Create a verification URL pointing to your backend route below
            const verifyUrl = `http://4lokofridays.com/home?token=${encodeURIComponent(verifyToken)}`;

            try {
                await sendMail({
                to: email,
                subject: 'Verify your email',
                html: `
                    <p>Hi ${firstName},</p>
                    <p>Click below to verify your email:</p>
                    <a href="${verifyUrl}">${verifyUrl}</a>
                    <p>(This link expires in 1 hour)</p>
                `
             });
            console.log('✅ Sent verification link to', email);
        } catch (mailErr) {
            console.error('❌ Failed to send verification email:', mailErr.message);
        }
         
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
    router.post('/refresh', async (req, res) => {
        const token = req.cookies?.jid;
        if(!token) return res.sendStatus(401);

        // check if exists in DB
        if(!(await refreshTokenExists(db, token))) return res.sendStatus(403);

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
    router.post('/logout', async (req, res) => {
        const token = req.cookies?.jid;
        if(token) await removeRefreshToken(db, token);
        res.clearCookie('jid');
        res.sendStatus(204);
    });    

return router;
}
