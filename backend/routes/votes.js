import express from 'express';
import { ObjectId } from 'mongodb'

import { verifyToken } from '../middleware/auth.js';
import { findModeRating } from '../utils/voting.js';

/*
    Votes are automatically deleted after 2 days using the MongoDB TTL index 
*/
export function createVotesRouter(db) {
    const router = express.Router();
   
    // POST /api/votes -  Add votes from the user and updates the filter color of the fountain if needed
    router.post('/', verifyToken, async (req, res) => {
        /* Expects 
           { 
            fountainId: ObjectId, 
            rating: "red" | "yellow" | "green" 
           } in body
           Expects req.user.userId to be defined (from verifyToken)
          
           Produces 
           { 
            success: Boolean, 
            filterChanged: Boolean
            newFilterColor: String, 
            error: String
           }
        */

        const ret = {
            success: false,
            filterChanged: false,
            newFilterColor: '',
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
            console.log(req.user.userId);
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
                { sort: { timestamp: -1 }} // retrieve most recent vote for user at this fountain
            );

            if(!mostRecent) {
                await votes.insertOne({userId, fountainId, rating, timestamp: new Date()});
            }
            // Let the user update their vote if it was made recently
            else {
                const hoursAferMostRecent = (Date.now() - mostRecent.timestamp.getTime()) / (1000 * 60 * 60);
                if(hoursAferMostRecent < 2 ){
                    await votes.updateOne(
                        { _id: mostRecent._id },
                        { $set: {rating, timestamp: new Date()} }
                    );
                }
                else {
                    await votes.insertOne({userId, fountainId, rating, timestamp: new Date()});
                }
            }


            try {
                const fountains = db.collection('fountains');

                const fountain = await fountains.findOne({_id: fountainId});
                if(!fountain) {
                    throw new Error(`Fountain not found with _id: ${fountainId}`);
                }

                const oldRating = fountain.filter;
                const fountainVotes = await votes.find({fountainId: fountainId}).toArray();

                const newFilterColor = findModeRating(fountainVotes);
                // There should be at least one vote (the user's) for this fountain
                // If this is null (no votes to find mode for), something went wrong
                if(!newFilterColor) {
                    throw new Error('User\'s vote not inserted into database.');
                }
                
                if(newFilterColor !== oldRating){
                    ret.filterChanged = true;
                    await fountains.updateOne(
                        { _id: fountainId },
                        { $set: {filter: newFilterColor, lastUpdate: new Date()} }
                    );
                }
                ret.newFilterColor = newFilterColor;
            } catch(err) {
                console.log('Error in /api/votes: ', err.message);
                ret.error = "Error updating fountain filter"
                return res.status(500).json(ret);
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

