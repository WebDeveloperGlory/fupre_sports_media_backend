const { Schema, default: mongoose } = require('mongoose');
const db = require('../../config/db');

const leagueStandingsSchema = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTeam'
    },
    played: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    disciplinaryPoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    form: [{
        type: String,
        enum: [ 'W', 'L', 'D' ]
    }],
    position: { type: Number },
});
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Group A"
    standings: [ leagueStandingsSchema ],
    fixtures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FootballFixture'
    }],
});
const knockoutRoundSchema = new Schema({
    name: { type: String, required: true }, // e.g., "Round of 16", "Quarter Finals"
    fixtures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FootballFixture'
    }],
    fixtureFormat: {
        type: String,
        enum: [ 'single_leg', 'two_legs', 'best_of_three' ],
        default: 'single_leg'
    },
    completed: { type: Boolean, default: false },
});

const footballCompetitionSchema = db.RefactoredCompetition.discriminator('football', new Schema({
    // General Info
    format: {
        type: String,
        enum: [ 'knockout', 'hybrid', 'league' ],
        required: true
    },
    season: { type: String }, // e.g., "2023/2024"

    // Teams
    teams: [{
        team: {
            type: Schema.Types.ObjectId,
            ref: 'FootballTeam',
            required: true
        },
        squadList: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    }],

    // Tables
    leagueTable: [ leagueStandingsSchema ],
    knockoutRounds: [ knockoutRoundSchema ],
    groupStage: [ groupSchema ],

    // Statistics
    stats: {
        totalGoals: { type: Number, default: 0 },
        homeWinsPercentage: { type: Number, default: 0 },
        awayWinsPercentage: { type: Number, default: 0 },
        drawsPercentage: { type: Number, default: 0 },
        yellowCardsAvg: { type: Number, default: 0 },
        redCardsAvg: { type: Number, default: 0 },
        topScorers: [{
            player: {
                type: Schema.Types.ObjectId,
                ref: 'FootballPlayer'
            },
            goals: Number,
            assists: Number,
            penalties: Number
        }],
        topAssists: [{
            player: {
                type: Schema.Types.ObjectId,
                ref: 'FootballPlayer'
            },
            goals: Number,
            assists: Number,
            penalties: Number
        }],
        mostCleanSheets: [{
            player: {
                type: Schema.Types.ObjectId,
                ref: 'FootballPlayer'
            },
            cleanSheets: Number
        }]
    },

    // Awards
    awards: [{
        name: String,
        recipient: {
            type: Schema.Types.ObjectId,
            refPath: 'awards.recipientModel'
        },
        recipientModel: {
            type: String,
            enum: ['FootballPlayer', 'FootballTeam']
        }
    }],

    // Rules
    rules: {
        substitutions: {
          allowed: { type: Boolean, default: true },
          maximum: { type: Number, default: 5 }
        },
        extraTime: { type: Boolean, default: false },
        penalties: { type: Boolean, default: false },
        matchDuration: {
            normal: { type: Number, default: 90 }, // minutes
            extraTime: { type: Number }
        },
        squadSize: {
            min: { type: Number, default: 7 },
            max: { type: Number, default: 23 }
        },
    },

    // Sponsorships
    sponsors: [{
        name: String,
        logo: String,
        sponsorshipLevel: String
    }],
}));

module.exports = footballCompetitionSchema;