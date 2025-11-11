import { Document, model, Types, Schema } from 'mongoose';
import { FixtureOdds, FixtureStatus } from '../../types/fixture.enums';
import { IV2BasketballTeamUnpop } from './Team';
import { IV2BasketballCompetitionUnpop } from './Competition';

interface Fixture extends Document {
    _id: Types.ObjectId;
    matchType: 'friendly' | 'competition';

    scheduledDate: Date;
    status: FixtureStatus;
    postponedReason: string;
    rescheduledDate: Date;

    homeScore: number;
    awayScore: number;

    homeQ1score: number;
    homeQ2score: number;
    homeQ3score: number;
    homeQ4score: number;
    homeOTscore: number;

    awayQ1score: number;
    awayQ2score: number;
    awayQ3score: number;
    awayQ4score: number;
    awayOTscore: number;

    round?: string;
    referee: string;
    stadium: string;
    attendance: number;
    weather: {
        condition: string;
        temperature: number;
    };
    isDerby: boolean;
    odds: FixtureOdds;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballFixtureUnpop extends Fixture {
    homeTeam: Types.ObjectId;
    awayTeam: Types.ObjectId;
    competition: Types.ObjectId | null;
};
export interface IV2BasketballFixturePop extends Fixture {
    homeTeam: IV2BasketballTeamUnpop;
    awayTeam: IV2BasketballTeamUnpop;
    competition: IV2BasketballCompetitionUnpop | null;
};

const v2basketballFixtureSchema = new Schema<IV2BasketballFixtureUnpop>({
    // Basic Info
    homeTeam: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
    competition: { type: Schema.Types.ObjectId, ref: 'V2BasketballCompetition' },
    matchType: { type: String, enum: ['friendly', 'competition'], default: 'friendly' },

    // Score Info
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },

    // Quater/Period Score Info
    homeQ1score: { type: Number },
    homeQ2score: { type: Number },
    homeQ3score: { type: Number },
    homeQ4score: { type: Number },
    homeOTscore: { type: Number },

    awayQ1score: { type: Number },
    awayQ2score: { type: Number },
    awayQ3score: { type: Number },
    awayQ4score: { type: Number },
    awayOTscore: { type: Number },

    // Match Schedule Info
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: Object.values(FixtureStatus), default: FixtureStatus.SCHEDULED },
    postponedReason: { type: String },
    rescheduledDate: { type: Date },

    // Additional Info
    stadium: { type: String },
    referee: { type: String },
    attendance: { type: Number },
    round: { type: String },
    weather: {
        condition: String,
        temperature: Number
    },
    isDerby: { type: Boolean, default: false },
    odds: {
        preMatch: {
            homeWin: Number,
            draw: Number,
            awayWin: Number,
            overUnder: [{
                line: Number, // e.g., 2.5 for over/under 2.5 goals
                over: Number,
                under: Number
            }]
        },
        live: {
            updatedAt: Date,
            homeWin: Number,
            draw: Number,
            awayWin: Number,
            overUnder: [{
                line: Number,
                over: Number,
                under: Number
            }]
        }
    },
}, { timestamps: true });

export default model<IV2BasketballFixtureUnpop>(
    'V2BasketballFixture',
    v2basketballFixtureSchema,
    'v2basketballFixtures'
);