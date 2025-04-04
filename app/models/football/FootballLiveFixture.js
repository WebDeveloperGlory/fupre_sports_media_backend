const { Schema, default: mongoose } = require('mongoose');

const REQUIRED_EVENT_TYPES = ['goal', 'assist', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget'];

const footballLiveFixtureSchema = new Schema({
    time: {
        type: Number,
        required: true
    },
    half: {
        type: String,
        enum: [ 'first', 'second' ],
        default: 'first'
    },
    fixtureId: {
        type: Schema.Types.ObjectId,
        ref: 'FootballFixture',
        required: true
    },
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTeam',
        required: true
    },
    awayTeam: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTeam',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['friendly', 'competition']
    },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'FootballCompetition',
        required: function () {
            return this.type === 'competition';
        }
    },
    round: { type: String },
    referee: { type: String },
    date: { type: Date, required: true },
    stadium: { type: String },
    status: {
        type: String,
        enum: ['live'],
        default: 'live'
    },
    result: {
        homeScore: { type: Number, default: 0 },
        awayScore: { type: Number, default: 0 },
        halftimeHomeScore: { type: Number, default: null },
        halftimeAwayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null }
    },
    statistics: {
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
        }
    },
    homeLineup: {
        formation: { type: String, default: null },
        startingXI: [{ type: Schema.Types.ObjectId, ref: 'FootballPlayer' }],
        subs: [{ type: Schema.Types.ObjectId, ref: 'FootballPlayer' }]
    },
    awayLineup: {
        formation: { type: String, default: null },
        startingXI: [{ type: Schema.Types.ObjectId, ref: 'FootballPlayer' }],
        subs: [{ type: Schema.Types.ObjectId, ref: 'FootballPlayer' }]
    },
    matchEvents: [
        {
            time: { type: Number, required: true },
            eventType: {
                type: String,
                enum: ['goal', 'ownGoal', 'assist', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget', 'kickoff', 'halftime', 'fulltime'],
                required: true
            },
            player: { type: Schema.Types.ObjectId, ref: 'FootballPlayer', default: null },
            team: { 
                type: Schema.Types.ObjectId, 
                ref: 'FootballTeam', 
                validate: {
                    validator: function( value ) {
                        if( REQUIRED_EVENT_TYPES.includes( this.eventType ) && !value ) {
                            return false;
                        }
                        return true;
                    },
                    message: props => `Team Required If eventType Is ${ REQUIRED_EVENT_TYPES.join(', ')}`
                }
            },
            substitutedFor: { type: Schema.Types.ObjectId, ref: 'FootballPlayer', default: null },
            commentary: { type: String, default: null },
            id: { type: Number }
        }
    ],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('FootballLiveFixture', footballLiveFixtureSchema);