import request from 'supertest';
import { createApp, setupDatabase } from '../../app.js';

let app, db;

beforeAll(async () => {
    console.log("MONGO_URI " + process.env.MONGO_URI);
    db = await setupDatabase();
    app = createApp(db);
});

// Runs before each test
beforeEach(async () => {
    if(db.reset) {
        await db.reset();
    }
});

describe('POST /api/votes', () => {
    test('placeholder', () => {
        expect(1).toBe(1);
    });
});