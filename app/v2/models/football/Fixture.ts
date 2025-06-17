import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballFixture extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballfixtureSchema = new Schema<IV2FootballFixture>({

}, {
    timestamps: true
});

export default model<IV2FootballFixture>('V2FootballFixture', v2footballfixtureSchema, 'v2footballFixtures');