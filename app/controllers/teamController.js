const teamService = require('../services/teamService');
const playerService = require('../services/playerService');
const authService = require('../services/authService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.createTeam = async ( req, res ) => {
    try {
        const result = await teamService.createTeam( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllTeams = async ( req, res ) => {
    try {
        const result = await teamService.getAllTeams();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamOverview = async ( req, res ) => {
    try {
        const result = await teamService.getTeamOverview();

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

exports.getSingleTeamOverview = async ( req, res ) => {
    try {
        const result = await teamService.getSingleTeamOverview( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleTeamFixtures = async ( req, res ) => {
    try {
        const result = await teamService.getSingleTeamFixtures( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleTeamStats = async ( req, res ) => {
    try {
        const result = await teamService.getSingleTeamStats( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.sendMatchRequest = async ( req, res ) => {
    try {
        const result = await teamService.sendMatchRequest( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateMatchRequestStatus = async ( req, res ) => {
    try {
        const result = await teamService.updateMatchRequestStatus( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateCompetitionInvitationStatus = async ( req, res ) => {
    try {
        const result = await teamService.updateCompetitionInvitationStatus( req.params, req.body );

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

exports.addPlayerToTeam = async ( req, res ) => {
    try {
        // Get team
        const getTeam = await teamService.getSingleTeam( req.params );
        if( !getTeam.success ) {
            return error( res, getTeam.message );
        }

        // Add players
        const result = await playerService.addPlayers( req.body, getTeam.data );
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
        const result = await teamService.getFriendlyRequests( req.params );
        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionRequests = async ( req, res ) => {
    try {
        const result = await teamService.getCompetitionRequests( req.params );
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
        // Pass user id and update admin
        const result = await teamService.updateTeamAdmin( req.params, { adminId: req.body.userId } );
        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;