const { Schema, default: mongoose } = require('mongoose');

const footballCompetitionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    rules: [ { type: String } ],
    description: {
        type: String, 
        required: true
    },
    teams: [
        {
            team: {
                type: Schema.Types.ObjectId,
                ref: 'FootballTeam',
                required: true
            },
            squadList: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'FootballPlayer'
                }
            ]
        }
    ],
    type: {
        type: String,
        enum: [ 'knockout', 'hybrid', 'league' ],
        required: true
    },
    status: {
        type: String,
        enum: [ 'ongoing', 'completed', 'pending' ],
        default: 'pending'
    },
    fixtures: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FootballFixture'
        }
    ], 
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    playerStats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayerCompetitionStat'
        }
    ], 
    knockoutRounds: [
        {
            name: {
                type: String,
                required: true
            },
            fixtures: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'FootballFixture'
                }
            ],
            teams: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'FootballTeam'
                }
            ]
        }
    ],
    groupStage: [
        {
            name: {
                type: String,
                required: true
            },
            fixtures: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'FootballFixture'
                }
            ],
            teams: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'FootballTeam'
                }
            ]
        }
    ], 
    leagueTable: [
        {
            team: {
                type: Schema.Types.ObjectId,
                ref: 'FootballTeam'
            },
            played: { type: Number, default: 0 },
            points: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            draws: { type: Number, default: 0 },
            goalsFor: { type: Number, default: 0 },
            goalsAgainst: { type: Number, default: 0 },
            goalDifference: { type: Number, default: 0 },
            form: [ 
                {
                    type: String,
                    enum: [ 'W', 'L', 'D' ]
                }
            ]
        }
    ],
    isFeatured: {
        type: Boolean,
        default: false
    },
    stats: {
        totalGoals: { type: Number, default: 0 },
        homeWinsPercentage: { type: Number, default: 0 },
        awayWinsPercentage: { type: Number, default: 0 },
        drawsPercentage: { type: Number, default: 0 },
        yellowCardsAvg: { type: Number, default: 0 },
        redCardsAvg: { type: Number, default: 0 },
    },
    rounds: [
        {
            type: String
        }
    ],
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model( 'FootballCompetition', footballCompetitionSchema );