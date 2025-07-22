import { Request, RequestHandler, Response } from "express";
import adminService from "../../services/football/adminService";
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

export const getLiveFixtureAdmins = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await adminService.getLiveFixtureAdmins();

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

export const getAllAdmins = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await adminService.getAllAdmins();

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

export const getMediaAdmins = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await adminService.getMediaAdmins();

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