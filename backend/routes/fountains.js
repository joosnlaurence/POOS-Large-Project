// routes/fountains.js
import express from 'express';
import { ObjectId } from 'mongodb';

/**
 * Modularizes the API endpoints related to campus fountains.
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
export function createFountainsRouter(db) {
  const router = express.Router();
  const Fountains = db.collection('fountains');
  const Buildings = db.collection('buildings');

  // helpers
  const toOid = (id) => { try { return new ObjectId(id); } catch { return null; } };

  const coerceDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // -----------------------
  // GET /list -> list all fountains
  // produces: { fountains: [...], success: True|False, error: "" }
  router.get('/list', async (req, res) => {
    let ret = { fountains: [], success: false, error: '' };
    try {
      const list = await Fountains.find({}).toArray();
      ret.fountains = list;
      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/fountains/list:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /get -> fetch one fountain by _id
  // expects: { _id }
  // produces: { fountain, success, error }
  router.post('/get', async (req, res) => {
    let ret = { fountain: null, success: false, error: '' };
    try {
      const _id = toOid(req.body?._id);
      if (!_id) {
        ret.error = 'Invalid id';
        return res.status(400).json(ret);
      }

      const doc = await Fountains.findOne({ _id });
      if (!doc) {
        ret.error = 'Not found';
        return res.status(404).json(ret);
      }

      ret.fountain = doc;
      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/fountains/get:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /create -> create fountain
  // expects:
  // {
  //   location: { building: string, description?: string, coordinates?: any },
  //   filter: "null" | "red" | "yellow" | "green",
  //   lastUpdate?: Date|string,
  //   buildingId?: ObjectId|string   // optional: to sync buildings.fountainIds
  // }
  // produces: { _id, success, error }
  router.post('/create', async (req, res) => {
    let ret = { _id: -1, success: false, error: '' };
    try {
      const { location, filter, lastUpdate, buildingId } = req.body || {};

      const buildingName = location?.building;
      if (!buildingName || !filter) {
        ret.error = 'Missing fields';
        return res.status(400).json(ret);
      }

      const doc = {
        location: {
          building: buildingName,
          description: location?.description || '',
          coordinates: location?.coordinates ?? null
        },
        filter: String(filter),
        lastUpdate: coerceDate(lastUpdate) || new Date()
      };

      const result = await Fountains.insertOne(doc);
      ret._id = result.insertedId;

      // Optional: link to building if buildingId provided
      const bId = toOid(buildingId);
      if (bId) {
        try {
          await Buildings.updateOne(
            { _id: bId },
            { $addToSet: { fountainIds: result.insertedId } }
          );
        } catch (linkErr) {
          console.warn('Linking fountain to building failed (non-fatal):', linkErr?.message || linkErr);
        }
      }

      ret.success = true;
      res.status(201).json(ret);
    } catch (err) {
      console.error('Error in /api/fountains/create:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /update -> partial update
  // expects: { _id, location?, filter?, lastUpdate?, buildingId? }
  // - If buildingId is supplied, will ensure the fountain id exists in that building's fountainIds.
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

      if (req.body?.location) {
        const l = req.body.location;
        const loc = {};
        if (typeof l.building === 'string' && l.building.trim()) loc.building = l.building.trim();
        if (typeof l.description === 'string') loc.description = l.description;
        if ('coordinates' in l) loc.coordinates = l.coordinates ?? null;
        if (Object.keys(loc).length) update['location'] = loc;
      }

      if (typeof req.body?.filter === 'string') {
        update['filter'] = req.body.filter;
      }

      if (req.body?.lastUpdate) {
        const d = coerceDate(req.body.lastUpdate);
        if (d) update['lastUpdate'] = d;
      }

      if (Object.keys(update).length === 0 && !req.body?.buildingId) {
        ret.error = 'No valid fields to update';
        return res.status(400).json(ret);
      }

      // Perform the doc update first if needed
      if (Object.keys(update).length) {
        const r = await Fountains.updateOne({ _id }, { $set: update });
        if (r.matchedCount === 0) {
          ret.error = 'Not found';
          return res.status(404).json(ret);
        }
      }

      // Optional: (re)link to building if buildingId provided
      const bId = toOid(req.body?.buildingId);
      if (bId) {
        try {
          await Buildings.updateOne(
            { _id: bId },
            { $addToSet: { fountainIds: _id } }
          );
        } catch (linkErr) {
          console.warn('Linking fountain to building failed (non-fatal):', linkErr?.message || linkErr);
        }
      }

      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/fountains/update:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  // -----------------------
  // POST /delete -> delete by _id
  // expects: { _id }
  // Also removes the fountain id from any buildings.fountainIds.
  // produces: { success, error }
  router.post('/delete', async (req, res) => {
    let ret = { success: false, error: '' };
    try {
      const _id = toOid(req.body?._id);
      if (!_id) {
        ret.error = 'Invalid id';
        return res.status(400).json(ret);
      }

      const r = await Fountains.deleteOne({ _id });
      if (r.deletedCount === 0) {
        ret.error = 'Not found';
        return res.status(404).json(ret);
      }

      // Best-effort: remove from all buildings
      try {
        await Buildings.updateMany(
          { fountainIds: _id },
          { $pull: { fountainIds: _id } }
        );
      } catch (unlinkErr) {
        console.warn('Unlinking fountain from buildings failed (non-fatal):', unlinkErr?.message || unlinkErr);
      }

      ret.success = true;
      res.status(200).json(ret);
    } catch (err) {
      console.error('Error in /api/fountains/delete:', err?.message || err);
      ret.error = 'Database error occurred';
      res.status(500).json(ret);
    }
  });

  return router;
}
