import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballTOTS extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballTOTSSchema = new Schema<IV2FootballTOTS>({

}, {
    timestamps: true
});

export default model<IV2FootballTOTS>('V2FootballTOTS', v2footballTOTSSchema, 'v2footballTOTSs');