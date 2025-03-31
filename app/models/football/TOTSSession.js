const { Schema, default: mongoose } = require('mongoose');

const teamOfTheSeasonSessionSchema = new Schema({
    year: { type: Number, required: true },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'FootballCompetition',
        required: true
    },
    isActive: { type: Boolean, default: true },
    showVoteCount: { type: Boolean, default: false },
    selectedFormation: { type: 'String' },
    elegiblePlayers: {
        GK: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
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
    startDate: { type: Date },
    endDate: { type: Date },
    adminVoteWeight: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model( 'FootballTOTSSession', teamOfTheSeasonSessionSchema );