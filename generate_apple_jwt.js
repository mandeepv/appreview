const jwt = require('jsonwebtoken');
const fs = require('fs');

// Your Apple credentials
const TEAM_ID = 'DX4F38J8H4';
const KEY_ID = '8SVB695TG5';
const CLIENT_ID = 'com.kinderwell.app.auth'; // Services ID

// Read the private key
const privateKey = fs.readFileSync('/Users/mandeepverma/Downloads/AuthKey_8SVB695TG5.p8', 'utf8');

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
