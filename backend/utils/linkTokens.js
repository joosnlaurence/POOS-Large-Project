import crypto from 'crypto';

// makes a random token + its SHA256 hash
export function newOneTimeToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash  = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashOneTimeToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
