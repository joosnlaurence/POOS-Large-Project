// backend/__tests__/integration/fountains.test.js
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import { createFountainsRouter } from '../../routes/fountains.js';

let mongoServer;
let client;
let db;
let app;

beforeAll(async () => {
  // In-memory Mongo for tests
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = await MongoClient.connect(uri, {});
  db = client.db('testdb');

  app = express();
  app.use(express.json());
  app.use('/api/fountains', createFountainsRouter(db));
});

afterAll(async () => {
  if (client) await client.close();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('fountains').deleteMany({});
  await db.collection('buildings').deleteMany({});
});

describe('Fountains router – integration', () => {
  test('POST /api/fountains/create creates a fountain', async () => {
    const res = await request(app)
      .post('/api/fountains/create')
      .send({
        location: { building: 'Lib West', description: 'Near entrance' },
        filter: 'green',
        floor: 2,
        imgUrl: 'https://example.com/fountain.jpg',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body._id).toBeTruthy();

    const saved = await db
      .collection('fountains')
      .findOne({ _id: new ObjectId(res.body._id) });

    expect(saved.location.building).toBe('Lib West');
    expect(saved.filter).toBe('green');
  });

  test('GET /api/fountains/list returns fountains', async () => {
    await db.collection('fountains').insertOne({
      location: { building: 'Eng 1', description: '', coordinates: null },
      floor: 1,
      imgUrl: 'img',
      filter: 'yellow',
      lastUpdate: new Date(),
    });

    const res = await request(app).get('/api/fountains/list');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.fountains)).toBe(true);
    expect(res.body.fountains.length).toBe(1);
    expect(res.body.fountains[0].location.building).toBe('Eng 1');
  });

  test('POST /api/fountains/get with bad id returns 400', async () => {
    const res = await request(app)
      .post('/api/fountains/get')
      .send({ _id: 'not-a-valid-id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('
