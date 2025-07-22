import { Schema, model, Document, ObjectId } from "mongoose";

export interface IV2Highlight extends Document {
    _id: ObjectId;

    author: ObjectId;
    title: string;
    sport: string;
    views: number;

    createdAt: Date;
    updatedAt: Date;
}

const v2highlightSchema = new Schema<IV2Highlight>({
    author: { type: Schema.Types.ObjectId, ref: 'V2User', required: true },
    title: { type: String, required: true },
    sport: { type: String, required: true },
    views: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default model<IV2Highlight>('V2Highlight', v2highlightSchema, 'v2highlights');