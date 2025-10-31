import { Document, model, Types, Schema } from 'mongoose';

interface LiveFixture extends Document {
    _id: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballLiveFixturePop extends LiveFixture {};
export interface IV2BasketballLiveFixtureUnpop extends LiveFixture {};

const v2basketballLiveFixtureSchema = new Schema<IV2BasketballLiveFixtureUnpop>({

},{ timestamps: true });

export default model<IV2BasketballLiveFixtureUnpop>(
    'V2BasketballLiveFixture',
    v2basketballLiveFixtureSchema, 
    'v2basketballLiveFixtures'
);