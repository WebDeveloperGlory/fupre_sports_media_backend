const { Schema, default: mongoose } = require('mongoose');

const footballTeamSchema = new Schema({
    // Basic info
    name: { type: String, required: true },
    shorthand: { 
        type: String, 
        required: true,
        uppercase: true,
        maxlength: 5
    },
    type: {
        type: String,
        required: true,
        enum: ['base', 'department', 'club', 'school'],
        default: 'club'
    },
    department: { 
        type: String,
        required: function() { return this.type === 'base' || this.type === 'department' }
    },
    year: { 
        type: String,
        validate: {
            validator: function(v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid academic year format (YYYY/YYYY)`
        },
        required: function() { return this.type === 'base'; }
    },
    logo: { type: String },
    colors: {
        primary: { type: String, default: '#000000' },
        secondary: { type: String, default: '#FFFFFF' }
    },

    // Coaches and Players
    coaches: [{
        _id: false,
        user: { 
            type: Schema.Types.ObjectId,
            ref: 'RefactoredUser'
        },
        role: {
            type: String,
            enum: ['head', 'assistant', 'goalkeeping', 'fitness']
        }
    }],
    captain: {
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'FootballPlayer'
    }],

    // Competitions
    competitionInvitations: [{
        competition: {
            type: Schema.Types.ObjectId,
            ref: 'FootballCompetition'
        },
        status: {
            type: String,
            enum: ['accepted', 'pending', 'rejected', 'withdrawn'],
            default: 'pending'
        },
        registrationDate: { type: Date, default: Date.now }
    }],

    // Friendly Matches
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

    // Admin
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'RefactoredUser',
        default: null
    },

    // Statistics
    stats: {
        wins: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        corners: { type: Number, default: 0 },
        offsides: { type: Number, default: 0 },
        fouls: { type: Number, default: 0 },
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtuals for fixture relationships instead
footballTeamSchema.virtual('homeFixtures', {
    ref: 'FootballFixture',
    localField: '_id',
    foreignField: 'homeTeam',
    justOne: false
});

footballTeamSchema.virtual('awayFixtures', {
    ref: 'FootballFixture',
    localField: '_id',
    foreignField: 'awayTeam',
    justOne: false
});

module.exports = mongoose.model( 'FootballTeam', footballTeamSchema );