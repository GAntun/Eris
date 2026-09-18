const mongoose = require('mongoose');
const config = require('./config');

const MONGODB_URI = config.mongodbUri;

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = { connectDB, MONGODB_URI };
