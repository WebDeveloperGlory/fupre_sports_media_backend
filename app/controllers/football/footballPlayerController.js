const playerService = require('../../services/football/footballPlayerService');
const { success, serverError, error } = require('../../utils/responseUtils');

exports.addPlayers = async ( req, res ) => {
    try {
        const result = await playerService.addPlayers( req.body, req.body.team );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getPlayer = async ( req, res ) => {
    try {
        const result = await playerService.getPlayer( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateTeamPlayer = async ( req, res ) => {
    try {
        const result = await playerService.updateTeamPlayer( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.deleteTeamPlayer = async ( req, res ) => {
    try {
        const result = await playerService.deleteTeamPlayer( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updatePlayerRecords = async ( req, res ) => {
    try {
        const result = await playerService.updatePlayerRecords( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;