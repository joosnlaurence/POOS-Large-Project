// backend/__tests__/unit/buildings.test.js
import request from 'supertest';
import express from 'express';
import { createBuildingsRouter } from '../../routes/buildings.js';

function makeMockApp(overrides = {}) {
  const app = express();
  app.use(express.json());

  const mockCollection = {
    find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'fakeid' }),
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    ...overrides,
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  app.use('/api/buildings', createBuildingsRouter(mockDb));
  return { app, mockCollection };
}

describe('Buildings router – unit / validation', () => {
  test('create returns 400 when required fields missing', async () => {
    const { app } = makeMockApp();

    const res = await request(app)
      .post('/api/buildings/create')
      .send({ name: '', pinCoords: {} });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Missing fields');
  });

  test('update returns 400 when no valid fields to update', async () => {
    const { app } = makeMockApp();

    const res = await request(app)
      .post('/api/buildings/update')
      .send({ _id: '656565656565656565656565' }); // syntactically valid ObjectId

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('No valid fields to update');
  });
});
