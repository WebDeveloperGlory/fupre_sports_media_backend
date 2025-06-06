const userService = require('../../services/general/userService');
const { success, error, serverError } = require('../../utils/responseUtils');
const dynamicUpdateService = require('../../services/general/dynamicUpdateService');

exports.getAllUsers = async ( req, res ) => {
    try {
        const result = await userService.getAllUsers();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getProfile = async ( req, res ) => {
    try {
        const result = await userService.getProfile( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getOneUser = async ( req, res ) => {
    try {
        const result = await userService.getOneUser( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.completePasswordReset = async ( req, res ) => {
    try {
        const result = await userService.completePasswordReset(
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

exports.updateUser = async ( req, res ) => {
    try {
        const restrictedFields = [ 'email', 'role', 'password', 'sports', 'mediaAccess', 'status', 'lastLogin' ];
        const userDocument = await userService.getOneUser( req.user );
        const result = await dynamicUpdateService.dynamicUpdate(
            userDocument.data,
            { updates: req.body },
            restrictedFields,
            {
                entityName: 'RefactoredUser', 
                updateMessage: 'User Updated',
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

exports.deleteUser = async ( req, res ) => {
    try {
        const result = await userService.deleteUser(
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