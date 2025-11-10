import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { 
    generateAccessToken,
    ACCESS_TOKEN_SECRET 
} from '../utils/tokens.js';

export function verifyToken(req, res, next) {
    let token;
    if (process.env.NODE_ENV === 'development') {
        const devUser = {
            _id: '690d02b181b430779f124555',
            firstName: 'dev',
            lastName: 'dev',
            user: 'devuser',
            email: 'dev@user.com',
            password: '$2b$10$ywxzcjOK54Rae1YkUCyyPuHrK.yo6nToPZpkYjBjnDGDxObVKWwFO'
        };
        token = generateAccessToken(devUser);
        // console.log("dev access token: " + token);
    }
    else{
        // Takes on "Bearer <access_token>"
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({success: false, error: 'No token provided'});
    }
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.status(403).json({success: false, error: 'Invalid token'});
        req.user = payload;
        next();
    });
}