import { Document, model, Types, Schema } from 'mongoose';

interface Competition extends Document {
    _id: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballCompetitionPop extends Competition {};
export interface IV2BasketballCompetitionUnpop extends Competition {};

const v2basketballCompetitionSchema = new Schema<IV2BasketballCompetitionUnpop>({

},{ timestamps: true });

export default model<IV2BasketballCompetitionUnpop>(
    'V2BasketballCompetition',
    v2basketballCompetitionSchema, 
    'v2basketballCompetitions'
);