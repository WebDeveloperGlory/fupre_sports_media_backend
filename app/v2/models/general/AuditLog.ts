import { Schema, model, Document, ObjectId } from "mongoose";
import { LogAction } from "../../types/auditlog.enums";

export interface IV2AuditLog extends Document {
    _id: ObjectId;
    userId: ObjectId;
    action: LogAction;
    entity: string;
    entityId: ObjectId;
    details: Object;
    previousValues: Object;
    newValues: Object;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

const v2auditlogSchema = new Schema<IV2AuditLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        required: true,
        enum: Object.values( LogAction ),
        uppercase: true
    },
    entity: { type: String, required: true }, // e.g., 'Competition', 'Team', 'Match', 'Player'
    entityId: { type: Schema.Types.ObjectId, required: true },
    details: { type: Object, default: {} }, // For storing additional information
    previousValues: { type: Object, default: {} }, // For storing previous values in case of updates
    newValues: { type: Object, default: {} }, // For storing new values in case of updates
    ipAddress: { type: String },
    userAgent: { type: String },
}, {
    timestamps: true
});

export default model<IV2AuditLog>("V2AuditLog", v2auditlogSchema, "v2auditlogs");