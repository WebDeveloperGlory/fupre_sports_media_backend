const { Schema, default: mongoose } = require('mongoose');

const teamSchema = new Schema({
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
        ref: 'Player'
    },
    players: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
    ],
    competitionInvitations: [
        {
            competition: {
                type: Schema.Types.ObjectId,
                ref: 'Competition'
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
                ref: 'Team'
            },
            status: {
                type: String,
                enum: [ 'accepted', 'pending', 'rejected' ],
                default: 'pending'
            }
        }
    ],
    fixtures: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Fixture'
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'Team', teamSchema );