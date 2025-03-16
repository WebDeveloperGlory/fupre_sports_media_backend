const { Schema, default: mongoose } = require('mongoose');

const REQUIRED_EVENT_TYPES = ['goal', 'assist', 'ownGoal', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget'];

const footballFixtureSchema = new Schema({
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
        enum: [ 'friendly', 'competition' ]
    },
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'FootballCompetition',
        required: function() {
            return this.type === 'competition'
        }
    },
    matchWeek: {
        type: String,
    },
    referee: {
        type: String,
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
        halftimeHomeScore: { type: Number, default: null },
        halftimeAwayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null },
    },
    goalScorers: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'FootballTeam'
        },
        time: { type: Number }
    }],
    statistics: {
        type: Schema.Types.ObjectId,
        ref: 'FootballMatchStatistic'
    },
    homeLineup: {
        formation: { type: String, default: null },
        startingXI: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        subs: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
    awayLineup: {
        formation: { type: String, default: null },
        startingXI: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        subs: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
    matchEvents: [{
        time: {
            type: Number,
            required: true
        },
        eventType: {
            type: String,
            enum: ['goal', 'assist', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget', 'kickoff', 'halftime', 'fulltime'],
            required: true
        },
        player: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer',
            default: null
        },
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
        substitutedFor: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer',
            default: null
        },
        commentary: {
            type: String,
            default: null
        },
        id: { 
            type: Number 
        },
    }],
    preMatchOdds: {
        homeOdds: { type: Number },
        drawOdds: { type: Number },
        awayOdds: { type: Number },
    }
}, { timestamps: true })

module.exports = mongoose.model( 'FootballFixture', footballFixtureSchema );