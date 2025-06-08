import { Request } from "express";

export interface AuditInfo {
    ipAddress: string;
    timestamp: string;
    route: string;
    method: string;
    userAgent: string;
};

declare module 'express-serve-static-core' {
    interface Request {
        auditInfo?: AuditInfo
    }
}