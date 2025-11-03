import { Schema, Document, model, Types } from 'mongoose';
import { IV2Department } from '../general/Department';
import { BasketBallPlayerHands, BasketBallPlayerPosition } from '../../types/player.enums';
import { IV2BasketballPlayerSeasonStatUnpop } from './PlayerSeasonStat';
import { IV2BasketballPlayerCareerStatUnpop } from './PlayerCareerStat';
import { IV2BasketballPlayerContractUnpop } from './PlayerContract';

interface BasketballPlayer extends Document {
    _id: Types.ObjectId;

    name: string;
    admissionYear: string;

    weight: number;
    height: number;
    nationality: string;
    preferredHand: BasketBallPlayerHands;
    position: BasketBallPlayerPosition;
    photo: string;

    marketValue: number;

    awards: [
        {
            title: string,
            season: string,
            date: Date,
            description: string
        },
    ];

    createdBy: Types.ObjectId;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verifiedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IV2BasketballPlayerUnpop extends BasketballPlayer {
    department: Types.ObjectId;
    seasonStats: Types.ObjectId[];
    careerStats: Types.ObjectId;
    contracts: Types.ObjectId[];

}
export interface IV2BasketballPlayerPop extends BasketballPlayer {
    department: IV2Department;
    seasonStats: IV2BasketballPlayerSeasonStatUnpop[];
    careerStats: IV2BasketballPlayerCareerStatUnpop;
    contracts: IV2BasketballPlayerContractUnpop[];
}

const v2basketballPlayerSchema = new Schema<IV2BasketballPlayerUnpop>({
    // Basic Info
    name: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'V2Department' },
    admissionYear: { type: String },
    weight: { type: Number, min: 50 },
    height: { type: Number, min: 100 },
    nationality: { type: String, required: true },
    preferredHand: { type: String, required: true, enum: Object.values(BasketBallPlayerHands) },
    position: { type: String, required: true, enum: Object.values(BasketBallPlayerPosition) },
    photo: { type: String },

    // Relationships
    seasonStats: [{ type: Schema.Types.ObjectId, ref: 'V2BasketballPlayerSeasonStat' }],
    careerStats: { type: Schema.Types.ObjectId, ref: 'V2BasketballPlayerCareerStat' },
    contracts: [{ type: Schema.Types.ObjectId, ref: 'V2BasketballPlayerContract' }],
    marketValue: { type: Number },

    // Awards
    awards: [
        { 
            title: String,
            season: String,
            date: Date,
            description: String
        },
    ],

    // Metadata
    createdBy: { type: Schema.Types.ObjectId, ref: 'V2User' },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'] },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'V2User' },
}, { timestamps: true });

export default model<IV2BasketballPlayerUnpop>('V2BasketballPlayer', v2basketballPlayerSchema, 'v2basketballPlayers');