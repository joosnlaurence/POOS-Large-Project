import 'dotenv/config';

import express from 'express';
import cors from 'cors';

const app = express();
// Just allow everything for now
app.use(cors());
// app.use(cors({
//     origin: (origin, callback) => {
//         const allowed = [
//             'http://4lokofridays.com',
//             'http://www.4lokofridays.com'
//         ]

//         if(!origin || allowed.includes(origin)) 
//             return callback(null, true);

//         return callback(new Error('Origin not allowed by CORS options'));
//     }
// }));
app.use(express.json());

import { MongoClient } from 'mongodb';
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);
await client.connect();
const db = client.db('large-proj-data');

app.post('/api/login', async (req, res, next) => 
{
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
    }

    try {
        // TODO: hash passwords in database
        const {ident, password} = req.body;

        if(!(ident?.trim()) || !(password?.trim())){
            ret.error = 'Missing fields';
            res.status(400).json(ret);
            return;
        }

        const account = await db.collection('users').findOne({
            // User can login via either username or email
            $or: [
                {user: ident},
                {email: ident}
            ],
        });

        if(!account || account.password !== password){
            ret.error = 'Invalid username/password';
            res.status(401).json(ret);
            return;
        }

        ret._id = account._id;
        ret.firstName = account.firstName;
        ret.lastName = account.lastName;
        ret.email = account.email;
        ret.success = true;
        res.status(200).json(ret);
    }
    catch(err) {
        console.error('MongoDB Error:', err.message);
        ret.success = false;
        ret.error = 'Database error occurred';
        res.status(500).json(ret);
    }
});

app.post('/api/register', async (req, res, next) => 
{
    // expects: {firstName, lastName, user, email, password}
    // produces: {_id: ObjectId(...), success: True | False, error: ""}

    // use mongodb indexing

    let ret = {
        _id: -1,
        success: false,
        error: ''
    };

    try {
        const {firstName, lastName, user, email, password} = req.body;
        
        if(!(firstName?.trim()) || !(user?.trim() || !(email?.trim()) || !(password?.trim()))){
            ret.error = 'Missing fields';
            res.status(400).json(ret);
            return;
        }

        const newAccount = await db.collection('users').insertOne({
            firstName: firstName,
            lastName: lastName,
            user: user,
            email: email,
            password: password
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

console.log('Server running');

app.listen(5000);