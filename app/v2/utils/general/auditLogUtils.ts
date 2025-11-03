import { ObjectId, Types } from 'mongoose';
import db from '../../config/db';
import { LogAction } from '../../types/auditlog.enums';

type Log =  {
    userId: ObjectId | Types.ObjectId;
    action: LogAction;
    entity: string;
    entityId: ObjectId | Types.ObjectId;
    details?: Object;
    previousValues?: Object;
    newValues?: Object;
    ipAddress: string;
    userAgent: string;
    message: string;
}

const logAction = async (
    { userId, action, entity, entityId, details = {}, ipAddress, userAgent, previousValues = {}, newValues = {}, message }: Log
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
            ipAddress, userAgent, message
        });
        await auditLog.save();
    } catch( err ) {
        console.error( 'Error Writing Audit Log', err );
    }
}

export default {
    logAction
}