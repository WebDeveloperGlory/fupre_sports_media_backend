import { Document, model, Types, Schema } from "mongoose";
import { IV2BasketballTeamUnpop } from "./Team";
import { IV2BasketballFixtureUnpop } from "./Fixture";
import { IV2BasketballCompetitionUnpop } from "./Competition";
import { IV2BasketballFixturePlayerStatUnpop } from "./FixturePlayerStat";
import { BasketballEventType } from "../../types/fixture.enums";

interface LiveFixture extends Document {
    _id: Types.ObjectId;

    matchType: 'friendly' | 'competition';
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

    currentQuarter: number;
    gameClock: number;
    shotClock: number;

    homeTimeouts: {
        remaining: number;
        used: number;
        lastCalled: Date;
    };
    awayTimeouts: {
        remaining: number;
        used: number;
        lastCalled: Date;
    };

    homeFouls: number;
    awayFouls: number;
    possession: "home" | "away";

    events: BasketballEvent[];

    referee: string;
    stadium: string;
    attendance: number;
    weather: {
        condition: string;
        temperature: number;
    };

    liveOdds: {
        updatedAt: { type: Date };
        homeWin: number;
        draw: number;
        awayWin: number;
        overUnder: {
            line: number;
            over: number;
            under: number;
        }[];
    };

    admin: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballLiveFixturePop extends LiveFixture {
    homeTeam: IV2BasketballTeamUnpop;
    awayTeam: IV2BasketballTeamUnpop;
    fixture: IV2BasketballFixtureUnpop;
    competition: IV2BasketballCompetitionUnpop | null;
    playerStats: IV2BasketballFixturePlayerStatUnpop[];
}
export interface IV2BasketballLiveFixtureUnpop extends LiveFixture {
    homeTeam: Types.ObjectId;
    awayTeam: Types.ObjectId;
    fixture: Types.ObjectId;
    competition: Types.ObjectId | null;
    playerStats: Types.ObjectId[];
}

export interface BasketballEvent {
    _id: Types.ObjectId;

    quater: number;
    player: Types.ObjectId;
    team: Types.ObjectId;

    type: BasketballEventType;
    gameState: {
        homeScore: number;
        awayScore: number;
        homeFouls: number;
        awayFouls: number;
        possession: 'home' | 'away';
    };

    createdAt: Date;
    updatedAt: Date;
}

const eventSchema = new Schema<BasketballEvent>({
    quater: { type: Number, required: true },
    player: { type: Schema.Types.ObjectId, ref: 'V2BasketballPlayer', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
    type: { type: String, enum: Object.values(BasketballEventType) },
    gameState: {
        homeScore: { type: Number },
        awayScore: { type: Number },
        homeFouls: { type: Number },
        awayFouls: { type: Number },
        possession: { type: String, enum: ['home', 'away'] },
    }
}, { id: true, timestamps: true });

const v2basketballLiveFixtureSchema = new Schema<IV2BasketballLiveFixtureUnpop>(
    {
        // Basic Info
        homeTeam: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
        awayTeam: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
        competition: { type: Schema.Types.ObjectId, ref: 'V2BasketballCompetition' },
        matchType: { type: String, enum: ['friendly', 'competition'], default: 'friendly' },

        // Scores
        homeScore: { type: Number, default: 0 },
        awayScore: { type: Number, default: 0 },

        homeQ1score: { type: Number, default: 0 },
        homeQ2score: { type: Number, default: 0 },
        homeQ3score: { type: Number, default: 0 },
        homeQ4score: { type: Number, default: 0 },
        homeOTscore: { type: Number, default: 0 },

        awayQ1score: { type: Number, default: 0 },
        awayQ2score: { type: Number, default: 0 },
        awayQ3score: { type: Number, default: 0 },
        awayQ4score: { type: Number, default: 0 },
        awayOTscore: { type: Number, default: 0 },

        // Game time details
        currentQuarter: { type: Number, default: 0 },
        gameClock: { type: Number, default: 720 },
        shotClock: { type: Number, default: 24 },

        // Game stats
        homeTimeouts: {
            remaining: { type: Number, default: 0 },
            used: { type: Number, default: 0 },
            lastCalled: { type: Date },
        },
        awayTimeouts: {
            remaining: { type: Number, default: 0 },
            used: { type: Number, default: 0 },
            lastCalled: { type: Date },
        },
        homeFouls: { type: Number, default: 0 },
        awayFouls: { type: Number, default: 0 },
        possession: { type: String, enum: ['home', 'away'] },
        
        // Player stats
        playerStats: [{ type: Schema.Types.ObjectId, ref: 'V2BasketballFixturePlayerStat' }],

        // Betting odds
        liveOdds: {
            updatedAt: { type: Date },
            homeWin: Number,
            draw: Number,
            awayWin: Number,
            overUnder: [{
                line: Number,
                over: Number,
                under: Number
            }],
        },

        // Events
        events: [eventSchema],

        // Additional metadata
        referee: { type: String },
        stadium: { type: String },
        attendance: { type: Number },
        weather: {
            condition: { type: String },
            temperature: { type: Number },
        },
        admin: { type: Schema.Types.ObjectId, ref: 'V2User' },
    },
    { timestamps: true }
);

export default model<IV2BasketballLiveFixtureUnpop>(
    "V2BasketballLiveFixture",
    v2basketballLiveFixtureSchema,
    "v2basketballLiveFixtures"
);
