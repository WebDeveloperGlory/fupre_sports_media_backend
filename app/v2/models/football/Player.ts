import { Schema, model, Document, ObjectId } from 'mongoose';
import { FavoriteFoot, PlayerClubStatus } from '../../types/player.enums';
import { PlayerRole } from '../../types/player.enums';

export interface IV2FootballPlayer extends Document {
    _id: ObjectId;

    name: string;
    department: ObjectId;
    admissionYear: string;

    teams: {
        team: ObjectId;
        role: PlayerRole;
        position: string;
        jerseyNumber: number;
        isActive: boolean;
        joinedAt: Date;
    }[];

    careerStats: {
        appearances: number,
        goals: number,
        assists: number,
        cleanSheets: number,
        yellowCards: number,
        redCards: number,
        motmAwards: number
    };
    seasonalStats: {
        academicYear: string;
        team: ObjectId;
        stats: {
            appearances: number,
            goals: number,
            assists: number,
            cleanSheets: number,
            yellowCards: number,
            redCards: number,
            motmAwards: number
        }
    }[];
    competitionStats: {
        competition: ObjectId,
        season: string,
        team: ObjectId,
        appearances: number,
        goals: number,
        assists: number,
        yellowCards: number,
        redCards: number,
        minutesPlayed: number,
    }[],

    clubStatus?: PlayerClubStatus;
    loanDetails?: {
        fromClub: ObjectId,
        toTeam: ObjectId,
        startDate: Date,
        endDate: Date,
        terms: string
    };
    marketValue: number;

    preferredFoot: FavoriteFoot;
    weight: string;
    height: string;

    createdAt: Date;
    updatedAt: Date;
}

const v2footballplayerSchema = new Schema<IV2FootballPlayer>({
    name: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'V2Department', required: true },
    admissionYear: { type: String },

    // Team Memberships (Current)
    teams: [{
        team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
        role: { 
            type: String, 
            enum: Object.values( PlayerRole ),
            default: PlayerRole.PLAYER
        },
        position: String,
        jerseyNumber: Number,
        isActive: { type: Boolean, default: true },
        joinedAt: { type: Date, default: Date.now }
    }],

    // Career Stats (Lifetime)
    careerStats: {
        appearances: { type: Number, default: 0 },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        cleanSheets: { type: Number, default: 0 }, // For goalkeepers
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        motmAwards: { type: Number, default: 0 }
    },

    // Team-Season and Competition Stats (Granular)
    seasonalStats: [{
        academicYear: String, // "2024/2025"
        team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
        stats: {
            appearances: Number,
            goals: Number,
            assists: Number,
            yellowCards: Number,
            redCards: Number,
            motmAwards: Number // Man of the Match
        }
    }],
    competitionStats: [{
        competition: { type: Schema.Types.ObjectId, ref: 'V2FootballCompetition' },
        season: String, // "2023/2024"
        team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' }, // Which team they played for
        appearances: Number,
        goals: Number,
        assists: Number,
        yellowCards: Number,
        redCards: Number,
        minutesPlayed: Number,
        position: String // Their primary position in this competition
    }],

    // Club-Specific Fields
    clubStatus: {
        type: String,
        enum: Object.values( PlayerClubStatus ),
    },
    loanDetails: {
        fromClub: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
        toTeam: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
        startDate: Date,
        endDate: Date,
        terms: String
    },
    marketValue: { // Only for club players
        type: Number,
        default: null
    },

    // Physical Attributes
    preferredFoot: {
        type: String,
        enum: Object.values( FavoriteFoot )
    },
    height: Number, // in cm
    weight: Number, // in kg
}, {
    timestamps: true
});

export default model<IV2FootballPlayer>('V2FootballPlayer', v2footballplayerSchema, 'v2footballPlayers');