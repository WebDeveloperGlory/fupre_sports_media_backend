import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2FootballTeam extends Document {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const v2footballteamSchema = new Schema<IV2FootballTeam>({

}, {
    timestamps: true
});

export default model<IV2FootballTeam>('V2FootballTeam', v2footballteamSchema, 'v2footballTeams');