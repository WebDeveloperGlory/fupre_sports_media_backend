const { Schema, default: mongoose } = require('mongoose');

const footballPlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: [ 
            'CB', 'LB', 'RB', 'WB', 'GK',
            'CMF', 'DMF', 'AMF',
            'LW', 'RW', 'ST'
        ]
    },
    number: {
        type: Number,
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTeam'
    },
    status: {
        type: String,
        enum: [ 'active', 'loaned', 'transferred' ],
        default: 'active'
    },
    transferDetails: {
        status: {
            type: String,
            enum: ['loaned', 'transferred'],
        },
        fromTeam: {
            type: Schema.Types.ObjectId,
            ref: 'FootballTeam',
        },
        toTeam: {
            type: Schema.Types.ObjectId,
            ref: 'FootballTeam',
        },
        transferDate: {
            type: Date,
        },
        returnDate: {
            type: Date,
        }
    },
    generalRecord: [
        {
            year: { type: Number, required: true },
            goals: { type: Number, default: 0 },
            ownGoals: { type: Number, default: 0 },
            assists: { type: Number, default: 0 },
            yellowCards: { type: Number, default: 0 },
            redCards: { type: Number, default: 0 },
            appearances: { type: Number, default: 0 },
            cleanSheets: { type: Number, default: 0 }
        }
    ],
    competitionStats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayerCompetitionStat'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'FootballPlayer', footballPlayerSchema );