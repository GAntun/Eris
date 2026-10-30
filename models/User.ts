import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    nickname: string;
    avatar: string;
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    nickname: {
        type: String,
        trim: true,
        default: '',
        maxlength: 32
    },
    avatar: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Hashes a user's password before it is persisted.
 *
 * @returns A promise that resolves after the password has been hashed.
 * @remarks
 * The hook only runs when the `password` field is new or modified, preventing
 * an already-hashed password from being hashed again on unrelated saves.
 */
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compares a plaintext password with the stored password hash.
 *
 * @param this - User document whose `password` field contains the hash.
 * @param candidate - Plaintext password supplied during login or password change.
 * @returns A promise resolving to `true` when the password matches.
 */
userSchema.methods.comparePassword = function (this: IUser, candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
