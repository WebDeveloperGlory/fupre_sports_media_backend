const TOTSService = require('../services/TOTSService');
const { success, serverError, error } = require('../utils/responseUtils');

exports.getAllSessions = async ( req, res ) => {
    try {
        const result = await TOTSService.getAllSessions( req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleSession = async ( req, res ) => {
    try {
        const result = await TOTSService.getSingleSession( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getPlayersPerSession = async ( req, res ) => {
    try {
        const result = await TOTSService.getPlayersPerSession( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getUserVote = async ( req, res ) => {
    try {
        const result = await TOTSService.getUserVote( req.user, req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getFinalVoteResult = async ( req, res ) => {
    try {
        const result = await TOTSService.getFinalVoteResult( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.createSession = async ( req, res ) => {
    try {
        const result = await TOTSService.createSession(
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

exports.addPlayersToSession = async ( req, res ) => {
    try {
        const result = await TOTSService.addPlayersToSession(
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

exports.deletePlayersFromSession = async ( req, res ) => {
    try {
        const result = await TOTSService.deletePlayersFromSession(
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

exports.toggleVote = async ( req, res ) => {
    try {
        const result = await TOTSService.toggleVote(
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

exports.submitAdminVote = async ( req, res ) => {
    try {
        const result = await TOTSService.submitAdminVote(
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

exports.submitUserVote = async ( req, res ) => {
    try {
        const result = await TOTSService.submitUserVote(
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

exports.calculateFinalResult = async ( req, res ) => {
    try {
        const result = await TOTSService.calculateFinalResult(
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