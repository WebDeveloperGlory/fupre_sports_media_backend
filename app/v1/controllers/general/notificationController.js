const notificationService = require('../../services/general/notificationService');
const { success, error, serverError } = require('../../utils/responseUtils');

exports.getNotificationStats = async ( req, res ) => {
    try {
        const result = await notificationService.getNotificationStats( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getUserNotifications = async ( req, res ) => {
    try {
        const result = await notificationService.getUserNotifications( req.user, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.createNotification = async ( req, res ) => {
    try {
        const result = await notificationService.createNotification(
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

exports.updateNotificationStatus = async ( req, res ) => {
    try {
        const result = await notificationService.updateNotificationStatus(
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

exports.adminSendNotificationToAll = async ( req, res ) => {
    try {
        const result = await notificationService.adminSendNotificationToAll(
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

exports.markNotificationRead = async ( req, res ) => {
    try {
        const result = await notificationService.markNotificationRead(
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

exports.markAllNotificationsRead = async ( req, res ) => {
    try {
        const result = await notificationService.markAllNotificationsRead(
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

exports.deleteNotification = async ( req, res ) => {
    try {
        const result = await notificationService.deleteNotification(
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

exports.adminDeleteNotification = async ( req, res ) => {
    try {
        const result = await notificationService.adminDeleteNotification(
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