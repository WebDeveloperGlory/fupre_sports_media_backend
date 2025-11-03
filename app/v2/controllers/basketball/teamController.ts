import { Request, Response } from "express";
import { ObjectId, Types } from "mongoose";
import { AuditInfo } from "../../types/express";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { handleSingleImageUpload } from "../../utils/general/cloudinaryUtils";
import teamService from "../../services/basketball/teamService";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

export const getAllTeams = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getAllTeams(
            req.query,
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const getTeamDetails = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getTeamDetails(
            req.params as unknown as { teamId: Types.ObjectId },
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const getTeamPlayers = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getTeamPlayers(
            req.params as unknown as { teamId: Types.ObjectId },
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const createTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const file = req.file;
        if(!file) {
            error(res, 'No Image File Provided.');
            return;
        }
        const imageUrl = await handleSingleImageUpload(file, 'basketball_players');

        const result = await teamService.createTeam(
            req.body,
            imageUrl,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const updateTeamLogo = async ( req: AuditRequest, res: Response ) => {
    try {
                const file = req.file;
        if(!file) {
            error(res, 'No Image File Provided.');
            return;
        }
        const imageUrl = await handleSingleImageUpload(file, 'basketball_players');

        const result = await teamService.updateTeamLogo(
            req.params as unknown as { teamId: Types.ObjectId },
            imageUrl,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const updateTeamAdmin = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.updateTeamAdmin(
            req.params as unknown as { teamId: Types.ObjectId },
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const updateTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.updateTeam(
            req.params as unknown as { teamId: Types.ObjectId },
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const deleteTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.deleteTeam(
            req.params as unknown as { teamId: Types.ObjectId },
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}