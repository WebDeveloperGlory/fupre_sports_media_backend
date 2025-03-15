const auditService = require('../services/general/auditLogService');
const { error, serverError } = require('../utils/responseUtils');

const logRequest = ( req, res, next ) => {
    // Store original methods to intercept them later
    const originalSend = res.send;
    const originalJson = res.json;

    // Add request info to req object
    req.auditInfo = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
    };

    // Intercept response methods
    res.send = function ( body ) {
      res.responseBody = body;
      return originalSend.call( this, body );
    };

    res.json = function ( body ) {
      res.responseBody = body;
      return originalJson.call( this, body );
    };

    next();
}

const logActionManually = async ({
    userId, auditInfo,
    action, entity,
    entityId, details = {}, 
    previousValues = {}, newValues = {}
}) => {
    // Check for user in request
    if ( !userId ) {
        console.warn('No user found in request for audit logging');
        return;
    }

    try {
        await auditService.createAuditLog({
            userId,
            action,
            entity,
            entityId,
            details,
            previousValues,
            newValues,
            requestInfo: auditInfo
        });
    } catch ( error ) {
        console.error('Error in audit logging:', error);
    }
}

module.exports = {
    logRequest,
    logActionManually,
    
};