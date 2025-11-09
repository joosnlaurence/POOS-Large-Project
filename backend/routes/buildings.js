// routes/buildings.js
import express from 'express';
import { ObjectId } from 'mongodb';

/**
 * Contains the
 * GET  /list,
 * POST /get,
 * POST /create,
 * POST /update, and
 * POST /delete
 * endpoints
 * @param {*} db The MongoDB database to use (use either test or real db)
 * @returns A mini-app that contains the endpoints.
 */
export function createBuildingsRouter(db) {
  const router = express.Router();
  const Buildings = db.collection('buildings');

  // helpers
  const toOid = (id) => {
    try { return new ObjectId(id); } catch { return null; }
  };
  const toOids = (arr = []) =>
    (Array.isArray(arr) ? arr : []).map((x) => {
      try { return new ObjectId(x); } catch { return null; }
    }).filter(Boolean);

  // -----------------------
  // GET /list -> list all
  // produces: { buildings: [...], success: True|False, error: "" }
  router.get('/list', async (req, res) => {
    let ret = { buildings: [], success: false, error: '' };
    try {
      const list = await Buildings.find({}).toArray();
      ret.buildings = list;
      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/buildings/list:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /get -> fetch one building by _id
  // expects: { _id }
  // produces: { building, success, error }
  router.post('/get', async (req, res) => {
    let ret = { building: null, success: false, error: '' };
    try {
      const _id = toOid(req.body?._id);
      if (!_id) {
        ret.error = 'Invalid id';
        return res.status(400).json(ret);
      }

      const doc = await Buildings.findOne({ _id });
      if (!doc) {
        ret.error = 'Not found';
        return res.status(404).json(ret);
      }

      ret.building = doc;
      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/buildings/get:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /create -> create building
  // expects: { name, pinCoords: { latitude:number, longitude:number }, fountainIds?: [ObjectId|string] }
  // produces: { _id, success, error }
  router.post('/create', async (req, res) => {
    let ret = { _id: -1, success: false, error: '' };
    try {
      const { name, pinCoords, fountainIds = [] } = req.body || {};
      const lat = pinCoords?.latitude;
      const lon = pinCoords?.longitude;

      if (!name?.trim() || typeof lat !== 'number' || typeof lon !== 'number') {
        ret.error = 'Missing fields';
        return res.status(400).json(ret);
        }

      const doc = {
        name: name.trim(),
        pinCoords: { latitude: lat, longitude: lon },
        fountainIds: toOids(fountainIds)
      };

      const result = await Buildings.insertOne(doc);
      ret._id = result.insertedId;
      ret.success = true;
      res.status(201).json(ret);
    } catch (err) {
      console.error('Error in /api/buildings/create:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /update -> partial update
  // expects: { _id, name?, pinCoords?, fountainIds? }
  // produces: { success, error }
  router.post('/update', async (req, res) => {
    let ret = { success: false, error: '' };
    try {
      const _id = toOid(req.body?._id);
      if (!_id) {
        ret.error = 'Invalid id';
        return res.status(400).json(ret);
      }

      const update = {};
      if (typeof req.body?.name === 'string' && req.body.name.trim()) {
        update.name = req.body.name.trim();
      }
      if (req.body?.pinCoords &&
          typeof req.body.pinCoords.latitude === 'number' &&
          typeof req.body.pinCoords.longitude === 'number') {
        update.pinCoords = {
          latitude: req.body.pinCoords.latitude,
          longitude: req.body.pinCoords.longitude
        };
      }
      if (Array.isArray(req.body?.fountainIds)) {
        update.fountainIds = toOids(req.body.fountainIds);
      }

      if (Object.keys(update).length === 0) {
        ret.error = 'No valid fields to update';
        return res.status(400).json(ret);
      }

      const r = await Buildings.updateOne({ _id }, { $set: update });
      if (r.matchedCount === 0) {
        ret.error = 'Not found';
        return res.status(404).json(ret);
      }

      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/buildings/update:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /delete -> delete by _id
  // expects: { _id }
  // produces: { success, error }
  router.post('/delete', async (req, res) => {
    let ret = { success: false, error: '' };
    try {
      const _id = toOid(req.body?._id);
      if (!_id) {
        ret.error = 'Invalid id';
        return res.status(400).json(ret);
      }

      const r = await Buildings.deleteOne({ _id });
      if (r.deletedCount === 0) {
        ret.error = 'Not found';
        return res.status(404).json(ret);
      }

      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/buildings/delete:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  return router;
}
