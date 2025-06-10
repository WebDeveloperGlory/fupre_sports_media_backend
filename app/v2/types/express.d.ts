import { Request } from "express";
import { ObjectId } from "mongoose";

export interface AuditInfo {
    ipAddress: string;
    timestamp: string;
    route: string;
    method: string;
    userAgent: string;
};

declare module 'express-serve-static-core' {
    interface Request {
        auditInfo: AuditInfo;  // Make this required
        user?: {
            userId: ObjectId;
            email: string;
            role: string;
        };
    }
}