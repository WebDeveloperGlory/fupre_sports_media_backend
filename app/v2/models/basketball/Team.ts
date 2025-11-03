import { Document, model, Types, Schema } from 'mongoose';
import { CoachRoles, TeamTypes } from '../../types/team.enums';
import { IV2BasketballPlayerUnpop } from './Player';
import { IV2Department } from '../general/Department';
import { IV2Faculty } from '../general/Faculty';

interface Team extends Document {
    _id: Types.ObjectId;

    name: string;
    shorthand: string;
    logo: string;
    type: TeamTypes;
    colors: {
        primary: string;
        secondary: string;
    };
    academicYear: string;

    stats: {
        gamesPlayed: number;
        wins: number;
        loses: number;
        draws: number;
        pointsFor: number;
        pointsAgainst: number;
    };
    competitionPerformance: {
        competition: Types.ObjectId;
        season: string;
        stats: {
            played: number;
            wins: number;
            draws: number;
            losses: number;
            pointsFor: number;
            pointsAgainst: number;
        };
        achievements: string[];
    }[];

    coaches: {
        name: string;
        role: CoachRoles;
    }[];

    admin: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballTeamUnpop extends Team {
    department?: Types.ObjectId;
    faculty?: Types.ObjectId;
    players: Types.ObjectId[];
};
export interface IV2BasketballTeamPop extends Team {
    department?: IV2Department;
    faculty?: IV2Faculty;
    players: IV2BasketballPlayerUnpop[];
};

const v2basketballTeamSchema = new Schema<IV2BasketballTeamUnpop>({
    // Basic Info
    name: { type: String, required: true },
    shorthand: { type: String, required: true },
    logo: { type: String },
    colors: {
        primary: { type: String },
        secondary: { type: String },
    },
    academicYear: { type: String, required: true },
    type: { type: String, required: true, enum: Object.values(TeamTypes) },
    department: { type: Schema.Types.ObjectId, ref: 'V2Department' },
    faculty: { type: Schema.Types.ObjectId, ref: 'V2Faculty' },

    // Team Person Details
    players: [{ type: Schema.Types.ObjectId, ref: 'V2BasketballPlayer' }],
    coaches: [
        {
            name: { type: String, required: true },
            role: { type: String, required: true, enum: Object.values(CoachRoles) },
        },
    ],

    // Team Stats
    stats: {
        gamesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        loses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        pointsFor: { type: Number, default: 0 },
        pointsAgainst: { type: Number, default: 0 },
    },
    competitionPerformance: [{
        competition: { type: Schema.Types.ObjectId, ref: 'V2BasketballCompetition', required: true },
        season: { type: String, required: true },
        gamesPlayed: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        loses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        pointsFor: { type: Number, default: 0 },
        pointsAgainst: { type: Number, default: 0 },
    }],

    admin: { type: Schema.Types.ObjectId, ref: 'V2User' },
},{ timestamps: true });

export default model<IV2BasketballTeamUnpop>(
    'V2BasketballTeam',
    v2basketballTeamSchema, 
    'v2basketballTeams'
);