import { Request, RequestHandler, Response } from "express";
import playerService from "../../services/football/playerService";
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

type PlayerStrParams = { playerId: string };
type TeamPlayerSuggestion = { teamId: string, limit?: number; page?: number }

export const createPlayer = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.createPlayer(
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

export const registerUnverifiedPlayer = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.registerUnverifiedPlayer(
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

export const updatePlayer = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.updatePlayer(
            req.params as unknown as PlayerStrParams,
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

export const verifyPlayerRegistration = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.verifyPlayerRegistration(
            req.params as unknown as PlayerStrParams,
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

export const addPlayerToTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.addPlayerToTeam(
            req.params as unknown as PlayerStrParams,
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

export const getTeamSuggestedPlayers = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.getTeamSuggestedPlayers(
            req.query as unknown as TeamPlayerSuggestion
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

export const getPlayerById = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.getPlayerById(
            req.params as unknown as PlayerStrParams
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