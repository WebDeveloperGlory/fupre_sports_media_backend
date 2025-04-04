const { Schema, default: mongoose } = require('mongoose');

const footballPlayerSchema = new Schema({
    // Basic Info
    name: { type: String, required: true, },
    department: { type: String, required: true, },
    position: {
        type: String,
        required: true,
        enum: [ 
            'CB', 'LB', 'RB', 'WB', 'GK',
            'CMF', 'DMF', 'AMF',
            'LW', 'RW', 'ST'
        ]
    },
    number: { type: Number },

    // Team Associations
    baseTeam: { type: Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
    departmentTeam: { type: Schema.Types.ObjectId, ref: 'FootballTeam' },
    clubTeam: { type: Schema.Types.ObjectId, ref: 'FootballTeam' },
    schoolTeam: { type: Schema.Types.ObjectId, ref: 'FootballTeam' },
    
    // Club Status
    clubStatus: {
        type: String,
        enum: ['active', 'loaned', 'transferred', 'not-applicable'],
        default: 'not-applicable'
    },
    transferDetails: {
        status: { type: String, enum: ['loaned', 'transferred'] },
        fromClub: { type: Schema.Types.ObjectId, ref: 'FootballTeam' },
        toClub: { type: Schema.Types.ObjectId, ref: 'FootballTeam' },
        transferDate: { type: Date },
        returnDate: { type: Date }
    },

    // Statistics Structure
    stats: {
        // Career totals across all teams and match types
        careerTotals: {
            goals: { type: Number, default: 0 },
            ownGoals: { type: Number, default: 0 },
            assists: { type: Number, default: 0 },
            yellowCards: { type: Number, default: 0 },
            redCards: { type: Number, default: 0 },
            appearances: { type: Number, default: 0 },
            cleanSheets: { type: Number, default: 0 }
        },
        
        // Team-specific stats (each team type has same structure)
        byTeam: {
            baseTeam: {
                friendly: [seasonStatSchema],
                competitive: [seasonStatSchema],
                totals: seasonStatSchema
            },
            departmentTeam: {
                friendly: [seasonStatSchema],
                competitive: [seasonStatSchema],
                totals: seasonStatSchema
            },
            clubTeam: {
                friendly: [seasonStatSchema],
                competitive: [seasonStatSchema],
                totals: seasonStatSchema
            },
            schoolTeam: {
                friendly: [seasonStatSchema],
                competitive: [seasonStatSchema],
                totals: seasonStatSchema
            }
        },

        // Competition-specific stats (reference by competition ID)
        byCompetition: [
            {
                competition: { 
                    type: Schema.Types.ObjectId, 
                    ref: 'FootballCompetition',
                    required: true 
                },
                season: { type: String, required: true }, // e.g., "2023/2024"
                stats: seasonStatSchema
            }
        ]
    }
}, { timestamps: true });

// Reusable season stat schema
const seasonStatSchema = new Schema({
    season: { type: String, required: true }, // e.g., "2023/2024"
    goals: { type: Number, default: 0 },
    ownGoals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    appearances: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 }
});

module.exports = mongoose.model( 'FootballPlayer', footballPlayerSchema );