import express from 'express';
import { ObjectId } from 'mongodb'

import { verifyToken } from '../middleware/auth.js';
import { 
    findModeRating,
    validateVote,
    upsertVote,
    updateFountainFilter
} from '../utils/voting.js';

/*
    Votes are automatically deleted after 2 days using the MongoDB TTL index 
*/
export function createVotesRouter(db) {
    const router = express.Router();
   
    /*  POST /api/votes/add - Add votes from the user and updates the filter color of the fountain if needed
        Expects 
        { 
        fountainId: ObjectId, 
        rating: "red" | "yellow" | "green" 
        } in body
        Expects req.user.userId to be defined (from verifyToken)
        
        Produces 
        { 
        success: Boolean, 
        filterChanged: Boolean,
        newFilterColor: String, 
        error: String
        }
    */
    router.post('/add', verifyToken, async (req, res) => {
        const ret = {
            success: false,
            filterChanged: false,
            newFilterColor: '',
            error: ''
        };

        
        try {
            const userId = new ObjectId(req.user.userId);

            let fountainId;
            try{
                fountainId = new ObjectId(req.body.fountainId);
            }catch(err) {
                ret.error = "Invalid fountainId format (must be ObjectId)";
                return res.status(400).json(ret);
            }
            
            const rating = req.body.rating;

            // Validate incoming vote requests
            const {validReq, errors} = validateVote(fountainId, rating);
            if(!validReq) {
                ret.error = errors.join(', ');
                return res.status(400).json(ret);
            }

            
            const votes = db.collection('votes');
            
            await upsertVote(votes, userId, fountainId, rating);

            try {
                const { filterChanged, newFilterColor } = await updateFountainFilter(db, fountaindId);
                ret.filterChanged = filterChanged;
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

    router.get('/')

    return router;
}

