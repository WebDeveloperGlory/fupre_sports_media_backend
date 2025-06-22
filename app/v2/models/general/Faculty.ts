import { Schema, model, Document, ObjectId } from "mongoose";

export interface IV2Faculty extends Document {
    _id: ObjectId;

    name: string;

    createdAt: Date;
    updatedAt: Date;
}

const v2facultySchema = new Schema<IV2Faculty>({
    name: { type: String, required: true },
}, {
    timestamps: true
});

export default model<IV2Faculty>('V2Faculty', v2facultySchema, 'v2facultys');