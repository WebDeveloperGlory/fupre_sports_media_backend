const { Schema, default: mongoose } = require('mongoose');

const votesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'RefactoredUser',
        required: true
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'TOTSSession',
        required: true
    },
    selectedFormation: { type: 'String' },
    selectedPlayers: {
        GK: {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
        DEF: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
        MID: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
        FWD: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
    },
    submittedAt: { type: Date, default: Date.now },
    weight: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model( 'Votes', votesSchema );