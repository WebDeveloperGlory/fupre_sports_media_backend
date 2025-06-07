import { Request } from "express";

declare module 'express-serve-static-core' {
    interface Request {
        auditInfo?: {
            ipAddress: string;
            timestamp: string;
            route: string;
            method: string;
            userAgent: string;
        };
    }
}