import { Request, RequestHandler, Response } from "express";
import authService from "../../services/general/authService";
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

export const registerRegularUser = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.registerRegularUser(
            req.body,
            { auditInfo: req.auditInfo }
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

export const registerAdmin = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.registerAdmin(
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
        return;
    }
}

export const loginUser = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.loginUser(
            req.body,
            { auditInfo: req.auditInfo }
        );

        if( result.success ) {
            // Send JWT as HTTP-only cookie
            res.cookie('authToken', result.data, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const logoutUser = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.logoutUser({ 
            auditInfo: req.auditInfo
        });

        if( result.success ) {
            res.cookie('authToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 5 * 1000 // 5 seconds
            });
            // Clear Cookies
            res.clearCookie('authToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            });

            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const changePassword = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.changePassword(
            req.body,
            { 
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
        return;
    }
}

export const generateOTP = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.generateOTP( req.body );

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}

export const verifyOTP = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await authService.verifyOTP( req.body );

        if( result.success ) {
            // Send JWT as HTTP-only cookie
            res.cookie('authToken', result.data?.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
        return;
    }
}