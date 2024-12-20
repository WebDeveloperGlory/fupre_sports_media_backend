const { Schema, default: mongoose } = require('mongoose');

const fixtureSchema = new Schema({
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    awayTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [ 'friendly', 'competition' ]
    },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition',
        required: function() {
            return this.type === 'competition'
        }
    },
    date: {
        type: Date,
        required: true
    },
    stadium: { type: String },
    status: {
        type: String,
        enum: [ 'live', 'upcoming', 'completed' ],
        default: 'upcoming'
    },
    result: {
        homeScore: { type: Number, default: null },
        awayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null },
    },
    statistics: {
        type: Schema.Types.ObjectId,
        ref: 'MatchStatistic'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model( 'Fixture', fixtureSchema );