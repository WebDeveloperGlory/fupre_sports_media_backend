const { Schema, default: mongoose } = require('mongoose');

const playerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: [ 
            'CB', 'LB', 'RB', 'GK',
            'CMF', 'DMF', 'AMF',
            'LW', 'RW', 'ST'
        ]
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    generalRecord: [
        {
            year: { type: Number, required: true },
            goals: { type: Number, default: 0 },
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
            ref: 'PlayerCompetitionStat'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'Player', playerSchema );