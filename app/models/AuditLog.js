const { Schema, default: mongoose } = require('mongoose');

const auditLogSchema = new Schema({
    action: { 
        type: String, 
        enum: [ 'create', 'update', 'delete', 'invite', 'accept', 'reject', 'submit' ], 
        required: true 
    },
    performedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    targetEntity: { 
        type: Schema.Types.ObjectId, 
        refPath: 'entityType', 
        required: true 
    },
    entityType: { 
        type: String, 
        enum: [ 'User', 'Team', 'Player', 'Fixture', 'Competition', 'MatchEvent' ], 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now()
    }
});

module.exports = mongoose.model( 'AuditLog', auditLogSchema );