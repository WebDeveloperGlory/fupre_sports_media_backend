import { Request, Response } from "express";
import userService from "../../services/general/userService";
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

type UserId = { userId: string };

export const getProfile = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await userService.getProfile({
            userId: req.user!.userId,
            auditInfo: req.auditInfo
        });

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

export const updateProfile = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await userService.updateProfile(
            { updateData: req.body },
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