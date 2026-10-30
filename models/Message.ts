import mongoose, { Document, Model } from 'mongoose';
import type { OgPreview } from '../og';
import type { YoutubeMeta } from '../youtube';

export interface ReplyTo {
    _id: mongoose.Types.ObjectId;
    username: string;
    nickname: string;
    text: string;
}

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    channel: string;
    username: string;
    text: string;
    og: OgPreview | null;
    youtube: YoutubeMeta | null;
    replyTo: ReplyTo | null;
    pinned: boolean;
    createdAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    channel: {
        type: String,
        required: true,
        default: 'general',
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000
    },
    og: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    youtube: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    replyTo: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    pinned: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
