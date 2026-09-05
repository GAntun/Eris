const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);