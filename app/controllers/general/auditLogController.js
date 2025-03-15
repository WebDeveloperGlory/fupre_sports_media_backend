const auditLogService = require('../../services/general/auditLogService');
const { success, serverError, error } = require('../../utils/responseUtils');

exports.getAuditLogsByEntity = async ( req, res ) => {
    try {
        const result = await auditLogService.getAuditLogsByEntity( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAuditLogsByUser = async ( req, res ) => {
    try {
        const result = await auditLogService.getAuditLogsByUser( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllAuditLogs = async ( req, res ) => {
    try {
        const result = await auditLogService.getAllAuditLogs( req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.deleteAuditLog = async ( req, res ) => {
    try {
        const result = await auditLogService.deleteAuditLog( req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;