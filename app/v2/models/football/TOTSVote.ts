import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballTOTSVote extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballTOTSVoteSchema = new Schema<IV2FootballTOTSVote>({

}, {
    timestamps: true
});

export default model<IV2FootballTOTSVote>('V2FootballTOTSVote', v2footballTOTSVoteSchema, 'v2footballTOTSVotes');