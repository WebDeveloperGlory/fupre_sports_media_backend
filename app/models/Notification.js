const { Schema, default: mongoose } = require('mongoose');

const notificationSchema = new Schema({
    recipient: { 
        type: Schema.Types.ObjectId, 
        refPath: 'recipientType', 
        required: true 
    },
    recipientType: { 
        type: String, 
        enum: [ 'User', 'Team' ], 
        required: true 
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [ 'friendly-request', 'competition-invitation', 'friendly-update', 'admin-announcement' ],
        required: true
    },
    status: {
        type: String,
        enum: [ 'read', 'unread' ],
        default: 'unread'
    },
    relatedEntity: {
        type: Schema.Types.ObjectId,
        refPath: 'entityType',
        default: null
    },
    entityType: {
        type: String,
        enum: [ 'Competition', 'Fixture', 'Team' ],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'Notification', notificationSchema );