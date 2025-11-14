// backend/__tests__/unit/fountains.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createFountainsRouter } from '../../routes/fountains.js';

function makeMockApp() {
  const app = express();
  app.use(express.json());

  const mockFountains = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn().mockResolvedValue(null),
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'fakeid' }),
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };

  const mockBuildings = {
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  };

  const mockDb = {
    collection: jest.fn((name) => {
      if (name === 'fountains') return mockFountains;
      if (name === 'buildings') return mockBuildings;
      throw new Error(`Unexpected collection: ${name}`);
    }),
  };

  app.use('/api/fountains', createFountainsRouter(mockDb));
  return { app, mockFountains, mockBuildings };
}

describe('Fountains router – unit / validation', () => {
  test('create returns 400 when required fields missing', async () => {
    const { app } = makeMockApp();

    const res = await request(app)
      .post('/api/fountains/create')
      .send({
        location: { description: 'Somewhere' },
        imgUrl: 'img',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Missing fields');
  });

  test('update returns 400 when id is invalid', async () => {
    const { app } = makeMockApp();

    const res = await request(app)
      .post('/api/fountains/update')
      .send({
        _id: 'not-a-valid-id',
        filter: 'green',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid id');
  });

  test('update returns 400 when no fields to update and no buildingId', async () => {
    const { app } = makeMockApp();

    const res = await request(app)
      .post('/api/fountains/update')
      .send({
        _id: '656565656565656565656565',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('No valid fields to update');
  });
});
