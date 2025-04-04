const { Schema, default: mongoose } = require('mongoose');

const REQUIRED_EVENT_TYPES = ['goal', 'assist', 'ownGoal', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget'];

const footballFixtureSchema = new Schema({
    // Baic Info
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
        required: function() {
            return !this.isDateTBD && this.status !== 'postponed';
        }
    },
    isDateTBD: {
        type: Boolean,
        default: false
    },
    stadium: { type: String },
    status: {
        type: String,
        enum: ['live', 'upcoming', 'completed', 'postponed', 'scheduled', 'tbd'],
        default: 'upcoming',
        validate: {
            validator: function(v) {
                if (v === 'tbd') return this.isDateTBD;
                if (v === 'postponed') return this.isPostponed;
                return true;
            },
            message: 'Status must align with isDateTBD/isPostponed flags'
        }
    },
    isPostponed: { type: Boolean, default: false },
    postponementInfo: {
        reason: String,
        newDate: Date,
        originalDate: Date
    },

    // Results and Statistics
    result: {
        homeScore: { type: Number, default: null },
        awayScore: { type: Number, default: null },
        halftimeHomeScore: { type: Number, default: null },
        halftimeAwayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null },
        winner: {
            type: String,
            enum: [ 'home', 'away', 'draw' ],
            default: null
        },
        isPenaltyShootout: { type: Boolean, default: false }
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

    // Lineups and Events
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
        half: { type: Number, enum: [ 1, 2 ], default: 1 },
        eventType: {
            type: String,
            enum: ['goal', 'ownGoal', 'assist', 'yellowCard', 'redCard', 'substitution', 'foul', 'corner', 'offside', 'shotOnTarget', 'shotOffTarget', 'kickoff', 'halftime', 'fulltime', 'varDecision', 'injury', 'injuryTime', 'goalDisallowed', 'goalConfirmed', 'penaltyAwarded', 'penaltyScored', 'penaltyMissed', 'penaltySaved'],
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

    // Match Odds
    preMatchOdds: {
        homeOdds: { type: Number },
        drawOdds: { type: Number },
        awayOdds: { type: Number },
    },

    // Post-Match
    highlightsVideo: { type: String },
    matchReport: { type: String },
    manOfTheMatch: { 
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

footballFixtureSchema.virtual('displayDate').get(function() {
    if (this.date) return this.date;
    if (this.postponementInfo?.newDate) return `Rescheduled: ${this.postponementInfo.newDate}`;
    if (this.tentativeSchedule?.period) return `Tentative: ${this.tentativeSchedule.period}`;
    return 'Date TBD';
});

footballFixtureSchema.pre('validate', function(next) {
    // Ensure TBD logic is consistent
    if (this.isDateTBD && this.date) {
        this.invalidate('isDateTBD', 'Cannot have both date and isDateTBD true');
    }
    
    // Validate postponement info
    if (this.isPostponed && !this.postponementInfo.reason) {
        this.invalidate('postponementInfo.reason', 'Reason required for postponed matches');
    }
    
    next();
});

footballFixtureSchema.pre('save', function(next) {
    if (this.result.homeScore !== null && this.result.awayScore !== null) {
      this.result.winner = 
        this.result.homeScore > this.result.awayScore ? 'home' :
        this.result.awayScore > this.result.homeScore ? 'away' : 'draw';
    }
    next();
});

module.exports = mongoose.model( 'FootballFixture', footballFixtureSchema );