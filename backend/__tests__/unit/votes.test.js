import { validateVote, findModeRating } from '../../utils/voting.js';

describe('voting.js unit testing', () => {
    describe('validateVote', () => {
        test('Missing fountainId', () => {
            const {valid, errors} = validateVote('', 'red');

            expect(valid).toBe(false);
            expect(errors.includes('Missing fountainId')).toBe(true);
        });

        test('Missing rating', () => {
            const {valid, errors} = validateVote('0', '');

            expect(valid).toBe(false);
            expect(errors.includes('Missing rating')).toBe(true);
        });
        
        test('Rating is not red, yellow, or green', () => {
            const {valid, errors} = validateVote('0', 'orange');

            expect(valid).toBe(false);
            expect(errors.includes(
                "Rating must be either 'red', 'yellow', or 'green'"
            )).toBe(true);
        });
    });

    describe('findModeRating', () => {                
        test('returns most voted for rating', () => {
            const votes = [
                {rating: 'green', timestamp: new Date()},
                {rating: 'green', timestamp: new Date()},
                {rating: 'green', timestamp: new Date()}
            ];

            const ret = findModeRating(votes);

            expect(ret).toBe('green');
        }); 

        test('return null if there are no votes', () => {
            const votes = [];

            const ret = findModeRating(votes);

            expect(ret).toBe(null);
        }); 

        test('resolves tie based on timestamp', () => {
            const now = new Date(Date.now());
            const threeHoursAgo = new Date(Date.now() - (3 * 60 * 60 * 1000));

            const votes = [
                {rating: 'green', timestamp: now},
                {rating: 'red', timestamp: threeHoursAgo}
            ];

            const ret = findModeRating(votes);

            expect(ret).toBe('green');
        }); 
    });
});