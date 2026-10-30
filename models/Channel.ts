import mongoose, { Document, Model } from 'mongoose';

export type ChannelType = 'text' | 'voice';

export interface IChannel extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    creator: string;
    type: ChannelType;
    createdAt: Date;
}

const channelSchema = new mongoose.Schema<IChannel>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        maxlength: 30,
        match: /^[a-zA-Z0-9-_]+$/
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: 200
    },
    creator: {
        type: String,
        default: 'system'
    },
    type: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Channel: Model<IChannel> = mongoose.model<IChannel>('Channel', channelSchema);

export default Channel;
