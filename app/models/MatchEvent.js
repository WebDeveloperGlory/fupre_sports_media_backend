const { Schema, default: mongoose } = require('mongoose');

const matchEventSchema = new Schema({
    fixture: {
        type: Schema.Types.ObjectId,
        ref: 'Fixture',
        required: true
    },
    eventType: {
        type: String,
        enum: [ 'goal', 'assist', 'yellow-card', 'red-card', 'substitution', 'own-goal' ],
        required: true
    },
    playerInvolved: {
        type: Schema.Types.ObjectId,
        ref: 'Player'
    },
    assistingPlayer: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: function() {
            return this.eventType === 'goal'
        }
    }, 
    substitutedOutPlayer: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: function() {
            return this.eventType === 'substitution'
        }
    }, 
    substitutedInPlayer: {
        type: Schema.Types.ObjectId,
        ref: 'Player',
        required: function() {
            return this.eventType === 'substitution'
        }
    }, 
    timestamp: {
        type: String,
        required: true
    }, 
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }, 
    competition: {
        type: Schema.Types.ObjectId,
        ref: 'Competition'
    }, 
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model( 'MatchEvent', matchEventSchema );