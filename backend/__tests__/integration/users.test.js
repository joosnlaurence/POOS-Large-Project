/* This is similar to the mock database we already have, except that it runs 
   an actual MongoDB instance in RAM. Slower than the mock db, but better for
   integration tests since it installs all of the MongoDB functions. We might 
   use this later, but for now I want to test the mock database. */
// import { MongoMemoryServer } from 'mongodb-memory-server';

import { jest } from '@jest/globals';

// Mock the mailer BEFORE importing app code 
await jest.unstable_mockModule('../../utils/mailer.js', () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
}));

// We use supertest so we don't need to start up the server for testing
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../../app.js';
import { setupDatabase, closeDatabase, reset } from '../setup.js';
import { ObjectId } from 'mongodb';

let app, db;

beforeAll(async () => {
    db = await setupDatabase();
    app = createApp(db);
});

// Runs before each test
beforeEach(async () => {
    await reset(db);
});

afterAll(async () => {
    await closeDatabase();
});

function createValidUser(overrides = {}) {
    return {
        firstName: 'Laurence',
        lastName: 'Jackson',
        user: 'laurej',
        email: 'laurencejackson2@gmail.com',
        password: '123456789',
        ...overrides // In case you want to change any of the keys
    };
} 

async function registerUser(app, user) {
    return await request(app)
        .post('/api/users/register')
        .send(user);
}

describe('POST /api/users/register', () => {
    test('successfully register a valid user', async () => {
        const response = await registerUser(app, createValidUser())
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body._id).toBeDefined();
    });

    test('return 400 if missing fields', async () => {
        const badUser = {
            user: 'laurej'
        };

        const response = await request(app)
            .post('/api/users/register')
            .send(badUser)
            .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Missing fields');
    });

    test('return 409 if user already exists', async () => {
        const user = createValidUser();
        await registerUser(app, user)

        const response = await registerUser(app, user);
        
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Username/email already in use');
    }); 

    test('password hashing', async () => {
        const user = createValidUser();
        
        const response = await registerUser(app, user);

        const dbUser = await db.collection('users').findOne({_id: new ObjectId(response.body._id)});

        expect(await bcrypt.compare(user.password, dbUser.password)).toBe(true);
    });
});
