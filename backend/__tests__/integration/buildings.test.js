// backend/__tests__/integration/buildings.test.js
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import express from 'express';
import { createBuildingsRouter } from '../../routes/buildings.js';

let mongoServer;
let client;
let db;
let app;

beforeAll(async () => {
  // Spin up in-memory Mongo
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = await MongoClient.connect(uri, {});
  db = client.db('testdb');

  // Build a tiny app just for tests
  app = express();
  app.use(express.json());
  app.use('/api/buildings', createBuildingsRouter(db));
});

afterAll(async () => {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  // Clean collection before each test
  await db.collection('buildings').deleteMany({});
});

describe('Buildings router – integration', () => {
  test('POST /api/buildings/create creates a building', async () => {
    const res = await request(app)
      .post('/api/buildings/create')
      .send({
        name: 'Test Building',
        pinCoords: { latitude: 28.6, longitude: -81.2 },
        fountainIds: [],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body._id).toBeTruthy();
  });

  test('GET /api/buildings/list returns buildings', async () => {
    await db.collection('buildings').insertOne({
      name: 'Lib West',
      pinCoords: { latitude: 28.6, longitude: -81.2 },
      fountainIds: [],
    });

    const res = await request(app).get('/api/buildings/list');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.buildings)).toBe(true);
    expect(res.body.buildings.length).toBe(1);
    expect(res.body.buildings[0].name).toBe('Lib West');
  });

  test('POST /api/buildings/get with bad id returns 400', async () => {
    const res = await request(app)
      .post('/api/buildings/get')
      .send({ _id: 'not-a-valid-id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid id');
  });

  test('POST /api/buildings/update updates name', async () => {
    const { insertedId } = await db.collection('buildings').insertOne({
      name: 'Old Name',
      pinCoords: { latitude: 1, longitude: 2 },
      fountainIds: [],
    });

    const res = await request(app)
      .post('/api/buildings/update')
      .send({
        _id: insertedId.toString(),
        name: 'New Name',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await db.collection('buildings').findOne({ _id: insertedId });
    expect(updated.name).toBe('New Name');
  });

  test('POST /api/buildings/delete deletes a building', async () => {
    const { insertedId } = await db.collection('buildings').insertOne({
      name: 'Delete Me',
      pinCoords: { latitude: 1, longitude: 2 },
      fountainIds: [],
    });

    const res = await request(app)
      .post('/api/buildings/delete')
      .send({ _id: insertedId.toString() });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await db.collection('buildings').findOne({ _id: insertedId });
    expect(found).toBeNull();
  });
});
