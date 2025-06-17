import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballPlayer extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballplayerSchema = new Schema<IV2FootballPlayer>({

}, {
    timestamps: true
});

export default model<IV2FootballPlayer>('V2FootballPlayer', v2footballplayerSchema, 'v2footballPlayers');