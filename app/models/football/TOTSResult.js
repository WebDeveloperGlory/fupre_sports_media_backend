const { Schema, default: mongoose } = require('mongoose');

const teamOfTheSeasonResultSchema = new Schema({
    session: {
        type: Schema.Types.ObjectId,
        ref: 'FootballTOTSSession',
        required: true
    },
    votersChoice: {
        formation: { type: 'String' },
        GK: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
        DEF: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        MID: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        FWD: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
    adminChoice: {
        formation: { type: 'String' },
        GK: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
        DEF: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        MID: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        FWD: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
    finalWinner: {
        formation: { type: 'String' },
        GK: {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
        DEF: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        MID: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
        FWD: [{
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        }],
    },
}, { timestamps: true });

module.exports = mongoose.model( 'FootballTOTSResult', teamOfTheSeasonResultSchema );