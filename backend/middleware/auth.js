import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../utils/tokens.js';

export function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;
        next();
    });
}