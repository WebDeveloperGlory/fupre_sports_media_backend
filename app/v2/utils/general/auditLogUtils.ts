import db from '../../config/db';
import { IV2AuditLog } from '../../models/general/AuditLog';

const logAction = async (
    { userId, action, entity, entityId, details = {}, ipAddress, userAgent, previousValues = {}, newValues = {}  }: IV2AuditLog
) => {
    // Check for user in request
    if ( !userId ) {
        console.warn('No user found in request for audit logging');
        return;
    }

    try {
        const auditLog = new db.V2AuditLog({
            userId, action, entity, entityId,
            details, previousValues, newValues,
            ipAddress, userAgent
        });
        await auditLog.save();
    } catch( err ) {
        console.error( 'Error Writing Audit Log', err );
    }
}

export default {
    logAction
}