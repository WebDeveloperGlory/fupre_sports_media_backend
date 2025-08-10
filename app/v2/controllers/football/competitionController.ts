import { Request, Response } from "express";
import competitionService from "../../services/football/competitionService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { AuditInfo } from "../../types/express";
import { ObjectId } from "mongoose";
import { CompetitionStatus, CompetitionTypes } from "../../types/competition.enums";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

type CompStrParams = { competitionId: string };
type CompObjParams = { competitionId: ObjectId };
type GetAllCompParams = { status: CompetitionStatus, limit: number, page: number, type: CompetitionTypes, isFeatured: boolean };
type GetCompFixQueryParams = { limit: number, page: number, fromDate?: Date, toDate?: Date };

export const createCompetition = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.createCompetition(
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

export const cloneCompetitionForNewSeason = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.cloneCompetitionForNewSeason(
            req.params as unknown as CompStrParams,
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

export const getAllCompetitions = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getAllCompetitions(
            req.query as unknown as GetAllCompParams
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

export const getCompetitionById = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitionById(
            req.params as unknown as CompStrParams
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

export const getCompetitiionLeagueTable = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionLeagueTable(
            req.params as unknown as CompStrParams
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

export const getCompetitiionKnockoutRounds = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionKnockoutRounds(
            req.params as unknown as CompStrParams
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

export const getCompetitiionGroups = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionGroups(
            req.params as unknown as CompStrParams
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

export const getCompetitiionTeamsAndSquadList = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionTeamsAndSquadList(
            req.params as unknown as CompStrParams
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

export const getCompetitiionFixtures = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionFixtures(
            req.params as unknown as CompStrParams,
            req.query as unknown as GetCompFixQueryParams,
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

export const getCompetitiionStats = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.getCompetitiionStats(
            req.params as unknown as CompStrParams
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

export const updateCompetitionStatus = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionStatus(
            req.params as unknown as CompStrParams,
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

export const updateCompetitionInfo = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionInfo(
            req.params as unknown as CompStrParams,
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

export const registerCompetitionTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.registerCompetitionTeam(
            req.params as unknown as CompStrParams,
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

export const unregisterCompetitionTeam = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.unregisterCompetitionTeam(
            req.params as unknown as CompStrParams,
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

export const registerCompetitionTeamSquad = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.registerCompetitionTeamSquad(
            req.params as unknown as CompStrParams,
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

export const createCompetitionLeagueTable = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.createCompetitionLeagueTable(
            req.params as unknown as CompStrParams,
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

export const createCompetitionGroup = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.createCompetitionGroup(
            req.params as unknown as CompStrParams,
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

export const createCompetitionKnockoutRound = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.createCompetitionKnockoutRound(
            req.params as unknown as CompStrParams,
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

type CompGroupDelete = {competitionId: string; groupName: string;};
export const deleteCompetitionGroup = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.deleteCompetitionGroup(
            req.params as unknown as CompGroupDelete,
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

type CompKnockoutDelete = {competitionId: string; roundName: string;};
export const deleteCompetitionKnockoutRound = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.deleteCompetitionKnockoutRound(
            req.params as unknown as CompKnockoutDelete,
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

export const updateCompetitionTeamStandings = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionTeamStandings(
            req.params as unknown as CompStrParams,
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

export const createCompetitionFixture = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.createCompetitionFixture(
            req.params as unknown as CompStrParams,
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

export const updateCompetitionFixture = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionFixture(
            req.params as unknown as CompStrParams,
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

export const updateCompetitionFixtureResult = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionFixtureResult(
            req.params as unknown as CompStrParams,
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

export const updateCompetitionRules = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionRules(
            req.params as unknown as CompStrParams,
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

export const updateCompetitionFormat = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.updateCompetitionFormat(
            req.params as unknown as CompStrParams,
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

export const addCompetitionAdditionalRule = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.addCompetitionAdditionalRule(
            req.params as unknown as CompStrParams,
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

export const removeCompetitionAdditionalRule = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.removeCompetitionAdditionalRule(
            req.params as unknown as CompStrParams,
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

export const addCompetitionSponsor = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.addCompetitionSponsor(
            req.params as unknown as CompStrParams,
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

export const removeCompetitionSponsor = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.removeCompetitionSponsor(
            req.params as unknown as CompStrParams,
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

export const addPlayerAwards = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.addPlayerAwards(
            req.params as unknown as CompStrParams,
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

export const removePlayerAwards = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.removePlayerAwards(
            req.params as unknown as CompStrParams,
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

export const addTeamAwards = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.addTeamAwards(
            req.params as unknown as CompStrParams,
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

export const removeTeamAwards = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.removeTeamAwards(
            req.params as unknown as CompStrParams,
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

export const setCompetitionAdmin = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.setCompetitionAdmin(
            req.params as unknown as CompStrParams,
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

export const setCompetitionActiveStatus = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.setCompetitionActiveStatus(
            req.params as unknown as CompStrParams,
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

export const makeCompetitionFeatured = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.makeCompetitionFeatured(
            req.params as unknown as CompStrParams,
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

export const deleteCompetition = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await competitionService.deleteCompetition(
            req.params as unknown as CompStrParams,
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