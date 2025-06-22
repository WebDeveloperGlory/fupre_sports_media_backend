import { Schema, model, Document, ObjectId } from "mongoose";

export interface IV2Department extends Document {
    _id: ObjectId;

    name: string;
    faculty: ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const v2departmentSchema = new Schema<IV2Department>({
    name: { type: String, required: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'V2Faculty', required: true }
}, {
    timestamps: true
});

export default model<IV2Department>('V2Department', v2departmentSchema, 'v2departments');