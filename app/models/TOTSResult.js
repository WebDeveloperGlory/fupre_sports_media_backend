const { Schema, default: mongoose } = require('mongoose');

const teamOfTheSeasonResultSchema = new Schema({
    session: {
        type: Schema.Types.ObjectId,
        ref: 'TOTSSession',
        required: true
    },
    // Formation data
    winningFormation: { 
        type: String, 
        required: true 
    },
    winningFormationPercentage: { 
        type: Number, 
        required: true 
    },
    
    // Full voting results data
    winningPlayers: {
        GK: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        DEF: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        MID: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        FWD: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
    },
    winningPlayersVotes: {
        GK: { type: Number, default: 0 },
        DEF: { type: Number, default: 0 },
        MID: { type: Number, default: 0 },
        FWD: { type: Number, default: 0 }
    },
    winningPlayersPercentage: {
        GK: { type: Number, default: 0 },
        DEF: { type: Number, default: 0 },
        MID: { type: Number, default: 0 },
        FWD: { type: Number, default: 0 }
    },
    
    // Admin choice data
    adminChoice: {
        GK: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        DEF: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        MID: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        FWD: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
    },
    adminChoiceVotes: {
        GK: { type: Number, default: 0 },
        DEF: { type: Number, default: 0 },
        MID: { type: Number, default: 0 },
        FWD: { type: Number, default: 0 }
    },
    adminChoicePercentage: {
        GK: { type: Number, default: 0 },
        DEF: { type: Number, default: 0 },
        MID: { type: Number, default: 0 },
        FWD: { type: Number, default: 0 }
    },
    
    // Final winners (combines the structure from your original schema)
    finalWinners: {
        GK: { type: Schema.Types.ObjectId, ref: 'Player' },
        DEF: { type: Schema.Types.ObjectId, ref: 'Player' },
        MID: { type: Schema.Types.ObjectId, ref: 'Player' },
        FWD: { type: Schema.Types.ObjectId, ref: 'Player' }
    },
    
    // Legacy/compatibility fields that match your original structure
    votersChoice: {
        formation: { type: String },
        GK: { type: Schema.Types.ObjectId, ref: 'Player' },
        DEF: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        MID: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        FWD: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
    },
    adminChoice_legacy: {
        formation: { type: String },
        GK: { type: Schema.Types.ObjectId, ref: 'Player' },
        DEF: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        MID: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        FWD: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
    },
    finalWinner: {
        formation: { type: String },
        GK: { type: Schema.Types.ObjectId, ref: 'Player' },
        DEF: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        MID: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
        FWD: [{ type: Schema.Types.ObjectId, ref: 'Player' }]
    }
}, { timestamps: true });

module.exports = mongoose.model('TOTSResult', teamOfTheSeasonResultSchema);