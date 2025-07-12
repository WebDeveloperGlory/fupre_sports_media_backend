import { Request, RequestHandler, Response } from "express";
import teamService, { StatQuery } from "../../services/football/teamService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { AuditInfo } from "../../types/express";
import { ObjectId } from "mongoose";
import { TeamTypes } from "../../types/team.enums";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}
type AllTeamQuery = { facultyId: string, departmentId: string, type: TeamTypes, academicYear: string, limit: number, page: number }
type TeamIdObjParms = { teamId: ObjectId }
type TeamIdStrParms = { teamId: string }

export const createTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.createTeam(
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

export const getAllTeams = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getAllTeams( req.query as unknown as AllTeamQuery );

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

export const getSingleTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getSingleTeam( req.params as unknown as TeamIdObjParms );

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

export const getTeamStats = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getTeamStats( 
            req.params as unknown as TeamIdStrParms,
            req.query as unknown as StatQuery
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

export const getTeamPlayers = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getTeamPlayers( req.params as unknown as TeamIdStrParms );

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

export const getTeamCompetitionAndCompetitionPerformance = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.getTeamCompetitionAndCompetitionPerformance( 
            req.params as unknown as TeamIdStrParms,
            req.query as unknown as { season: string }
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

export const updateTeamBasicInfo = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.updateTeamBasicInfo(
            req.params as unknown as TeamIdStrParms,
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

export const updateTeamCoaches = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.updateTeamCoaches(
            req.params as unknown as TeamIdObjParms,
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

export const setTeamAdmin = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.setTeamAdmin(
            req.params as unknown as TeamIdObjParms,
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

export const updateTeamLifetimeStats = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.updateTeamLifetimeStats(
            req.params as unknown as TeamIdObjParms,
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

export const deleteTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await teamService.deleteTeam(
            req.params as unknown as TeamIdObjParms,
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