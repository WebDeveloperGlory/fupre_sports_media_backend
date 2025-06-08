import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IV2Notification extends Document {
    recipient: ObjectId;
    title: string;
    message: string;
    date: Date;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const v2notificationSchema = new Schema<IV2Notification>({
    recipient: { type: Schema.Types.ObjectId, ref: 'V2User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default model<IV2Notification>("V2Notification", v2notificationSchema, "v2notifications");