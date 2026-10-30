import express, { type NextFunction, type Request, type Response } from 'express';
import http from 'http';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import { connectDB } from './db';
import User, { type IUser } from './models/User';
import Message, { type IMessage, type ReplyTo } from './models/Message';
import Session from './models/Session';
import Channel, { type IChannel } from './models/Channel';
import { extractLinkPreview } from './og';
import { extractYoutube } from './youtube';
import config from './config';

declare module 'socket.io' {
    interface Socket {
        username: string;
        currentChannel?: string;
        currentVoice?: string | null;
    }
}

interface VoiceSignalData {
    to?: string;
    channel?: string;
    [key: string]: unknown;
}

const ALLOWED_MIME_TYPES = new Map<string, string>([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif']
]);

const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const BASE_PATH = config.basePath;

/**
 * Resolves the project root directory that contains the `public` folder.
 *
 * @returns The absolute path to the project root.
 * @remarks
 * The source directory, its parent, and the current working directory are
 * checked so paths work from both TypeScript sources and compiled `build/` output.
 */
function findProjectRoot(): string {
    const candidates = [
        __dirname,
        path.resolve(__dirname, '..'),
        process.cwd()
    ];
    return candidates.find((candidate) => fs.existsSync(path.join(candidate, 'public'))) ?? process.cwd();
}

const ROOT_DIR = findProjectRoot();

/**
 * Extracts a human-readable message from an unknown thrown value.
 *
 * @param err - Value caught from a promise or synchronous operation.
 * @returns The error message, or the string representation of `err`.
 */
function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

/**
 * Reads a database or system error code from an unknown thrown value.
 *
 * @param err - Value caught from a database operation.
 * @returns The string or numeric `code` property, or `undefined` when absent.
 * @remarks
 * Used to detect MongoDB duplicate-key errors (`11000`) without assuming the
 * caught value is a specific error class.
 */
function errorCode(err: unknown): string | number | undefined {
    if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code?: unknown }).code;
        return typeof code === 'string' || typeof code === 'number' ? code : undefined;
    }
    return undefined;
}

/**
 * Prefixes a public asset path with the configured base path.
 *
 * @param p - Asset path stored in the database, such as `/uploads/avatars/a.png`.
 * @returns The base-path-prefixed URL, an empty string for missing input, or `p` unchanged when not absolute.
 * @remarks
 * Paths already beginning with `BASE_PATH` are returned as-is to avoid double prefixes.
 */
function assetUrl(p: string | null | undefined): string {
    if (!p || !p.startsWith('/')) return p || '';
    return p.startsWith(BASE_PATH) ? p : BASE_PATH + p;
}

/**
 * Converts a stored avatar path into a client-accessible URL.
 *
 * @param p - Stored avatar path or `null`/`undefined`.
 * @returns The base-path-prefixed avatar URL.
 */
function avatarUrl(p: string | null | undefined): string {
    return assetUrl(p);
}

const uploadsDir = path.join(ROOT_DIR, 'public', 'uploads', 'avatars');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadsDir,
    /**
     * Generates a unique filename for an uploaded avatar.
     *
     * @param _req - Express request, unused.
     * @param file - Uploaded file whose MIME type determines the extension.
     * @param cb - Multer callback invoked with the generated filename.
     * @remarks
     * The name combines a timestamp with random bytes to avoid collisions.
     */
    filename: (_req, file, cb) => {
        const ext = ALLOWED_MIME_TYPES.get(file.mimetype) ?? '';
        cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    }
});

const avatarUpload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    /**
     * Accepts only supported image MIME types for avatar uploads.
     *
     * @param _req - Express request, unused.
     * @param file - Uploaded file to validate.
     * @param cb - Multer callback receiving an error or acceptance flag.
     */
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
        }
        cb(null, true);
    }
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { path: BASE_PATH + '/socket.io' });

app.use(express.json());
app.use(cookieParser());

// Serve the static HTML file and uploaded avatars under the /eris path
app.use(BASE_PATH + '/', express.static(path.join(ROOT_DIR, 'public')));

/**
 * Redirects the bare root URL to the application's base path.
 *
 * @param _req - Express request, unused.
 * @param res - Express response used for the redirect.
 */
app.get('/', (_req, res) => res.redirect(BASE_PATH + '/'));

// In-memory username -> avatar cache
const avatarCache = new Map<string, string>();
const nicknameCache = new Map<string, string>();

/**
 * Shapes a user document for API and socket responses.
 *
 * @param user - User fields to serialize.
 * @returns A client-safe user object with a resolved avatar URL.
 * @remarks
 * Falls back to the username when no nickname is set.
 */
function userPayload(user: Pick<IUser, 'username' | 'nickname' | 'avatar'>) {
    return {
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: avatarUrl(user.avatar)
    };
}

/**
 * Shapes a channel document for API and socket responses.
 *
 * @param c - Channel fields to serialize.
 * @returns A plain channel object with an empty description fallback.
 */
function channelPayload(c: Pick<IChannel, '_id' | 'name' | 'description' | 'creator' | 'type'>) {
    return { _id: c._id, name: c.name, description: c.description || '', creator: c.creator, type: c.type };
}

/**
 * Shapes a message document for API and socket responses.
 *
 * @param m - Message document to serialize.
 * @returns A plain message object enriched with cached nickname and avatar data.
 * @remarks
 * Link previews, YouTube metadata, and reply data are normalized to `null` when absent.
 */
function messagePayload(m: IMessage) {
    return {
        _id: m._id,
        channel: m.channel,
        username: m.username,
        nickname: nicknameCache.get(m.username) || m.username,
        text: m.text,
        createdAt: m.createdAt,
        avatar: avatarCache.get(m.username) || '',
        og: m.og || null,
        youtube: m.youtube || null,
        replyTo: m.replyTo || null,
        pinned: !!m.pinned
    };
}

// Voice-chat state: channel name -> Set of usernames, and username -> socketId
const voiceRooms = new Map<string, Set<string>>();
const screenRooms = new Map<string, Set<string>>();
const usernameSockets = new Map<string, string>();

/**
 * Lists users currently sharing their screen in a channel.
 *
 * @param channel - Channel name to inspect.
 * @returns Participant objects with cached nickname and avatar data.
 */
function screenParticipants(channel: string) {
    return Array.from(screenRooms.get(channel) || []).map((username) => ({
        username,
        nickname: nicknameCache.get(username) || username,
        avatar: avatarCache.get(username) || ''
    }));
}

/**
 * Emits the current screen-sharing state for a channel.
 *
 * @param channel - Channel name to broadcast to, or a falsy value to skip.
 * @returns Nothing.
 */
function broadcastScreenState(channel: string | null | undefined): void {
    if (!channel) return;
    io.to(channel).emit('screen share state', {
        channel,
        sharers: screenParticipants(channel)
    });
}

/**
 * Lists users currently connected to a voice channel.
 *
 * @param channel - Voice channel name to inspect.
 * @returns Participant objects with cached nickname and avatar data.
 */
function voiceParticipants(channel: string) {
    return Array.from(voiceRooms.get(channel) || []).map((username) => ({
        username,
        nickname: nicknameCache.get(username) || username,
        avatar: avatarCache.get(username) || ''
    }));
}

/**
 * Emits the current voice participant list for a channel.
 *
 * @param channel - Channel name to broadcast to, or a falsy value to skip.
 * @returns Nothing.
 */
function broadcastVoiceParticipants(channel: string | null | undefined): void {
    if (!channel) return;
    io.to(channel).emit('voice participants', {
        channel,
        users: voiceParticipants(channel)
    });
}

// Users currently connected to the server (username -> socketId map)
/**
 * Lists all users with an active socket connection.
 *
 * @returns Connected user objects with cached nickname and avatar data.
 */
function onlineUsers() {
    return Array.from(usernameSockets.keys()).map((username) => ({
        username,
        nickname: nicknameCache.get(username) || username,
        avatar: avatarCache.get(username) || ''
    }));
}

/**
 * Emits the current online-user list to every connected client.
 *
 * @returns Nothing.
 */
function broadcastOnlineUsers(): void {
    io.emit('users online', onlineUsers());
}

/**
 * Removes a socket from its current voice channel and screen-sharing state.
 *
 * @param socket - Authenticated socket to remove.
 * @returns Nothing.
 * @remarks
 * Broadcasts updated participant and screen-sharing lists for the affected room.
 */
function leaveVoiceSocket(socket: Socket): void {
    if (!socket.currentVoice) return;
    const room = socket.currentVoice;
    socket.leave(room);
    socket.currentVoice = null;
    const members = voiceRooms.get(room);
    if (members) {
        members.delete(socket.username);
        if (members.size === 0) voiceRooms.delete(room);
    }
    leaveScreenSocket(socket, room);
    broadcastVoiceParticipants(room);
}

/**
 * Removes a socket from a channel's screen-sharing list.
 *
 * @param socket - Authenticated socket to remove.
 * @param room - Channel name to leave; defaults to the socket's current voice channel.
 * @returns Nothing.
 */
function leaveScreenSocket(socket: Socket, room: string | null | undefined = socket.currentVoice): void {
    if (!room) return;
    const sharers = screenRooms.get(room);
    if (!sharers || !sharers.has(socket.username)) return;
    sharers.delete(socket.username);
    if (sharers.size === 0) screenRooms.delete(room);
    broadcastScreenState(room);
}

/**
 * Adds a socket to a channel's screen-sharing list.
 *
 * @param socket - Authenticated socket that started sharing.
 * @param room - Channel name where screen sharing is active.
 * @returns Nothing.
 * @remarks
 * Any previous screen-sharing membership for the same socket and room is removed first.
 */
function joinScreenSocket(socket: Socket, room: string): void {
    leaveScreenSocket(socket, room);
    if (!screenRooms.has(room)) screenRooms.set(room, new Set());
    screenRooms.get(room)!.add(socket.username);
    broadcastScreenState(room);
}

/**
 * Relays a WebRTC signaling message to another user in the same voice channel.
 *
 * @param socket - Sender socket.
 * @param event - Socket event name to emit on the target socket.
 * @param data - Signal payload containing the target username and channel.
 * @returns Nothing.
 * @remarks
 * The message is dropped unless both sockets are currently in the same voice channel.
 */
function relayVoiceSignal(socket: Socket, event: string, data: VoiceSignalData = {}): void {
    const to = String(data.to || '');
    const targetId = usernameSockets.get(to);
    if (!targetId) return;
    const target = io.sockets.sockets.get(targetId);
    if (!target) return;
    if (socket.currentVoice !== data.channel || target.currentVoice !== data.channel) return;
    target.emit(event, { from: socket.username, ...data });
}

/**
 * Moves a socket into a voice channel.
 *
 * @param socket - Authenticated socket joining the channel.
 * @param name - Voice channel name.
 * @returns Nothing.
 * @remarks
 * The socket is first removed from any previous voice channel. Updated voice and
 * screen-sharing participant lists are broadcast afterward.
 */
function joinVoiceSocket(socket: Socket, name: string): void {
    leaveVoiceSocket(socket);
    socket.currentVoice = name;
    socket.join(name);
    if (!voiceRooms.has(name)) voiceRooms.set(name, new Set());
    voiceRooms.get(name)!.add(socket.username);
    broadcastVoiceParticipants(name);
    broadcastScreenState(name);
}

/**
 * Extracts the session token from a raw `Cookie` header.
 *
 * @param cookieHeader - Raw cookie header from an HTTP request or socket handshake.
 * @returns The decoded session token, or `null` when the cookie is absent.
 */
function parseSessionCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    const entry = cookieHeader
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith(SESSION_COOKIE + '='));
    if (!entry) return null;
    return decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1));
}

/**
 * Writes the authenticated session cookie to an HTTP response.
 *
 * @param res - Express response that should receive the cookie.
 * @param token - Session token to store.
 * @returns Nothing.
 * @remarks
 * The cookie is HTTP-only, uses `SameSite=Lax`, and expires after the session TTL.
 */
function setSessionCookie(res: Response, token: string): void {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS
    });
}

/**
 * Looks up the active session associated with a cookie header.
 *
 * @param cookieHeader - Raw cookie header from an HTTP request or socket handshake.
 * @returns A promise resolving to the unexpired session document, or `null`.
 */
async function findSession(cookieHeader: string | undefined) {
    const token = parseSessionCookie(cookieHeader);
    if (!token) return null;
    return Session.findOne({ token, expiresAt: { $gt: new Date() } });
}

/**
 * Creates a new persisted session for a user.
 *
 * @param username - Username that should own the session.
 * @returns A promise resolving to the generated session token.
 * @remarks
 * Tokens contain 32 cryptographically random bytes and expire after the session TTL.
 */
async function createSessionFor(username: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    await Session.create({
        token,
        username,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS)
    });
    return token;
}

/**
 * Registers a new user, stores an optional avatar, and creates a session.
 *
 * @param req - Express request containing `username`, `password`, and an optional avatar file.
 * @param res - Express response used to return the created user or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Uploaded avatars are deleted if validation or persistence fails. Duplicate
 * usernames return HTTP 409.
 */
app.post(BASE_PATH + '/register', avatarUpload.single('avatar'), async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : '';
    try {
        const user = new User({ username, password, avatar });
        await user.save();
        avatarCache.set(username, avatarUrl(avatar));
        nicknameCache.set(username, username);
        const token = await createSessionFor(username);
        setSessionCookie(res, token);
        res.status(201).json({ username, nickname: username, avatar });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (errorCode(err) === 11000) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        res.status(500).json({ error: errorMessage(err) });
    }
});

/**
 * Authenticates an existing user and creates a new session.
 *
 * @param req - Express request containing `username` and `password`.
 * @param res - Express response used to return the user or an authentication error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Successful logins refresh the in-memory avatar and nickname caches.
 */
app.post(BASE_PATH + '/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    avatarCache.set(username, avatarUrl(user.avatar));
    nicknameCache.set(username, user.nickname || username);
    const token = await createSessionFor(username);
    setSessionCookie(res, token);
    res.json(userPayload(user));
});

/**
 * Logs out the current user by deleting the session and clearing its cookie.
 *
 * @param req - Express request containing the session cookie.
 * @param res - Express response used to clear the cookie and confirm logout.
 * @returns A promise that resolves after the response is sent.
 */
app.post(BASE_PATH + '/logout', async (req, res) => {
    const token = parseSessionCookie(req.headers.cookie);
    if (token) {
        await Session.deleteOne({ token });
    }
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
});

/**
 * Returns the currently authenticated user.
 *
 * @param req - Express request containing the session cookie.
 * @param res - Express response used to return the user or an authentication error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * If the session points to a deleted user, the stale session is removed and the
 * cookie is cleared.
 */
app.get(BASE_PATH + '/me', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const user = await User.findOne({ username: session.username }).select('username nickname avatar');
    if (!user) {
        await Session.deleteOne({ _id: session._id });
        res.clearCookie(SESSION_COOKIE);
        return res.status(401).json({ error: 'User no longer exists' });
    }
    res.json(userPayload(user));
});

/**
 * Replaces the current user's avatar image.
 *
 * @param req - Express request containing the session cookie and uploaded avatar file.
 * @param res - Express response used to return the new avatar URL or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The previous avatar file is removed after the new avatar is saved.
 */
app.post(BASE_PATH + '/upload-avatar', avatarUpload.single('avatar'), async (req, res) => {
    const session = await findSession(req.headers.cookie);
    const username = session ? session.username : null;
    if (!username) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.avatar) {
            const oldPath = path.join(ROOT_DIR, 'public', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        const avatar = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatar;
        await user.save();
        avatarCache.set(username, avatarUrl(avatar));
        res.json({ avatar: avatarUrl(avatar) });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: errorMessage(err) });
    }
});

/**
 * Updates the current user's nickname.
 *
 * @param req - Express request containing `nickname` in the body.
 * @param res - Express response used to return the updated user or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Nicknames are trimmed and limited to 32 characters.
 */
app.patch(BASE_PATH + '/profile', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const nickname = String(req.body.nickname || '').trim().slice(0, 32);
    if (!nickname) {
        return res.status(400).json({ error: 'Nickname cannot be empty' });
    }
    const user = await User.findOne({ username: session.username });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    user.nickname = nickname;
    await user.save();
    nicknameCache.set(user.username, nickname);
    res.json(userPayload(user));
});

/**
 * Changes the current user's password after verifying the existing password.
 *
 * @param req - Express request containing `currentPassword` and `newPassword`.
 * @param res - Express response used to confirm the change or return an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The new password must be at least six characters. The pre-save hook hashes it.
 */
app.patch(BASE_PATH + '/profile/password', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const user = await User.findOne({ username: session.username });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if (!(await user.comparePassword(String(currentPassword)))) {
        return res.status(403).json({ error: 'Current password is incorrect' });
    }
    user.password = String(newPassword);
    await user.save();
    res.json({ ok: true });
});

/**
 * Lists all channels in creation order.
 *
 * @param req - Express request containing the session cookie.
 * @param res - Express response used to return the channel list or an error.
 * @returns A promise that resolves after the response is sent.
 */
app.get(BASE_PATH + '/channels', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels.map(channelPayload));
});

/**
 * Creates a text or voice channel.
 *
 * @param req - Express request containing `name`, `type`, and optional `description`.
 * @param res - Express response used to return the created channel or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Channel names are limited to 1-30 letters, numbers, hyphens, or underscores.
 * All connected clients receive the refreshed channel list.
 */
app.post(BASE_PATH + '/channels', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const name = String(req.body.name || '').trim();
    const type = req.body.type === 'voice' ? 'voice' : 'text';
    const description = String(req.body.description || '').trim().slice(0, 200);
    if (!/^[a-zA-Z0-9-_]{1,30}$/.test(name)) {
        return res.status(400).json({ error: 'Channel name must be 1-30 characters (letters, numbers, -, _)' });
    }
    try {
        const channel = await Channel.create({ name, creator: session.username, type, description });
        const channels = await Channel.find().sort({ createdAt: 1 });
        io.emit('channels updated', channels.map(channelPayload));
        res.status(201).json(channelPayload(channel));
    } catch (err) {
        if (errorCode(err) === 11000) {
            return res.status(409).json({ error: 'Channel already exists' });
        }
        res.status(500).json({ error: errorMessage(err) });
    }
});

/**
 * Renames an existing channel and updates its messages and in-memory rooms.
 *
 * @param req - Express request with the old channel name in the route and `name` in the body.
 * @param res - Express response used to return the renamed channel or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The `general` channel cannot be renamed. Voice and screen-sharing room state is
 * migrated to the new name, and all clients receive a rename event.
 */
app.patch(BASE_PATH + '/channels/:name', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const oldName = String(req.params.name || '').trim();
    const newName = String(req.body.name || '').trim();
    if (oldName === 'general') {
        return res.status(403).json({ error: 'The general channel cannot be renamed' });
    }
    if (!/^[a-zA-Z0-9-_]{1,30}$/.test(newName)) {
        return res.status(400).json({ error: 'Channel name must be 1-30 characters (letters, numbers, -, _)' });
    }
    if (oldName === newName) {
        return res.status(400).json({ error: 'New name must be different' });
    }
    const channel = await Channel.findOne({ name: oldName });
    if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
    }
    try {
        channel.name = newName;
        await channel.save();
        await Message.updateMany({ channel: oldName }, { $set: { channel: newName } });
        if (voiceRooms.has(oldName)) {
            voiceRooms.set(newName, voiceRooms.get(oldName)!);
            voiceRooms.delete(oldName);
        }
        if (screenRooms.has(oldName)) {
            screenRooms.set(newName, screenRooms.get(oldName)!);
            screenRooms.delete(oldName);
        }
        io.emit('channel renamed', { old: oldName, new: newName, type: channel.type });
        res.json(channelPayload(channel));
    } catch (err) {
        if (errorCode(err) === 11000) {
            return res.status(409).json({ error: 'Channel already exists' });
        }
        res.status(500).json({ error: errorMessage(err) });
    }
});

/**
 * Updates a channel's description.
 *
 * @param req - Express request with the channel name in the route and `description` in the body.
 * @param res - Express response used to return the updated channel or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Descriptions are trimmed and limited to 200 characters.
 */
app.patch(BASE_PATH + '/channels/:name/description', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const name = String(req.params.name || '').trim();
    const description = String(req.body.description || '').trim().slice(0, 200);
    const channel = await Channel.findOne({ name });
    if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
    }
    channel.description = description;
    await channel.save();
    const channels = await Channel.find().sort({ createdAt: 1 });
    io.emit('channels updated', channels.map(channelPayload));
    res.json(channelPayload(channel));
});

/**
 * Deletes a channel, its messages, and its voice/screen room state.
 *
 * @param req - Express request with the channel name in the route.
 * @param res - Express response used to confirm deletion or return an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The `general` channel cannot be removed. Connected clients receive channel
 * removal and voice-leave events.
 */
app.delete(BASE_PATH + '/channels/:name', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const name = String(req.params.name || '').trim();
    if (name === 'general') {
        return res.status(403).json({ error: 'The general channel cannot be removed' });
    }
    const channel = await Channel.findOne({ name });
    if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
    }
    await Channel.deleteOne({ _id: channel._id });
    await Message.deleteMany({ channel: name });
    voiceRooms.delete(name);
    screenRooms.delete(name);
    io.emit('channel removed', { name });
    io.emit('channel left voice', { channel: name });
    res.json({ ok: true });
});

/**
 * Lists pinned messages in a channel, newest first.
 *
 * @param req - Express request with the channel name in the route.
 * @param res - Express response used to return up to 50 pinned messages.
 * @returns A promise that resolves after the response is sent.
 */
app.get(BASE_PATH + '/channels/:name/pinned', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const name = String(req.params.name || '').trim();
    const pinned = await Message.find({ channel: name, pinned: true })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(pinned.map(messagePayload));
});

/**
 * Pins a message.
 *
 * @param req - Express request with the message ID in the route.
 * @param res - Express response used to return the updated message or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The updated message is broadcast to everyone in the message's channel.
 */
app.post(BASE_PATH + '/messages/:id/pin', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    let message: IMessage | null;
    try {
        message = await Message.findById(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid message id' });
    }
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    message.pinned = true;
    await message.save();
    const payload = messagePayload(message);
    io.to(message.channel).emit('message updated', payload);
    res.json(payload);
});

/**
 * Unpins a message.
 *
 * @param req - Express request with the message ID in the route.
 * @param res - Express response used to return the updated message or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * The updated message is broadcast to everyone in the message's channel.
 */
app.delete(BASE_PATH + '/messages/:id/pin', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    let message: IMessage | null;
    try {
        message = await Message.findById(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid message id' });
    }
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    message.pinned = false;
    await message.save();
    const payload = messagePayload(message);
    io.to(message.channel).emit('message updated', payload);
    res.json(payload);
});

/**
 * Edits a message owned by the current user.
 *
 * @param req - Express request with the message ID in the route and `text` in the body.
 * @param res - Express response used to return the updated message or an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * Message text is limited to 2000 characters. When the text changes, link preview
 * and YouTube metadata are refreshed, and the update is broadcast to the channel.
 */
app.patch(BASE_PATH + '/messages/:id', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const msgText = String(req.body.text || '').trim().slice(0, 2000);
    if (!msgText) {
        return res.status(400).json({ error: 'Message text cannot be empty' });
    }
    let message: IMessage | null;
    try {
        message = await Message.findById(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid message id' });
    }
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    if (message.username !== session.username) {
        return res.status(403).json({ error: 'You can only edit your own messages' });
    }
    if (message.text !== msgText) {
        try {
            const youtube = await extractYoutube(msgText);
            const og = youtube ? null : await extractLinkPreview(msgText);
            message.text = msgText;
            message.og = og || null;
            message.youtube = youtube || null;
            await message.save();
        } catch (err) {
            return res.status(500).json({ error: errorMessage(err) });
        }
    }
    const payload = messagePayload(message);
    io.to(message.channel).emit('message updated', payload);
    res.json(payload);
});

/**
 * Deletes a message owned by the current user.
 *
 * @param req - Express request with the message ID in the route.
 * @param res - Express response used to confirm deletion or return an error.
 * @returns A promise that resolves after the response is sent.
 * @remarks
 * A `message removed` event is broadcast to the message's channel.
 */
app.delete(BASE_PATH + '/messages/:id', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    let message: IMessage | null;
    try {
        message = await Message.findById(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid message id' });
    }
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    if (message.username !== session.username) {
        return res.status(403).json({ error: 'You can only delete your own messages' });
    }
    await Message.deleteOne({ _id: message._id });
    io.to(message.channel).emit('message removed', { _id: message._id, channel: message.channel });
    res.json({ ok: true });
});

/**
 * Handles upload and request parsing errors.
 *
 * @param err - Error thrown by middleware, including multer validation failures.
 * @param req - Express request that may contain a partially uploaded file.
 * @param res - Express response used to return the error message.
 * @param _next - Express next function, unused.
 * @remarks
 * Any partially uploaded file is removed before responding with HTTP 400.
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: err.message });
});

/**
 * Authenticates socket connections using the session cookie from the handshake.
 *
 * @param socket - Incoming socket connection.
 * @param next - Middleware callback used to accept or reject the connection.
 * @returns A promise that resolves after authentication is decided.
 * @remarks
 * Rejected connections receive an `Unauthorized` error. Accepted sockets are
 * annotated with the authenticated username.
 */
io.use(async (socket, next) => {
    try {
        const session = await findSession(socket.handshake.headers.cookie);
        if (!session) {
            return next(new Error('Unauthorized'));
        }
        socket.username = session.username;
        next();
    } catch (err) {
        next(err instanceof Error ? err : new Error(String(err)));
    }
});

/**
 * Registers event handlers for a newly connected and authenticated socket.
 *
 * @param socket - Authenticated socket connection.
 * @remarks
 * Tracks the user in the online list and handles channel joins, messages, voice
 * signaling, screen sharing, speaking state, and disconnects.
 */
io.on('connection', (socket) => {
    console.log(`${socket.username} connected`);
    usernameSockets.set(socket.username, socket.id);
    broadcastOnlineUsers();

    /**
     * Joins a text channel and sends its recent message history.
     *
     * @param channel - Name of the channel to join.
     * @returns A promise that resolves after the history is sent.
     * @remarks
     * An error event is emitted when the channel does not exist.
     */
    socket.on('join channel', async ({ channel }: { channel?: unknown } = {}) => {
        const name = String(channel || '').trim().slice(0, 30);
        const ch = await Channel.findOne({ name });
        if (!ch) {
            socket.emit('join channel error', `Channel "${name}" does not exist`);
            return;
        }
        if (socket.currentChannel) socket.leave(socket.currentChannel);
        socket.currentChannel = ch.name;
        socket.join(ch.name);
        try {
            const history = await Message.find({ channel: ch.name }).sort({ createdAt: -1 }).limit(50);
            socket.emit('chat history', history.reverse().map(messagePayload));
        } catch (err) {
            console.error('Failed to load history:', errorMessage(err));
        }
    });

    /**
     * Persists and broadcasts a chat message from the connected user.
     *
     * @param text - Message body supplied by the client.
     * @param replyToId - Optional ID of the message being replied to.
     * @returns A promise that resolves after the message is saved or dropped.
     * @remarks
     * Messages are ignored while the socket is in a voice channel. Text is limited
     * to 2000 characters, and link preview or YouTube metadata is attached when found.
     */
    socket.on('chat message', async ({ text, replyToId }: { text?: unknown; channel?: unknown; replyToId?: unknown } = {}) => {
        const textRaw = String(text || '').trim();
        if (!textRaw) return;
        if (!socket.currentChannel || !socket.rooms.has(socket.currentChannel)) return;
        if (socket.currentVoice) return;
        const msgText = textRaw.slice(0, 2000);
        let replyTo: ReplyTo | null = null;
        if (replyToId) {
            try {
                const target = await Message.findById(String(replyToId));
                if (target && target.channel === socket.currentChannel) {
                    replyTo = {
                        _id: target._id,
                        username: target.username,
                        nickname: nicknameCache.get(target.username) || target.username,
                        text: target.text.slice(0, 150)
                    };
                }
            } catch (err) {
                replyTo = null;
            }
        }

        // Persist the message
        try {
            const youtube = await extractYoutube(msgText);
            const og = youtube ? null : await extractLinkPreview(msgText);
            const message = await Message.create({
                channel: socket.currentChannel,
                username: socket.username,
                text: msgText,
                og: og || null,
                youtube: youtube || null,
                replyTo
            });
            // Send the message to everyone in the channel
            io.to(socket.currentChannel).emit('chat message', messagePayload(message));
        } catch (err) {
            console.error('Failed to save message:', errorMessage(err));
        }
    });

    /**
     * Joins a voice channel after verifying that it exists and is a voice channel.
     *
     * @param channel - Name of the voice channel to join.
     * @returns A promise that resolves after the join attempt is handled.
     * @remarks
     * An error event is emitted when the voice channel does not exist.
     */
    socket.on('join voice', async ({ channel }: { channel?: unknown } = {}) => {
        const name = String(channel || '').trim().slice(0, 30);
        const ch = await Channel.findOne({ name });
        if (!ch || ch.type !== 'voice') {
            socket.emit('join voice error', `Voice channel "${name}" does not exist`);
            return;
        }
        joinVoiceSocket(socket, ch.name);
    });

    /**
     * Leaves the socket's current voice channel.
     */
    socket.on('leave voice', () => {
        leaveVoiceSocket(socket);
    });

    /**
     * Relays a WebRTC offer to another participant in the same voice channel.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('voice offer', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'voice offer', data));

    /**
     * Relays a WebRTC answer to another participant in the same voice channel.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('voice answer', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'voice answer', data));

    /**
     * Relays a WebRTC ICE candidate to another participant in the same voice channel.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('voice ice', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'voice ice', data));

    /**
     * Starts screen sharing for the socket's voice channel.
     *
     * @remarks
     * Only one user may share at a time; an error event is emitted if someone else
     * is already sharing.
     */
    socket.on('screen share start', () => {
        if (!socket.currentVoice) return;
        const existing = Array.from(screenRooms.get(socket.currentVoice) || []);
        if (existing.some((u) => u !== socket.username)) {
            socket.emit('screen share error', 'Someone else is already sharing their screen');
            return;
        }
        joinScreenSocket(socket, socket.currentVoice);
    });

    /**
     * Stops screen sharing for the socket's current voice channel.
     */
    socket.on('screen share stop', () => {
        leaveScreenSocket(socket);
    });

    /**
     * Relays a screen-sharing WebRTC offer to another participant.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('screen offer', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'screen offer', data));

    /**
     * Relays a screen-sharing WebRTC answer to another participant.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('screen answer', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'screen answer', data));

    /**
     * Relays a screen-sharing WebRTC ICE candidate to another participant.
     *
     * @param data - Signal payload containing the target username and channel.
     */
    socket.on('screen ice', (data: VoiceSignalData = {}) => relayVoiceSignal(socket, 'screen ice', data));

    /**
     * Broadcasts the user's speaking state to the rest of the voice room.
     *
     * @param speaking - Whether the user is currently speaking.
     */
    socket.on('voice speaking', (data: { speaking?: unknown } = {}) => {
        const room = socket.currentVoice;
        if (!room) return;
        socket.to(room).emit('voice speaking', {
            username: socket.username,
            speaking: !!data.speaking
        });
    });

    /**
     * Cleans up voice, screen-sharing, and presence state after a socket disconnects.
     */
    socket.on('disconnect', () => {
        leaveVoiceSocket(socket);
        if (usernameSockets.get(socket.username) === socket.id) {
            usernameSockets.delete(socket.username);
        }
        broadcastOnlineUsers();
        console.log(`${socket.username} disconnected`);
    });
});

/**
 * Connects to MongoDB, hydrates caches, seeds defaults, and starts the HTTP server.
 *
 * @param port - Port to listen on; defaults to the configured port.
 * @returns A promise resolving once the server is listening.
 * @remarks
 * Existing users are loaded into the avatar and nickname caches, and the
 * `general` channel is created when missing.
 */
async function startServer(port: number = config.port): Promise<void> {
    await connectDB();
    // Hydrate the avatar cache with existing users
    try {
        const users = await User.find({}, 'username avatar nickname');
        /**
         * Adds an existing user's avatar and nickname to the in-memory caches.
         *
         * @param u - User document loaded during server startup.
         */
        users.forEach((u) => {
            avatarCache.set(u.username, avatarUrl(u.avatar));
            nicknameCache.set(u.username, u.nickname || u.username);
        });
    } catch (err) {
        console.error('Failed to hydrate user cache:', errorMessage(err));
    }

    // Ensure the default channel exists
    try {
        await Channel.findOneAndUpdate(
            { name: 'general' },
            { $setOnInsert: { name: 'general', creator: 'system' } },
            { upsert: true }
        );
    } catch (err) {
        console.error('Failed to seed general channel:', errorMessage(err));
    }

    /**
     * Starts the HTTP server and resolves when it begins listening.
     *
     * @param resolve - Promise resolver invoked once the listener is active.
     */
    return new Promise((resolve) => {
        /**
         * Logs the listening URL and resolves the startup promise.
         */
        server.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            resolve();
        });
    });
}

if (require.main === module) {
    /**
     * Logs fatal startup errors and exits the process.
     *
     * @param err - Error raised while starting the server.
     */
    startServer().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

export { app, server, startServer };
