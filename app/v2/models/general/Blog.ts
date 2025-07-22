import { Schema, model, Document, ObjectId } from "mongoose";
import { BlogCategories } from "../../types/blog.enums";

export interface IV2Blog extends Document {
    _id: ObjectId;

    author: ObjectId;
    category: BlogCategories;
    title: string;
    content: string;
    coverImage?: string;
    isReviewed: boolean;
    isPublished: boolean;
    views: number;

    createdAt: Date;
    updatedAt: Date;
}

const v2blogSchema = new Schema<IV2Blog>({
    author: { type: Schema.Types.ObjectId, ref: 'V2User', required: true },
    category: { type: String, enum: Object.values( BlogCategories ), required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    views: { type: Number, default: 0 },
    isReviewed: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default model<IV2Blog>('V2Blog', v2blogSchema, 'v2blogs');