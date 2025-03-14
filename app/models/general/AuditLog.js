const { Schema, default: mongoose } = require('mongoose');

const auditLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
    },
    entity: {
        type: String,
        required: true // e.g., 'Competition', 'Team', 'Match', 'Player'
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: Object,
        default: {} // For storing additional information
    },
    previousValues: {
        type: Object,
        default: {} // For storing previous values in case of updates
    },
    newValues: {
        type: Object,
        default: {} // For storing new values in case of updates
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model( 'AuditLog', auditLogSchema );