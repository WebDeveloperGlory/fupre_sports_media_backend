import { Document, model, Types, Schema } from 'mongoose';

interface Fixture extends Document {
    _id: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

export interface IV2BasketballFixturePop extends Fixture {};
export interface IV2BasketballFixtureUnpop extends Fixture {};

const v2basketballFixtureSchema = new Schema<IV2BasketballFixtureUnpop>({

},{ timestamps: true });

export default model<IV2BasketballFixtureUnpop>(
    'V2BasketballFixture',
    v2basketballFixtureSchema, 
    'v2basketballFixtures'
);