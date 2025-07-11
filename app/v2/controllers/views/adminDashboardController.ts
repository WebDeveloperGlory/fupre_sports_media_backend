import { Request, RequestHandler, Response } from "express";
import adminDashboardService from "../../services/views/adminDashboardService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { AuditInfo } from "../../types/express";
import { ObjectId } from "mongoose";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

export const getSuperAdminFootballDashboardAnalytics = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await adminDashboardService.getSuperAdminFootballDashboardAnalytics();

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}