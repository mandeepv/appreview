const jwt = require('jsonwebtoken');
const fs = require('fs');

// Your Apple credentials
const TEAM_ID = 'DX4F38J8H4';
const KEY_ID = '8SVB695TG5';
const CLIENT_ID = 'com.kinderwell.app.auth'; // Services ID

// Path to the Apple .p8 private key, read from APPLE_P8_PATH env var.
// Previously hardcoded to a per-machine ~/Downloads path (Fable 🟡 —
// invisible to anyone but Mandeep's laptop and easy to break by cleaning
// up Downloads or moving to a new machine). Now the caller passes:
//
//   APPLE_P8_PATH=/path/to/AuthKey_XXXX.p8 node generate_apple_jwt.js
//
// Long-term: move the .p8 into a secret manager (1Password, Doppler,
// etc.) so it never lives on disk except during the JWT-generation
// window. That's the reviewer's actual recommendation; env-var is the
// interim.
const p8Path = process.env.APPLE_P8_PATH;
if (!p8Path) {
  console.error(
    'ERROR: APPLE_P8_PATH env var not set.\n' +
    'Usage: APPLE_P8_PATH=/path/to/AuthKey_8SVB695TG5.p8 node generate_apple_jwt.js\n' +
    'See docs/APPLE_JWT_ROTATION.md for context.'
  );
  process.exit(1);
}
const privateKey = fs.readFileSync(p8Path, 'utf8');

// Create JWT claims
const now = Math.floor(Date.now() / 1000);
const claims = {
  iss: TEAM_ID,
  iat: now,
  exp: now + (86400 * 180), // 180 days (6 months)
  aud: 'https://appleid.apple.com',
  sub: CLIENT_ID
};

// Generate JWT
const token = jwt.sign(claims, privateKey, {
  algorithm: 'ES256',
  keyid: KEY_ID
});

console.log('\n=== Copy this JWT Secret for Supabase ===\n');
console.log(token);
console.log('\n');
