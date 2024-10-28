require('dotenv').config();
const { execSync } = require('node:child_process');

const apiKey = process.env.MOZILLA_API_KEY;
const apiSecret = process.env.MOZILLA_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('MOZILLA_API_KEY and MOZILLA_API_SECRET must be set in .env file');
}

const command = `web-ext sign --api-key ${apiKey} --api-secret ${apiSecret} --artifacts-dir builds/artifacts --channel unlisted -s builds/firefox`;

execSync(command, { stdio: 'inherit' });
