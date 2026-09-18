const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Try to load .env.local if it exists to allow local overrides
const localEnvPath = path.join(__dirname, '.env.local');
const fs = require('fs');
if (fs.existsSync(localEnvPath)) {
    require('dotenv').config({ path: localEnvPath });
}

module.exports = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3200,
    mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eris_dev',
    basePath: process.env.BASE_PATH || '/eris'
};
