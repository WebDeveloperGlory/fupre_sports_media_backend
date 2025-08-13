import { Request, RequestHandler, Response } from "express";
import liveFixtureService from "../../services/football/liveFixtureService";
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

type LiveFixStrParams = { fixtureId: string };

export const initializeLiveFixture = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.initializeLiveFixture(
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

export const endCompetitionLiveFixture = async ( req: AuditRequest, res: Response ) => {
    try {
        const { fixtureId } = req.params;

        if (!fixtureId) {
            error(res, 'Live fixture ID is required');
            return;
        }

        // Execute the service
        const result = await liveFixtureService.endCompetitionLiveFixture({ liveFixtureId: fixtureId });
        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch (err: any) {
        // Handle specific error cases
        if (err.message.includes('not found')) {
            error(res, err.message, 404);
            return;
        }

        // Handle transaction errors
        if (err.message.includes('transaction')) {
            error(res, 'Failed to complete fixture ending process', 500);
            return;
        }

        // Fallback to server error
        serverError(res, err);
    }
}

export const getAllLiveFixtures = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.getAllLiveFixtures();

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

export const getLiveFixtureById = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.getLiveFixtureById( req.params as unknown as LiveFixStrParams );

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

export const getLiveFixtureTeamPlayers = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.getLiveFixtureTeamPlayers( 
            req.params as unknown as LiveFixStrParams,
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

export const updateLiveFixtureStatus = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateLiveFixtureStatus(
            req.params as unknown as LiveFixStrParams,
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

export const updateLiveFixtureStatistics = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateLiveFixtureStatistics(
            req.params as unknown as LiveFixStrParams,
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

export const updateLiveFixtureLineup = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateLiveFixtureLineup(
            req.params as unknown as LiveFixStrParams,
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

export const createTimeLineEvent = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.createTimeLineEvent(
            req.params as unknown as LiveFixStrParams,
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

export const editTimelineEvent = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.editTimelineEvent(
            req.params as unknown as LiveFixStrParams,
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

export const deleteTimelineEvent = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.deleteTimelineEvent(
            req.params as unknown as LiveFixStrParams,
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

export const addSubstitution = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.addSubstitution(
            req.params as unknown as LiveFixStrParams,
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

export const updateSubstitution = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateSubstitution(
            req.params as unknown as LiveFixStrParams,
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

export const removeSubstitution = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.removeSubstitution(
            req.params as unknown as LiveFixStrParams,
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

export const updateFixtureScore = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateFixtureScore(
            req.params as unknown as LiveFixStrParams,
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

export const addGoalScorer = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.addGoalScorer(
            req.params as unknown as LiveFixStrParams,
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

export const removeGoalScorer = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.removeGoalScorer(
            req.params as unknown as LiveFixStrParams,
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

export const updateOfficialPOTM = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateOfficialPOTM(
            req.params as unknown as LiveFixStrParams,
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

export const updateOfficialPlayerRatings = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateOfficialPlayerRatings(
            req.params as unknown as LiveFixStrParams,
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

export const generalUpdates = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.generalUpdates(
            req.params as unknown as LiveFixStrParams,
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

export const updateTime = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.updateTime(
            req.params as unknown as LiveFixStrParams,
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

export const submitUserPlayerRating = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.submitUserPlayerRating(
            req.params as unknown as LiveFixStrParams,
            req.body,
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

export const handleTeamCheer = async ( req: AuditRequest, res: Response ) => {
    try {
        const additionalPayload: { userId?: ObjectId, auditInfo?: AuditInfo } = {};
        if( req.user ) {
            additionalPayload.userId = req.user.userId;
            additionalPayload.auditInfo = req.auditInfo;
        }

        const result = await liveFixtureService.handleTeamCheer(
            req.params as unknown as LiveFixStrParams,
            req.body,
            additionalPayload
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

export const submitUserPOTMVote = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await liveFixtureService.submitUserPOTMVote(
            req.params as unknown as LiveFixStrParams,
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