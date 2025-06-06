const { Schema, default: mongoose } = require('mongoose');

const teamOfTheSeasonSessionSchema = new Schema({
    year: { type: Number, required: true },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    isActive: { type: Boolean, default: true },
    showVoteCount: { type: Boolean, default: false },
    selectedFormation: { type: 'String' },
    elegiblePlayers: {
        GK: [{
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }],
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
    startDate: { type: Date },
    endDate: { type: Date },
    adminVoteWeight: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model( 'TOTSSession', teamOfTheSeasonSessionSchema );