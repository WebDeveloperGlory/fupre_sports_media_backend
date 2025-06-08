import db from "../config/db";
import { LogAction } from "../types/auditlog.enums";
import { AuditInfo } from "../types/express";
import logutils from '../utils/general/auditLogUtils';
import notificationutils from '../utils/general/notificationUtils';

const registerRegularUser = async (
    { name, email, password }: { name: string, email: string, password: string }, 
    { auditInfo }: { auditInfo: AuditInfo }
) => {
    try {
        // Check if user already exists
        const foundUser = await db.V2User.findOne({ email });
        if( foundUser ) return { success: false, message: 'Email Already Registered In DB' }

        // Create user
        const createdUser = new db.V2User({ name, email, password });
        await createdUser.save();

        const user = {
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role
        }

        // Send notification
        await notificationutils.sendNotification({
            preferences: createdUser.preferences,
            recipient: createdUser._id,
            title: 'Welcome to FUPRE Sports Media',
            message: `Welcome to FUPRE Sports Media, ${createdUser.name}. Your account has been successfully created.`
        });

        // Log action
        await logutils.logAction({
            userId: createdUser._id, 
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            action: LogAction.CREATE,
            entity: 'RefactoredUser',
            entityId: createdUser._id,
            details: {
                message: `Regular User Created`
            }
        });

        // Return success
        return { success: true, message: 'User Created', data: user };
    } catch( err ) {
        throw new Error('Error With User Registration');
    }
}

const service = {
    registerRegularUser
}

export default service;