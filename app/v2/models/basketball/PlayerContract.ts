import { Document, model, Types, Schema } from 'mongoose';
import { BasketBallPlayerContractType } from '../../types/player.enums';
import { IV2BasketballPlayerUnpop } from './Player';
import { IV2BasketballTeamUnpop } from './Team';

interface PlayerContract extends Document {
    _id: Types.ObjectId;

    startDate: Date;
    endDate: Date | null;
    contractType: BasketBallPlayerContractType;
    jerseyNumber: number;
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballPlayerContractUnpop extends PlayerContract {
    player: Types.ObjectId;
    team: Types.ObjectId;
};
export interface IV2BasketballPlayerContractPop extends PlayerContract {
    player: IV2BasketballPlayerUnpop;
    team: IV2BasketballTeamUnpop;
};

const v2basketballPlayerContractSchema = new Schema<IV2BasketballPlayerContractUnpop>({
    // Basic Info
    player: { type: Schema.Types.ObjectId, ref: 'V2BasketballPlayer', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'V2BasketballTeam', required: true },

    // Contract Details
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    contractType: { type: String, required: true, enum: Object.values(BasketBallPlayerContractType) },
    jerseyNumber: { type: Number },
    isActive: { type: Boolean, default: true },
},{ timestamps: true });

export default model<IV2BasketballPlayerContractUnpop>(
    'V2BasketballPlayerContract',
    v2basketballPlayerContractSchema, 
    'v2basketballPlayerContracts'
);