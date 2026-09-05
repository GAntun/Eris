const express = require('express');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const { connectDB } = require('./db');
const User = require('./models/User');
const Message = require('./models/Message');
const Session = require('./models/Session');
const Channel = require('./models/Channel');
const { extractLinkPreview } = require('./og');
const { extractYoutube } = require('./youtube');

const ALLOWED_MIME_TYPES = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif']
]);

const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const uploadsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
        const ext = ALLOWED_MIME_TYPES.get(file.mimetype);
        cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    }
});

const avatarUpload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
        }
        cb(null, true);
    }
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cookieParser());

// Serve the static HTML file and uploaded avatars
app.use(express.static(path.join(__dirname, 'public')));

// In-memory username -> avatar cache
const avatarCache = new Map();

function parseSessionCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const entry = cookieHeader
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith(SESSION_COOKIE + '='));
    if (!entry) return null;
    return decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1));
}

function setSessionCookie(res, token) {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS
    });
}

async function findSession(cookieHeader) {
    const token = parseSessionCookie(cookieHeader);
    if (!token) return null;
    return Session.findOne({ token, expiresAt: { $gt: new Date() } });
}

async function createSessionFor(username) {
    const token = crypto.randomBytes(32).toString('hex');
    await Session.create({
        token,
        username,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS)
    });
    return token;
}

// Register a new user
app.post('/register', avatarUpload.single('avatar'), async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : '';
    try {
        const user = new User({ username, password, avatar });
        await user.save();
        avatarCache.set(username, avatar);
        const token = await createSessionFor(username);
        setSessionCookie(res, token);
        res.status(201).json({ username, avatar });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Log in an existing user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    avatarCache.set(username, user.avatar);
    const token = await createSessionFor(username);
    setSessionCookie(res, token);
    res.json({ username, avatar: user.avatar });
});

// Log out: invalidate the session both in the DB and the cookie
app.post('/logout', async (req, res) => {
    const token = parseSessionCookie(req.headers.cookie);
    if (token) {
        await Session.deleteOne({ token });
    }
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
});

// Return the current logged-in user, used to restore sessions on page load
app.get('/me', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const user = await User.findOne({ username: session.username }).select('username avatar');
    if (!user) {
        await Session.deleteOne({ _id: session._id });
        res.clearCookie(SESSION_COOKIE);
        return res.status(401).json({ error: 'User no longer exists' });
    }
    res.json({ username: user.username, avatar: user.avatar || '' });
});

// Replace avatar for the currently logged-in user
app.post('/upload-avatar', avatarUpload.single('avatar'), async (req, res) => {
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
        if (user.avatar) {
            const oldPath = path.join(__dirname, 'public', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        const avatar = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatar;
        await user.save();
        avatarCache.set(username, avatar);
        res.json({ avatar });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// List all channels
app.get('/channels', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels.map((c) => ({ _id: c._id, name: c.name, creator: c.creator })));
});

// Create a new channel
app.post('/channels', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const name = String(req.body.name || '').trim();
    if (!/^[a-zA-Z0-9-_]{1,30}$/.test(name)) {
        return res.status(400).json({ error: 'Channel name must be 1-30 characters (letters, numbers, -, _)' });
    }
    try {
        const channel = await Channel.create({ name, creator: session.username });
        const channels = await Channel.find().sort({ createdAt: 1 });
        io.emit('channels updated', channels.map((c) => ({ _id: c._id, name: c.name, creator: c.creator })));
        res.status(201).json({ _id: channel._id, name: channel.name, creator: channel.creator });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Channel already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Rename a channel (any logged-in user)
app.patch('/channels/:name', async (req, res) => {
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
        io.emit('channel renamed', { old: oldName, new: newName });
        res.json({ _id: channel._id, name: channel.name, creator: channel.creator });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Channel already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Remove a channel (any logged-in user)
app.delete('/channels/:name', async (req, res) => {
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
    io.emit('channel removed', { name });
    res.json({ ok: true });
});

// Edit a message (author only)
app.patch('/messages/:id', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const msgText = String(req.body.text || '').trim().slice(0, 2000);
    if (!msgText) {
        return res.status(400).json({ error: 'Message text cannot be empty' });
    }
    let message;
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
            return res.status(500).json({ error: err.message });
        }
    }
    const payload = {
        _id: message._id,
        channel: message.channel,
        username: message.username,
        text: message.text,
        createdAt: message.createdAt,
        avatar: avatarCache.get(message.username) || '',
        og: message.og,
        youtube: message.youtube
    };
    io.to(message.channel).emit('message updated', payload);
    res.json(payload);
});

// Delete a message (author only)
app.delete('/messages/:id', async (req, res) => {
    const session = await findSession(req.headers.cookie);
    if (!session) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    let message;
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

// Multer error handler
app.use((err, req, res, next) => {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: err.message });
});

// Socket auth middleware: resolve the session cookie
io.use(async (socket, next) => {
    try {
        const session = await findSession(socket.handshake.headers.cookie);
        if (!session) {
            return next(new Error('Unauthorized'));
        }
        socket.username = session.username;
        next();
    } catch (err) {
        next(err);
    }
});

// When a user connects to the chat
io.on('connection', (socket) => {
    console.log(`${socket.username} connected`);

    // Send recent message history for a channel and join its room
    socket.on('join channel', async ({ channel } = {}) => {
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
            socket.emit('chat history', history.reverse().map((m) => ({
                _id: m._id,
                channel: m.channel,
                username: m.username,
                text: m.text,
                createdAt: m.createdAt,
                avatar: avatarCache.get(m.username) || '',
                og: m.og,
                youtube: m.youtube
            })));
        } catch (err) {
            console.error('Failed to load history:', err.message);
        }
    });

    // Listen for a 'chat message' event from a client
    socket.on('chat message', async ({ text, channel } = {}) => {
        const textRaw = String(text || '').trim();
        if (!textRaw) return;
        if (!socket.currentChannel || !socket.rooms.has(socket.currentChannel)) return;
        const msgText = textRaw.slice(0, 2000);

        // Persist the message
        try {
            const youtube = await extractYoutube(msgText);
            const og = youtube ? null : await extractLinkPreview(msgText);
            const message = await Message.create({
                channel: socket.currentChannel,
                username: socket.username,
                text: msgText,
                og: og || null,
                youtube: youtube || null
            });
            // Send the message to everyone in the channel
            io.to(socket.currentChannel).emit('chat message', {
                _id: message._id,
                channel: message.channel,
                username: message.username,
                text: message.text,
                createdAt: message.createdAt,
                avatar: avatarCache.get(message.username) || '',
                og: message.og,
                youtube: message.youtube
            });
        } catch (err) {
            console.error('Failed to save message:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`${socket.username} disconnected`);
    });
});

connectDB().then(async () => {
    // Hydrate the avatar cache with existing users
    try {
        const users = await User.find({}, 'username avatar');
        users.forEach((u) => avatarCache.set(u.username, u.avatar || ''));
    } catch (err) {
        console.error('Failed to hydrate avatar cache:', err.message);
    }

    // Ensure the default channel exists
    try {
        await Channel.findOneAndUpdate(
            { name: 'general' },
            { $setOnInsert: { name: 'general', creator: 'system' } },
            { upsert: true }
        );
    } catch (err) {
        console.error('Failed to seed general channel:', err.message);
    }

    const PORT = 3200;
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});