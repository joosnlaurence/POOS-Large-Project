import request from 'supertest';
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

describe('POST /api/votes', () => {
    test('placeholder', () => {
        expect(1).toBe(1);
    });
});