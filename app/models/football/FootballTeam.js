const { Schema, default: mongoose } = require('mongoose');

const footballTeamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    shorthand: {
        type: String,
        required: true
    },
    department: { type: 'String' },
    level: {
        type: String,
        enum: [ '100', '200', '300', '400', '500', 'General' ]
    },
    coach: { type: String },
    assistantCoach: { type: String },
    captain: {
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    },
    players: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FootballPlayer'
        },
    ],
    competitionInvitations: [
        {
            competition: {
                type: Schema.Types.ObjectId,
                ref: 'FootballCompetition'
            },
            status: {
                type: String,
                enum: [ 'accepted', 'rejected', 'pending' ],
                default: 'pending'
            }
        },
    ],
    friendlyRequests: [
        {
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
                enum: [ 'sent', 'recieved' ]
            },
            date: { type: Date },
            location: { type: String }
        }
    ],
    fixtures: [
        {
            type: Schema.Types.ObjectId,
            ref: 'FootballFixture'
        },
    ],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'FootballTeam', footballTeamSchema );