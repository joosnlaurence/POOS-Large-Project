import request from 'supertest';
import { createApp } from '../../app.js';
import { setupDatabase, closeDatabase, reset } from '../setup.js';
import { ObjectId } from 'mongodb';
import { generateAccessToken } from '../../utils/tokens.js';
import { upsertVote } from '../../utils/voting.js';
import { createTestScheduler } from 'jest';

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
        expect(res.body.updatedVote).toBe(true);
        expect(res.body.filterChanged).toBe(true);
        expect(res.body.newFilterColor).toBe('green');
    });

    test('Handles when user\'s vote makes their rating the most popular', async () => {
        await validVote("green");
        await validVote("red");

        const res = await validVote("green");
        
        expect(res.body.updatedVote).toBe(false);
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