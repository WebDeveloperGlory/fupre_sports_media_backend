const teamService = require('../../services/football/footballTeamService');
const { success, serverError, error } = require('../../utils/responseUtils');
const dynamicUpdateService = require('../../services/general/dynamicUpdateService');

exports.getAllTeams = async ( req, res ) => {
    try {
        const result = await teamService.getAllTeams( req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleTeam = async ( req, res ) => {
    try {
        const result = await teamService.getSingleTeam( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamPlayers = async ( req, res ) => {
    try {
        const result = await teamService.getTeamPlayers( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamCompetitions = async ( req, res ) => {
    try {
        const result = await teamService.getTeamCompetitions( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamStatistics = async ( req, res ) => {
    try {
        const result = await teamService.getTeamStatistics( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamForm = async ( req, res ) => {
    try {
        const result = await teamService.getTeamForm( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamPlayersStatistics = async ( req, res ) => {
    try {
        const result = await teamService.getTeamPlayersStatistics( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.createTeam = async ( req, res ) => {
    try {
        const result = await teamService.createTeam( 
            req.body, 
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateTeam = async ( req, res ) => {
    try {
        const restrictedFields = [ 'captain', 'players', 'competitionInvitations', 'friendlyRequests', 'admin', 'stats' ];
        const teamDocument = await teamService.getSingleTeam( req.params );
        const result = await dynamicUpdateService.dynamicUpdate(
            teamDocument.data,
            { updates: req.body },
            restrictedFields,
            {
                entityName: 'FootballTeam', 
                updateMessage: 'Team Updated',
                userId: req.user.userId,
                auditInfo: req.auditInfo
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addPlayerToTeam = async ( req, res ) => {
    try {
        const result = await teamService.addPlayerToTeam(
            req.params,
            req.body, 
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.removePlayerFromTeam = async ( req, res ) => {
    try {
        const result = await teamService.removePlayerFromTeam(
            req.params,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.changeTeamCaptain = async ( req, res ) => {
    try {
        const result = await teamService.changeTeamCaptain(
            req.params,
            req.body,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getFriendlyRequests = async ( req, res ) => {
    try {
        const result = await teamService.getFriendlyRequests(
            req.params
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.sendFriendlyRequest = async ( req, res ) => {
    try {
        const result = await teamService.sendFriendlyRequest(
            req.params,
            req.body,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateFriendlyRequestStatus = async ( req, res ) => {
    try {
        const result = await teamService.updateFriendlyRequestStatus(
            req.params,
            req.body,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateTeamAdmin = async ( req, res ) => {
    try {
        const result = await teamService.updateTeamAdmin(
            req.params,
            req.body,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.deleteTeam = async ( req, res ) => {
    try {
        const result = await teamService.deleteTeam(
            req.params,
            { 
                userId: req.user.userId, 
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;