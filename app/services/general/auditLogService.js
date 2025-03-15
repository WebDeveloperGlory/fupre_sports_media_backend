const db = require('../../config/db');

exports.createAuditLog = async ({ 
    userId, action, 
    entity, entityId, 
    details = {}, requestInfo = {},
    previousValues = {}, newValues = {} 
}) => {
    // Grab the ipAddress and userAgent from the requestInfo object
    const { ipAddress, userAgent } = requestInfo;

    // Create log
    const auditLog = new db.AuditLog({
        userId, action, entity, entityId,
        details, previousValues, newValues,
        ipAddress, userAgent
    });
    await auditLog.save();

    // Return success
    return { success: true, message: 'Audit log created successfully', data: auditLog };
}

exports.getAuditLogsByEntity = async ({ entity, entityId }, { page = 1, limit = 10 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;

    // Get logs
    const logs = await db.AuditLog.find({ entity, entityId })
        .sort({ timestamp: -1 })
        .skip( skip )
        .limit( limit )
        .populate('userId', 'username email');
        
    const total = await db.AuditLog.countDocuments({ entity, entityId });
      
    return {
        success: true,
        message: 'Logs Aquired',
        data: {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil( total / limit )
            }
        }
    };
}

exports.getAuditLogsByUser = async ({ userId }, { page = 1, limit = 10 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;
      
    // Get logs
    const logs = await AuditLog.find({ userId })
        .sort({ timestamp: -1 })
        .skip( skip )
        .limit( limit );
    
    const total = await db.AuditLog.countDocuments({ userId });
      
    return {
        success: true,
        message: 'Logs Aquired',
        data: {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil( total / limit )
            }
        }
    };
}

exports.getAllAuditLogs = async({ page = 1, limit = 10 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;

    // Get logs
    const logs = await db.AuditLog.find()
        .sort({ timestamp: -1 })
        .skip( skip )
        .limit( limit )
        .populate('userId', 'username email');

    const total = await db.AuditLog.countDocuments();

    return {
        success: true,
        message: 'Logs Aquired',
        data: {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil( total / limit )
            }
        }
    };
}

exports.deleteAuditLog = async({ logId }) => {
    // Find and delete log
    const deletedLog = await db.AuditLog.findByIdAndDelete( logId );
    if( !deletedLog ) return { success: false, message: 'Log not found' };

    // Return success
    return { success: true, message: 'Log deleted successfully' };
}

module.exports = exports;