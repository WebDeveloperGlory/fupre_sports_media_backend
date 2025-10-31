import { Document, model, Types, Schema } from 'mongoose';
import { IV2BasketballPlayerPop } from './Player';

interface PlayerCareerStat extends Document {
    _id: Types.ObjectId;

    totalGames: number;
    totalPoints: number;
    totalThreePoints: number;
    totalTwoPoints: number;
    totalRebounds: number;
    totalAssists: number;
    totalSteals: number;
    totalBlocks: number;
    totalTurnovers: number;

    avgPointsPerGame: number;
    avgReboundsPerGame: number;
    avgAssistsPerGame: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    freeThrowPercentage: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballPlayerCareerStatUnpop extends PlayerCareerStat {
    player: Types.ObjectId;
};
export interface IV2BasketballPlayerCareerStatPop extends PlayerCareerStat {
    player: IV2BasketballPlayerPop;
};

const v2basketballPlayerCareerStatSchema = new Schema<IV2BasketballPlayerCareerStatUnpop>({
    // Basic Details
    player: { type: Schema.Types.ObjectId, ref: 'V2BasketballPlayer', required: true },

    // Stat Totals
    totalGames: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalThreePoints: { type: Number, default: 0 },
    totalTwoPoints: { type: Number, default: 0 },
    totalRebounds: { type: Number, default: 0 },
    totalAssists: { type: Number, default: 0 },
    totalSteals: { type: Number, default: 0 },
    totalBlocks: { type: Number, default: 0 },
    totalTurnovers: { type: Number, default: 0 },

    // Stat Averages
    avgPointsPerGame: { type: Number, default: 0 },
    avgReboundsPerGame: { type: Number, default: 0 },
    avgAssistsPerGame: { type: Number, default: 0 },
    fieldGoalPercentage: { type: Number, default: 0 },
    threePointPercentage: { type: Number, default: 0 },
    freeThrowPercentage: { type: Number, default: 0 },
},{ timestamps: true });

export default model<IV2BasketballPlayerCareerStatUnpop>(
    'V2BasketballPlayerCareerStat',
    v2basketballPlayerCareerStatSchema, 
    'v2basketballPlayerCareerStats'
);