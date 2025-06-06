const { Schema, default: mongoose } = require('mongoose');

const playerCompetitionStatSchema = new Schema({
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        required: true
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    year: { type: Number, required: true },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    appearances: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 }
});

module.exports = mongoose.model( 'PlayerCompetitionStat', playerCompetitionStatSchema )