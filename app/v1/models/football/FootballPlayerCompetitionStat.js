const { Schema, default: mongoose } = require('mongoose');

const footballPlayerCompetitionStatSchema = new Schema({
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'FootballCompetition',
        required: true
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer',
        required: true
    },
    year: { type: Number, required: true },
    goals: { type: Number, default: 0 },
    ownGoals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    appearances: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 }
});

module.exports = mongoose.model( 'FootballPlayerCompetitionStat', footballPlayerCompetitionStatSchema )