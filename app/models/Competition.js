const { Schema, default: mongoose } = require('mongoose');

const competitionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    rules: [ { type: String } ],
    teams: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }
    ],
    type: {
        type: String,
        enum: [ 'knockout', 'hybrid', 'league' ],
        required: true
    }, 
    fixtures: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Fixture'
        }
    ], 
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    playerStats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'PlayerCompetitionStat'
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
                    ref: 'Fixture'
                }
            ],
            teams: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Team'
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
                    ref: 'Fixture'
                }
            ],
            teams: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Team'
                }
            ]
        }
    ], 
    leagueTable: [
        {
            team: {
                type: Schema.Types.ObjectId,
                ref: 'Team'
            },
            position: {
                type: Number,
                required: true
            },
            points: {
                type: Number,
                default: 0
            },
            wins: {
                type: Number,
                default: 0
            },
            loss: {
                type: Number,
                default: 0
            },
            draw: {
                type: Number,
                default: 0
            },
            goalsScored: {
                type: Number,
                default: 0
            },
            goalsConceeded: {
                type: Number,
                default: 0
            },
        }
    ], 
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'Competition', competitionSchema )