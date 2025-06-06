const { Schema, default: mongoose } = require('mongoose');

const votesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'RefactoredUser',
        required: true
    },
    session: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTOTSSession',
        required: true
    },
    selectedFormation: { type: 'String' },
    selectedPlayers: {
        GK: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
        DEF: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        MID: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        FWD: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
    submittedAt: { type: Date, default: Date.now },
    weight: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model( 'FootballVotes', votesSchema );