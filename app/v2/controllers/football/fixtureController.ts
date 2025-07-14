import { Request, RequestHandler, Response } from "express";
import fixtureService from "../../services/football/fixtureService";
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

type FixStrParams = { fixtureId: string }

export const getAllTodayFixtures = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await fixtureService.getAllTodayFixtures();

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

export const rescheduleFixture = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await fixtureService.rescheduleFixture(
            req.params as unknown as FixStrParams,
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

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