import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { UserRole } from '../../types/user.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';
import { IV2User } from '../../models/general/User';

const getProfile = async (
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Get user profile
        const user = await db.V2User.findById(userId);
        if (!user) return { success: false, message: 'User not found' };

        // Return success
        return { 
            success: true,
            message: 'User Profile Fetched',
            data: user
        }
    } catch ( err ) {
        console.error('Error Fetching User Profile', err);
        throw new Error('Error Fetching User Profile')
    }
}

const updateProfile = async (
    { updateData }: { updateData: Partial<IV2User> },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Update user profile
        const user = await db.V2User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!user) return { success: false, message: 'User not found' };

        // Log audit information
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2User',
            entityId: userId,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            message: `User profile updated by ${userId}`,
        });

        // Return success
        return {
            success: true,
            message: 'User Profile Updated',
            data: user
        }
    } catch ( err ) {
        console.error('Error Updating User Profile', err);
        throw new Error('Error Updating User Profile')
    }
}

const userService = {
    getProfile,
    updateProfile,
}

export default userService;