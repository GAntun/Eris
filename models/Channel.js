const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        maxlength: 30,
        match: /^[a-zA-Z0-9-_]+$/
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

module.exports = mongoose.model('Channel', channelSchema);