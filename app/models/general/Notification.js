const { Schema, default: mongoose } = require('mongoose');

const notificationSchema = new Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        refPath: 'RefactoredUser', 
        required: true 
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model( 'RefactoredNotification', notificationSchema );