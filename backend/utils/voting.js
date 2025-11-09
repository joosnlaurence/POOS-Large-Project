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