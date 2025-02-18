const { Schema, default: mongoose } = require('mongoose');

const matchStatisticSchema = new Schema({
    fixture: {
        type: Schema.Types.ObjectId,
        ref: 'Fixture',
        required: true
    },
    home: {
        shotsOnTarget: { type: Number, default: 0 },
        shotsOffTarget: { type: Number, default: 0 },
        fouls: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        offsides: { type: Number, default: 0 },
        corners: { type: Number, default: 0 },
        possessionTime: { type: Number, default: 0 },
    },
    away: {
        shotsOnTarget: { type: Number, default: 0 },
        shotsOffTarget: { type: Number, default: 0 },
        fouls: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        offsides: { type: Number, default: 0 },
        corners: { type: Number, default: 0 },
        possessionTime: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'MatchStatistic', matchStatisticSchema );