import { Request, Response } from "express";
import { ObjectId, Types } from "mongoose";
import { AuditInfo } from "../../types/express";
import playerService from "../../services/basketball/playerService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { handleSingleImageUpload } from "../../utils/general/cloudinaryUtils";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

export const createPlayer = async ( req: AuditRequest, res: Response ) => {
    try {
        const file = req.file;
        if(!file) {
            error(res, 'No Image File Provided.');
            return;
        }
        const imageUrl = await handleSingleImageUpload(file, 'basketball_players');

        const result = await playerService.createPlayer(
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

export const getAllPlayers = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.getAllPlayers(
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

export const getPlayerDetails = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.getPlayerDetails(
            req.params as unknown as { playerId: Types.ObjectId },
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
            req.params as unknown as { playerId: Types.ObjectId },
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

export const updatePlayerImage = async ( req: AuditRequest, res: Response ) => {
    try {
        const file = req.file;
        if(!file) {
            error(res, 'No Image File Provided.');
            return;
        }
        const imageUrl = await handleSingleImageUpload(file, 'basketball_players');

        const result = await playerService.updatePlayerImage(
            req.params as unknown as { playerId: Types.ObjectId },
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

export const signPlayerContract = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.signPlayerContract(
            req.params as unknown as { playerId: Types.ObjectId },
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

export const extendPlayerContract = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await playerService.extendPlayerContract(
            req.params as unknown as { playerId: Types.ObjectId },
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