const db = require('../../config/db'); // Adjust path as needed
const { logActionManually } = require('../../middlewares/auditMiddleware');

/**
 * Create a notification for a specific user
 */
exports.createNotification = async ({ 
    recipient, 
    title, 
    message,
    date
}) => {
    // Check if recipient exists
    const user = await db.RefactoredUser.findById(recipient);
    if (!user) return { success: false, message: 'Recipient not found' };

    // Create the notification
    const notification = await db.RefactoredNotification.create({
        recipient,
        title,
        message,
        date: date || Date.now()
    });

    return {
        success: true,
        message: 'Notification created',
        data: notification
    };
};

/**
 * Admin sends notification to all users
 */
exports.adminSendNotificationToAll = async ({ 
    title, 
    message,
    date
}, { userId, auditInfo }) => {
    // Get all users
    const users = await db.RefactoredUser.find({}).select('_id').lean();
    
    if (!users.length) {
        return {
            success: false,
            message: 'No users found in the system',
        };
    }

    // Create notifications for all users
    const notifications = await Promise.all(
        users.map(user => 
            db.RefactoredNotification.create({
                recipient: user._id,
                title,
                message,
                date: date || Date.now()
            })
        )
    );

    // Log admin action
    logActionManually({
        userId,
        auditInfo,
        action: 'CREATE',
        entity: 'RefactoredNotification',
        entityId: notifications.map(n => n._id),
        details: {
            message: `Admin sent notification to all users (${users.length})`,
            recipientCount: users.length,
            title
        }
    });

    return {
        success: true,
        message: `Sent notification to all users (${users.length})`,
        data: { count: notifications.length }
    };
};

/**
 * Get notifications for a user
 */
exports.getUserNotifications = async ({ userId }, { limit = 20, page = 1, includeRead = false }) => {
    const query = { 
        recipient: userId 
    };
    
    // Filter unread only if specified
    if (!includeRead) {
        query.read = false;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Get notifications with pagination
    const notifications = await db.RefactoredNotification.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    
    // Get total count for pagination info
    const total = await db.RefactoredNotification.countDocuments(query);
    
    return {
        success: true,
        message: 'User notifications retrieved',
        data: notifications,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Mark a notification as read
 */
exports.markNotificationRead = async ({ notificationId }, { userId }) => {
    // Find and update the notification
    const notification = await db.RefactoredNotification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true },
        { new: true }
    );
    
    if (!notification) {
        return {
            success: false,
            message: 'Notification not found or not owned by this user',
        };
    }
    
    return {
        success: true,
        message: 'Notification marked as read',
        data: notification
    };
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllNotificationsRead = async ({ userId }) => {
    // Update all unread notifications for this user
    const result = await db.RefactoredNotification.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );
    
    return {
        success: true,
        message: 'All notifications marked as read',
        data: { modifiedCount: result.modifiedCount }
    };
};

/**
 * Delete a notification
 */
exports.deleteNotification = async ({ notificationId }, { userId, auditInfo }) => {
    // Find the notification first to check ownership
    const notification = await db.RefactoredNotification.findOne({ 
        _id: notificationId,
        recipient: userId
    });
    
    if (!notification) {
        return {
            success: false,
            message: 'Notification not found or not owned by this user',
            code: 404
        };
    }
    
    // Delete the notification
    await notification.deleteOne();
    
    // Log deletion action
    logActionManually({
        userId,
        auditInfo,
        action: 'DELETE',
        entity: 'RefactoredNotification',
        entityId: notificationId,
        details: {
            message: 'User deleted notification',
            notificationTitle: notification.title
        }
    });
    
    return {
        success: true,
        message: 'Notification deleted',
        data: { deleted: true }
    };
};

/**
 * Admin delete notification
 */
exports.adminDeleteNotification = async ({ notificationId }, { userId, auditInfo }) => {
    // Find the notification
    const notification = await db.RefactoredNotification.findById(notificationId);
    
    if (!notification) {
        return {
            success: false,
            message: 'Notification not found',
            code: 404
        };
    }
    
    // Delete the notification
    await notification.deleteOne();
    
    // Log admin deletion action
    logActionManually({
        userId,
        auditInfo,
        action: 'DELETE',
        entity: 'RefactoredNotification',
        entityId: notificationId,
        details: {
            message: 'Admin deleted notification',
            notificationTitle: notification.title,
            recipient: notification.recipient
        }
    });
    
    return {
        success: true,
        message: 'Notification deleted by admin',
        data: { deleted: true }
    };
};

/**
 * Update notification status (read/unread)
 */
exports.updateNotificationStatus = async (
    { notificationId }, 
    { read }, 
    { userId, auditInfo }
) => {
    // Find and update the notification
    const notification = await db.RefactoredNotification.findByIdAndUpdate(
        notificationId,
        { read },
        { new: true }
    );
    
    if (!notification) {
        return {
            success: false,
            message: 'Notification not found',
        };
    }
    
    // Log status update action
    logActionManually({
        userId,
        auditInfo,
        action: 'UPDATE',
        entity: 'RefactoredNotification',
        entityId: notificationId,
        details: {
            message: `Notification marked as ${read ? 'read' : 'unread'}`,
            notificationTitle: notification.title,
            status: read ? 'read' : 'unread'
        }
    });
    
    return {
        success: true,
        message: `Notification marked as ${read ? 'read' : 'unread'}`,
        data: notification
    };
};

/**
 * Get notification stats for a user
 */
exports.getNotificationStats = async ({ userId }) => {
    const [totalCount, unreadCount] = await Promise.all([
        db.RefactoredNotification.countDocuments({ recipient: userId }),
        db.RefactoredNotification.countDocuments({ recipient: userId, read: false })
    ]);
    
    return {
        success: true,
        message: 'Notification stats retrieved',
        data: {
            total: totalCount,
            unread: unreadCount,
            read: totalCount - unreadCount
        }
    };
};

module.exports = exports;