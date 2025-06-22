import { Schema, model, Document, ObjectId, DataSizeOperatorReturningNumber } from 'mongoose';
import { CompetitionSponsors, CompetitionTeamForm, CompetitionTypes } from '../../types/competition.enums';

export interface IV2FootballCompetition extends Document {
    _id: ObjectId;

    name: string;
    shorthand: string;
    type: CompetitionTypes;
    logo: string;
    coverImage: string;

    format: {
        groupStage?: {
            numberOfGroups: number,
            teamsPerGroup: number,
            advancingPerGroup: number
        },
        knockoutStage?: {
            hasTwoLegs: boolean,
            awayGoalsRule: boolean,
        },
        leagueStage?: {
            matchesPerTeam: number,
            pointsSystem: {
                win: number
                draw: number
                loss: number
            }
        }
    };

    season: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline?: Date;
    currentStage?: string;

    teams: {
        team: ObjectId,
        squad: {
            player: ObjectId,
            jerseyNumber: number,
            isCaptain: boolean,
            position: string
        }[],
    }[],

    // Statistics (Aggregated)
    stats: {
        averageGoalsPerMatch: Number,
        averageAttendance: Number,
        cleanSheets: Number,
        topScorers: [{
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            goals: Number,
            penalties: Number
        }],
        topAssists: [{
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            assists: Number
        }],
        bestDefenses: [{
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            cleanSheets: Number,
            goalsConceded: Number
        }]
    },

    leagueTable: ILeagueStandings[],
    knockoutRounds: IKnockoutRounds[],
    groupStage: IGroupTable[],

    awards: {
        player: {
            name: string,
            winner: {
                player: ObjectId,
                team: ObjectId,
            }
        }[],
        team: {
            name: string,
            winner: ObjectId,
        }[]
    },

    rules: {
        substitutions: {
            allowed: boolean,
            maximum: number,
        },
        extraTime: boolean,
        penalties: boolean,
        matchDuration: {
            normal: number, // minutes
            extraTime: number
        },
        squadSize: {
            min: number,
            max: number
        },
    },
    extraRules: {
        title: string,
        description: string,
        lastUpdated: Date
    }[],
    sponsors: {
        name: string,
        logo: string,
        tier: CompetitionSponsors
    }[],

    prizeMoney?: {
        champion: number,
        runnerUp: number,
    },
    isActive: boolean
    isFeatured: boolean

    admin: ObjectId

    createdAt: Date;
    updatedAt: Date;
}

export interface ILeagueStandings {
    _id: ObjectId;

    team: ObjectId;
    played: number;
    points: number;
    disciplinaryPoints: number;
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    form: CompetitionTeamForm[],
    position: number,
}

export interface IKnockoutRounds {
    _id: ObjectId;

    name: string,
    fixtures: ObjectId[],
    completed: boolean
}

export interface IGroupTable {
    _id: ObjectId;

    name: string;
    standings: ILeagueStandings[];
    fixtures: ObjectId[];
}

const leagueStandingsSchema = new Schema<ILeagueStandings>({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'V2FootballTeam'
    },
    played: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    disciplinaryPoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    form: [{
        type: String,
        enum: Object.values( CompetitionTeamForm )
    }],
    position: { type: Number },
}, { _id: true });
const groupSchema = new Schema<IGroupTable>({
    name: { type: String, required: true }, // e.g., "Group A"
    standings: [ leagueStandingsSchema ],
    fixtures: [{
        type: Schema.Types.ObjectId,
        ref: 'V2FootballFixture'
    }],
}, { _id: true });
const knockoutRoundSchema = new Schema<IKnockoutRounds>({
    name: { type: String, required: true }, // e.g., "Round of 16", "Quarter Finals"
    fixtures: [{
        type: Schema.Types.ObjectId,
        ref: 'V2FootballFixture'
    }],
    completed: { type: Boolean, default: false },
}, { _id: true });

const v2footballcompetitionSchema = new Schema<IV2FootballCompetition>({
    // Core Identity
    name: { type: String, required: true, unique: true },
    shorthand: { type: String, required: true },
    type: {
        type: String,
        enum: Object.values( CompetitionTypes ),
        required: true
    },
    logo: String,
    coverImage: String,

    // Competition Structure
    format: {
        groupStage: {
            numberOfGroups: Number,
            teamsPerGroup: Number,
            advancingPerGroup: Number
        },
        knockoutStage: {
            hasTwoLegs: Boolean,
            awayGoalsRule: Boolean,
        },
        leagueStage: {
            matchesPerTeam: Number,
            pointsSystem: {
                win: { type: Number, default: 3 },
                draw: { type: Number, default: 1 },
                loss: { type: Number, default: 0 }
            }
        }
    },

    // Tables
    leagueTable: [ leagueStandingsSchema ],
    knockoutRounds: [ knockoutRoundSchema ],
    groupStage: [ groupSchema ],

    // Timeframe
    season: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,
    currentStage: { type: String },

    // Participants
    teams: [{
        team: { 
            type: Schema.Types.ObjectId, 
            ref: 'V2FootballTeam',
            required: true
        },
        squad: [{ // Registered players for this competition
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            jerseyNumber: Number,
            isCaptain: Boolean,
            position: String
        }],
    }],

    // Statistics (Aggregated)
    stats: {
        averageGoalsPerMatch: Number,
        averageAttendance: Number,
        cleanSheets: Number,
        topScorers: [{
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            goals: Number,
            penalties: Number
        }],
        topAssists: [{
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            assists: Number
        }],
        bestDefenses: [{
            team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' },
            cleanSheets: Number,
            goalsConceded: Number
        }]
    },

    // Awards
    awards: {
        player: [{
            name: String, // "Golden Boot", "Player of the Season"
            winner: {
                player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
                team: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' }
            }
        }],
        team: [{
            name: String, // "Fair Play Award"
            winner: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam' }
        }]
    },

    // Governance
    rules: {
        substitutions: {
          allowed: { type: Boolean, default: true },
          maximum: { type: Number, default: 5 }
        },
        extraTime: { type: Boolean, default: false },
        penalties: { type: Boolean, default: false },
        matchDuration: {
            normal: { type: Number, default: 90 }, // minutes
            extraTime: { type: Number }
        },
        squadSize: {
            min: { type: Number, default: 7 },
            max: { type: Number, default: 23 }
        },
    },
    extraRules: [{
        title: String,
        description: String,
        lastUpdated: Date
    }],
    sponsors: [{
        name: String,
        logo: String,
        tier: { type: String, enum: Object.values( CompetitionSponsors ) }
    }],

    // Metadata
    prizeMoney: {
        champion: Number,
        runnerUp: Number,
    },
    isActive: { type: Boolean, default: true },
    isFeatured: Boolean,

    admin: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default model<IV2FootballCompetition>('V2FootballCompetition', v2footballcompetitionSchema, 'v2footballCompetitions');