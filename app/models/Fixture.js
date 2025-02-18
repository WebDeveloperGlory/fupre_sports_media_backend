const { Schema, default: mongoose } = require('mongoose');

const REQUIRED_EVENT_TYPES = ['goal', 'assist', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget'];

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
    round: {
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
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null },
    },
    goalScorers: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            },
            team: {
                type: Schema.Types.ObjectId,
                ref: 'Team'
            },
            time: { type: Number }
        }
    ],
    statistics: {
        type: Schema.Types.ObjectId,
        ref: 'MatchStatistic'
    },
    homeLineup: {
        formation: {
            type: String,
            default: null
        },
        startingXI: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        subs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
    },
    awayLineup: {
        formation: {
            type: String,
            default: null
        },
        startingXI: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        subs: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
    },
    matchEvents: [
        {
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
                ref: 'Player',
                default: null
            },
            team: { 
                type: Schema.Types.ObjectId, 
                ref: 'Team', 
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
                ref: 'Player',
                default: null
            },
            commentary: {
                type: String,
                default: null
            },
            id: { 
                type: Number 
            },
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model( 'Fixture', fixtureSchema );