import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballCompetition extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballcompetitionSchema = new Schema<IV2FootballCompetition>({

}, {
    timestamps: true
});

export default model<IV2FootballCompetition>('V2FootballCompetition', v2footballcompetitionSchema, 'v2footballCompetitions');