import { Schema, model, Document, ObjectId } from "mongoose";
import { BlogCategories } from "../../types/blog.enums";

export interface IV2Blog extends Document {
    _id: ObjectId;

    author: ObjectId;
    category: BlogCategories;
    title: string;
    subTitle?: string;
    coverImage?: string;

    createdAt: Date;
    updatedAt: Date;
}

const v2blogSchema = new Schema<IV2Blog>({
    author: { type: Schema.Types.ObjectId, ref: 'V2User', required: true },
    category: { type: String, enum: Object.values( BlogCategories ), required: true },
    title: { type: String, required: true },
    subTitle: { type: String },
    coverImage: { type: String }
}, {
    timestamps: true
});

export default model<IV2Blog>('V2Blog', v2blogSchema, 'v2blogs');