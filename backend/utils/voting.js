/**
 * Finds the rating color with the highest number of votes. 
 * @param {Array} votes An array of the votes for a single fountain as fetched from the database. 
 * @returns The rating color with the highest number of votes. `null` if no votes were found
 */
export function findModeRating(votes) {
    const colorCounts = {red: 0, yellow: 0, green: 0};
    const mostRecentTimes = {};
    if(votes.length === 0) {
        return null;
    }
    try{
        votes.forEach(vote => {
            const color = vote.rating;
            colorCounts[color] += 1;
            
            const timestamp = vote.timestamp;
            
            // Find the last time each rating has been voted
            if (!mostRecentTimes[color] || timestamp > mostRecentTimes[color]) {
                mostRecentTimes[color] = timestamp;
            }
        });
        
        const maxCount = Math.max(...Object.values(colorCounts));
        const winners = Object.keys(colorCounts).filter(
            color => colorCounts[color] === maxCount
        );

        if(winners.length === 1) {
            return winners[0];
        }
        
        // If there is a tie, return the most recently voted rating
        return winners.reduce((mostRecent, color) => {
            return mostRecentTimes[color] > mostRecentTimes[mostRecent] ? color : mostRecent;
        });
    } catch(err) {
        console.error("Error in updateFilter(): ", err?.message);
        throw err;
    }
}

export function validateVote(fountainId, rating) {
    const errors = [];

    if(!fountainId) {
        errors.push("Missing fountainId");
    }
    if(!rating) {
        errors.push("Missing rating");
    }
    if (!['red', 'yellow', 'green'].includes(rating)) {
        errors.push("Rating must be either 'red', 'yellow', or 'green'");
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export const UPDATED_VOTE = 2;
export const ADDED_VOTE = 1;

export async function upsertVote(votesCollection, userId, fountainId, rating) {
    const mostRecent = await votesCollection.findOne(
        { userId, fountainId },
        { sort: { timestamp: -1 }} // retrieve most recent vote for user at this fountain
    );

    if(!mostRecent) {
        await votesCollection.insertOne({userId, fountainId, rating, timestamp: new Date()});
        return ADDED_VOTE;
    }
    
    // Let the user update their vote if it was made recently
    const hoursAferMostRecent = (Date.now() - mostRecent.timestamp.getTime()) / (1000 * 60 * 60);
    
    if(hoursAferMostRecent < 48){
        await votesCollection.updateOne(
            { _id: mostRecent._id },
            { $set: {rating} }
        );
        return UPDATED_VOTE;
    }
    else {
        await votesCollection.insertOne({userId, fountainId, rating, timestamp: new Date()});
        return ADDED_VOTE;
    }
}

export async function updateFountainFilter(db, fountainId) {
    const fountains = db.collection('fountains');
    const fountain = await fountains.findOne({_id: fountainId});
    if(!fountain) {
        throw new Error(`Fountain not found with _id: ${fountainId}`);
    }

    const oldRating = fountain.filter;
    const votes = db.collection('votes');
    const fountainVotes = await votes.find({fountainId: fountainId}).toArray();

    const newFilterColor = findModeRating(fountainVotes);
    // There should be at least one vote (the user's) for this fountain
    // If this is null (no votes to find mode for), something went wrong
    if(!newFilterColor) {
        throw new Error('User\'s vote not inserted into database.');
    }
    
    let filterChanged = false;

    if(newFilterColor !== oldRating){
        filterChanged = true;
        await fountains.updateOne(
            { _id: fountainId },
            { $set: {filter: newFilterColor, lastUpdate: new Date()} }
        );
    }

    return { filterChanged, newFilterColor };
}