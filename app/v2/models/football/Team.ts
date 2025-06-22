import { Schema, model, Document, ObjectId } from 'mongoose';
import { CoachRoles, FriendlyRequestStatus, TeamTypes } from '../../types/team.enums';

export interface IV2FootballTeam extends Document {
    _id: ObjectId;
    name: string;
    shorthand: string

    type: TeamTypes;
    academicYear: string;
    department?: ObjectId;
    faculty?: ObjectId;

    coaches: {
        name: string;
        role: CoachRoles;
    }[];
    players: ObjectId[];

    friendlyRequests: {
        team: ObjectId,
        status: FriendlyRequestStatus,
        proposedDate: Date,
        message: String,
        createdAt: Date,
    }[];
    competitionPerformance: {
        competition: ObjectId,
        season: string,
        stats: {
            played: number,
            wins: number,
            draws: number,
            losses: number,
            goalsFor: number,
            goalsAgainst: number,
            cleanSheets: number
        },
        achievements: string[]
    }[];

    stats: {
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
        cleanSheets: number;
    };

    logo: string;
    colors: {
        primary: string;
        secondary: string;
    }

    admin: ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const v2footballteamSchema = new Schema<IV2FootballTeam>({
    // Identity
    name: { type: String, required: true },
    shorthand: { type: String, required: true },

    // Team Classification
    type: {
        type: String,
        enum: Object.values( TeamTypes ),
        required: true
    },

     // Academic Context
    academicYear: { type: String, required: true },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'V2Department',
        required: function( this: IV2FootballTeam ) { 
            return this.type.includes('departmental');
        }
    },    
    faculty: {
        type: Schema.Types.ObjectId,
        ref: 'V2Faculty',
        required: function( this: IV2FootballTeam ) { 
            return this.type === TeamTypes.FACULTY_GENERAL;
        }
    },

    // Coaches and Players
    coaches: [{
        name: { type: String },
        role: { type: String, enum: Object.values( CoachRoles ) }
    }],
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'V2FootballPlayer'
    }],

    // Friendlies and Competitions
    friendlyRequests: [{
        team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
        status: { 
            type: String, 
            enum: Object.values( FriendlyRequestStatus )
        },
        proposedDate: Date,
        message: String,
        createdAt: { type: Date, default: Date.now }
    }],
    competitionPerformance: [{
        competition: { type: Schema.Types.ObjectId, ref: 'Competition' },
        season: String, // "2023/2024"
        stats: {
        played: Number,
        wins: Number,
        draws: Number,
        losses: Number,
        goalsFor: Number,
        goalsAgainst: Number,
        cleanSheets: Number
        },
        achievements: [String] // e.g. ["Champions", "Fair Play Award"]
    }],

    // Stats Tracking (Per Academic Year)
    stats: {
        matchesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },
        cleanSheets: { type: Number, default: 0 }
    },

    // Metadata
    logo: String,
    colors: {
        primary: String,
        secondary: String
    },

    // Admin
    admin: { type: Schema.Types.ObjectId, ref: 'V2User' }
}, {
    timestamps: true
});

export default model<IV2FootballTeam>('V2FootballTeam', v2footballteamSchema, 'v2footballTeams');