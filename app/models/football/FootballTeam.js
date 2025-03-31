const { Schema, default: mongoose } = require('mongoose');

const footballTeamSchema = new Schema({
    name: { type: String, required: true },
    shorthand: { type: String, required: true },
    department: { type: String },
    year: { type: String },
    coach: { type: String },
    assistantCoach: { type: String },
    captain: {
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    }],
    competitionInvitations: [{
        competition: {
            type: Schema.Types.ObjectId,
            ref: 'FootballCompetition'
        },
        status: {
            type: String,
            enum: [ 'accepted', 'rejected', 'pending' ],
            default: 'pending'
        }
    }],
    friendlyRequests: [{
        requestId: { type: Schema.Types.ObjectId },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'FootballTeam'
        },
        status: {
            type: String,
            enum: [ 'accepted', 'pending', 'rejected' ],
            default: 'pending'
        },
        type: {
            type: String,
            enum: [ 'sent', 'received' ]
        },
        date: { type: Date },
        location: { type: String }
    }],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'RefactoredUser',
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model( 'FootballTeam', footballTeamSchema );