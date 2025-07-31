import { Request, RequestHandler, Response } from "express";
import homepageService from "../../services/views/homepageService";
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

export const getHomePageStatistics = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await homepageService.getHomePageStatistics();

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

export const getCompetitionPageStatistics = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await homepageService.getCompetitionPageStatistics();

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

export const footballCompetitionPage = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await homepageService.footballCompetitionPage();

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