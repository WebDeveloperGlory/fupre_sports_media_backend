import { Document, model, Types, Schema } from "mongoose";
import { BasketBallPlayerPosition } from "../../types/player.enums";
import { IV2BasketballFixtureUnpop } from "./Fixture";
import { IV2BasketballLiveFixtureUnpop } from "./LiveFixture";
import { IV2BasketballPlayerUnpop } from "./Player";
import { IV2BasketballTeamUnpop } from "./Team";

interface PlayerStat extends Document {
    minutesPlayed: number;
    points: number;

    fieldGoals: {
        made: number;
        attempted: number;
    };
    threePointers: {
        made: number;
        attempted: number;
    };
    freeThrows: {
        made: number;
        attempted: number;
    };

    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;

    plusMinus: number;
    efficiency: number;

    position: BasketBallPlayerPosition;
    starter: boolean;
    onCourt: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballFixturePlayerStatUnpop extends PlayerStat {
    fixture: Types.ObjectId;
    liveFixture: Types.ObjectId;
    player: Types.ObjectId;
    team: Types.ObjectId;
}
export interface IV2BasketballFixturePlayerStatPop extends PlayerStat {
    fixture: IV2BasketballFixtureUnpop;
    liveFixture: IV2BasketballLiveFixtureUnpop;
    player: IV2BasketballPlayerUnpop;
    team: IV2BasketballTeamUnpop;
}

const v2basketballFixturePlayerStatSchema =
    new Schema<IV2BasketballFixturePlayerStatUnpop>(
        {
            // Object refeerences
            fixture: { type: Schema.Types.ObjectId, ref: "V2BasketballFixture", required: true },
            liveFixture: { type: Schema.Types.ObjectId, ref: "V2BasketballLiveFixture", required: true },
            player: { type: Schema.Types.ObjectId, ref: "V2BasketballPlayer", required: true },
            team: { type: Schema.Types.ObjectId, ref: "V2BasketballTeam", required: true },

            // Basic stats
            minutesPlayed: { type: Number, default: 0 },
            points: { type: Number, default: 0 },
            fieldGoals: {
                made: { type: Number, default: 0 },
                attempted: { type: Number, default: 0 },
            },
            threePointers: {
                made: { type: Number, default: 0 },
                attempted: { type: Number, default: 0 },
            },
            freeThrows: {
                made: { type: Number, default: 0 },
                attempted: { type: Number, default: 0 },
            },

            // Advanced stats
            rebounds: { type: Number, default: 0 },
            assists: { type: Number, default: 0 },
            steals: { type: Number, default: 0 },
            blocks: { type: Number, default: 0 },
            turnovers: { type: Number, default: 0 },

            // PlusMinyus effeciency
            plusMinus: { type: Number, default: 0 },
            efficiency: { type: Number, default: 0 },

            // Lineup and position data
            position: { type: String, enum: Object.values(BasketBallPlayerPosition) },
            starter: { type: Boolean, default: false },
            onCourt: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

export default model<IV2BasketballFixturePlayerStatUnpop>(
    "V2BasketballFixturePlayerStat",
    v2basketballFixturePlayerStatSchema,
    "v2basketballFixturePlayerStats"
);
