import request from 'supertest';
import { createApp } from '../../app.js';
import { setupDatabase, closeDatabase, reset } from '../setup.js';
import { ObjectId } from 'mongodb';
import { generateAccessToken } from '../../utils/tokens.js';
import { validateVote, findModeRating } from '../../utils/voting.js';

let app, db;
let fountainId;
let fountains, votes;
let testUserId, testAccessToken;

beforeAll(async () => {
    db = await setupDatabase();
    app = createApp(db);

    fountains = db.collection('fountains');
    votes = db.collection('votes');
});

function createValidVote(rating = "green") {
    return {
        fountainId,
        rating
    };
}

async function validVote(rating = "green", newUser=true) {
    let accessTok;
    if(newUser){ 
        accessTok = generateAccessToken({
            _id: new ObjectId(),
            user: 'test'
        });
    }
    else {
        accessTok = testAccessToken;
    }
    
    return await request(app)
            .post('/api/votes/add')
            .send(createValidVote(rating))
            .set('Authorization', `Bearer ${accessTok}`)
            .expect(200);
}

async function createUser() {
    const userId = new ObjectId();
    return {
        userId,
        accessToken: generateAccessToken({_id: userId, user: 'test'})
    };
}

describe('POST /api/votes/add', () => {
    beforeEach(async () => {
        const response = await request(app)
            .post('/api/fountains/create')
            .send({
                location: {
                    building: "Test",
                },
                filter: "green"
            });
        fountainId = response.body._id;
        const {userId, accessToken} = await createUser();
        testUserId = userId;
        testAccessToken = accessToken;
    });

    afterEach(async () => {
        await reset(db);
    });

    afterAll(async () => {
        await closeDatabase();
    });    

    test('Can add a single vote', async () => {
        const response = await validVote();

        expect(response.body).toMatchObject({
            success: expect.any(Boolean),
            filterChanged: expect.any(Boolean),
            newFilterColor: expect.any(String),
            error: expect.any(String)
        });
        expect(response.body.success).toBe(true);
        expect(response.body.error).toBe("");
    });

    test('Can update votes if made in less than 12 hours', async () => {
        await validVote('red', newUser=false);
        const res = await validVote('green', newUser=false);

        const v = await votes.find({}).toArray();

        expect(v.length).toBe(1);
        expect(res.body.filterChanged).toBe(true);
        expect(res.body.newFilterColor).toBe('green');
    });

    test('User can add new vote if made in more than 12 hours', async () => {
        const now = new Date(Date.now());
        const threeHoursAgo = new Date(Date.now() - (3 * 60 * 60 * 1000));

        await votes.insertOne({
            userId: testUserId,
            fountainId,
            rating: 'green',
            timestamp: now
        });
        await votes.insertOne({
            userId: testUserId,
            fountainId,
            rating: 'green',
            timestamp: threeHoursAgo
        });
        const res = await votes.find({}).toArray();

        expect(res.length).toBeGreaterThan(1);
    });

    test('Handles when user\'s vote makes their rating the most popular', async () => {
        await validVote("green");
        await validVote("red");

        const res = await validVote("green");
        
        expect(res.body.filterChanged).toBe(true);
        expect(res.body.newFilterColor).toBe("green");
    });

    test('Handles voting ties correctly', async () => {
        let response = await validVote("red");

        expect(response.body.filterChanged).toBe(true);
        expect(response.body.newFilterColor).toBe("red");

        response = await validVote("green");
        
        expect(response.body.filterChanged).toBe(true);
        expect(response.body.newFilterColor).toBe("green");
    });

    test('Handles when user votes for the most popular rating', async () => {
        await validVote("red");
        const response = await validVote("red");

        expect(response.body.filterChanged).toBe(false);
        expect(response.body.newFilterColor).toBe('');        
    });

    test('Handles when user\'s vote doesn\'t change the filter', async () => {
        await validVote("red");
        await validVote("red");
        const response = await validVote("green");

        expect(response.body.filterChanged).toBe(false);
        expect(response.body.newFilterColor).toBe('');        
    });
});

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