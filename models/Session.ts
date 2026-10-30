import mongoose, { Document, Model } from 'mongoose';

export interface ISession extends Document {
    _id: mongoose.Types.ObjectId;
    token: string;
    username: string;
    createdAt: Date;
    expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<ISession>({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session: Model<ISession> = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
