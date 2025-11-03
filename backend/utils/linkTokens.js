export function newOneTimeCode() {
  // 6-digit numeric code as a string
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = hashOneTimeToken(code);
  return { code, hash };
}

// 60-second expiry window
export function expiresInSeconds(sec = 60) {
  return new Date(Date.now() + sec * 1000);
}
