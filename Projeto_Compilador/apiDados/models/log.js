var mongoose = require('mongoose');

var logSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        enum: ['info', 'news', 'download', 'view'],
        required: true,
        default: 'info',
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    publico: {
        type: Boolean,
        required: true,
        default: false
    },
});

module.exports = mongoose.model('logs', logSchema);

