import crypto from 'crypto';

/** Make a 6-digit numeric code and its SHA-256 hash */
export function newOneTimeCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // "123456"
  const hash = hashOneTimeToken(code);
  return { code, hash };
}

/** Hash a token/code with SHA-256 (hex) */
export function hashOneTimeToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/** Now + N seconds as a Date (default 60s) */
export function expiresInSeconds(sec = 60) {
  return new Date(Date.now() + sec * 1000);
}
