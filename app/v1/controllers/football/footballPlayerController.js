const playerService = require('../../services/football/footballPlayerService');
const { success, serverError, error } = require('../../utils/responseUtils');

exports.addPlayers = async ( req, res ) => {
    try {
        const result = await playerService.addPlayers( 
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

exports.updatePlayer = async ( req, res ) => {
    try {
        const result = await playerService.updatePlayer( 
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

exports.deleteTeamPlayer = async ( req, res ) => {
    try {
        const result = await playerService.deleteTeamPlayer( 
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

exports.updatePlayerStats = async ( req, res ) => {
    try {
        const result = await playerService.updatePlayerStats( 
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

exports.transferOrLoanPlayer = async ( req, res ) => {
    try {
        const result = await playerService.transferOrLoanPlayer(
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

module.exports = exports;