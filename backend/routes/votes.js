import express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb'

import { verifyToken } from '../middleware/auth.js';

/*
    Votes are automatically deleted after 7 days using the MongoDB TTL index 
    option "expiresAfterSeconds: 604800". 
*/
export function createVotesRouter(db) {
    const router = express.Router();
   
    // POST /api/votes -  Add votes from the user
    router.post('/', verifyToken, async (req, res) => {
        // Expects { fountainId, rating } in body
        // Expects req.user.userId to be defined (from verifyToken)
        // Produces { success, error }

        const ret = {
            success: false,
            error: ''
        };

        
        try {
            let fountainId;
            try{
                fountainId = new ObjectId(req.body.fountainId);
            }catch(err) {
                ret.error = "Invalid fountainId format (must be ObjectId)";
                return res.status(400).json(ret);
            }
            const rating = req.body.rating;
            const userId = new ObjectId(req.user.userId);

            if(!fountainId || !rating) {
                ret.error = 'Missing fountainId or rating';
                return res.status(400).json(ret);
            }
            if(!['red', 'yellow', 'green'].includes(rating)){
                ret.error = "Rating must be either 'red', 'yellow', or 'green'";
                return res.status(400).json(ret);
            }

            const votes = db.collection('votes');
            
            const mostRecent = await votes.findOne(
                { userId, fountainId },
                { sort: { timestamp: -1 }} // retrieve most recent vote 
            );

            // Let the user update their vote if it was made recently
            if(!mostRecent) {
                await votes.insertOne({userId, fountainId, rating, timestamp: new Date()});
            }
            else {
                const hoursAferMostRecent = (Date.now() - mostRecent.timestamp.getTime()) / (1000 * 60 * 60);
                if(hoursAferMostRecent < 12) {
                    await votes.updateOne(
                        { _id: mostRecent._id },
                        { $set: {rating, timestamp: new Date()} }
                    );
                }
                else {
                    await votes.insertOne({userId, fountainId, rating, timestamp: new Date()});
                }
            }

            ret.success = true;
            res.status(200).json(ret);
        }
        catch(err) {
            console.error('Error in /api/votes: ', err.message);
            ret.error = "Error adding user's vote";
            res.status(500).json(ret);
        }
    });

    return router;
}

