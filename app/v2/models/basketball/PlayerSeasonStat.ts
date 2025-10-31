import { Document, model, Types, Schema } from 'mongoose';
import { IV2BasketballPlayerUnpop } from './Player';
import { IV2BasketballTeamUnpop } from './Team';
import { IV2BasketballCompetitionUnpop } from './Competition';

interface PlayerSeasonStat extends Document {
    _id: Types.ObjectId;
    
    season: string;
    totalGames: number;
    totalPoints: number;
    totalThreePoints: number;
    totalTwoPoints: number;
    totalRebounds: number;
    totalAssists: number;
    totalSteals: number;
    totalBlocks: number;
    totalTurnovers: number;
}

export interface IV2BasketballPlayerSeasonStatUnpop extends PlayerSeasonStat {
    player: Types.ObjectId;
    team: Types.ObjectId;
    competition: Types.ObjectId;
};
export interface IV2BasketballPlayerSeasonStatPop extends PlayerSeasonStat {
    player: IV2BasketballPlayerUnpop;
    team: IV2BasketballTeamUnpop;
    competition: IV2BasketballCompetitionUnpop;
};

const v2basketballPlayerSeasonStatSchema = new Schema<IV2BasketballPlayerSeasonStatUnpop>({
    // Basic Info
    player: { type: Schema.Types.ObjectId, ref: 'V2BasketballPlayer', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },
    competition: { type: Schema.Types.ObjectId, ref: 'V2BasketballCompetition' },
    season: { type: String, required: true },

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
}, { timestamps: true });

export default model<IV2BasketballPlayerSeasonStatUnpop>(
    'V2BasketballPlayerSeasonStat',
    v2basketballPlayerSeasonStatSchema, 
    'v2basketballPlayerSeasonStats'
);