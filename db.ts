import mongoose from 'mongoose';
import config from './config';

const MONGODB_URI = config.mongodbUri;

/**
 * Opens the application's MongoDB connection.
 *
 * @returns A promise that resolves after Mongoose has connected successfully.
 * @remarks
 * A connection failure is logged and terminates the process with exit code `1`
 * because the application cannot serve requests without a database.
 */
async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('MongoDB connection error:', message);
        process.exit(1);
    }
}

export { connectDB, MONGODB_URI };
