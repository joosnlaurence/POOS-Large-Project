import jwt from 'jsonwebtoken';

// JWT / token configuration
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '24h'; // jwt expiresIn syntax
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);

export function generateAccessToken(user) {
    return jwt.sign(
        { userId: String(user._id), user: user.user }, 
        ACCESS_TOKEN_SECRET, 
        { expiresIn: ACCESS_TOKEN_TTL }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        { userId: String(user._id) }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: `${REFRESH_TOKEN_DAYS}d` }
    );
}

export async function storeRefreshToken(db, token, userId) {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await db.collection('refreshTokens').insertOne({ token, userId, createdAt: new Date(), expiresAt });
}

export async function removeRefreshToken(db, token) {
    await db.collection('refreshTokens').deleteOne({ token });
}

export async function refreshTokenExists(db, token) {
    const doc = await db.collection('refreshTokens').findOne({ token });
    return !!doc;
}

export { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_DAYS };