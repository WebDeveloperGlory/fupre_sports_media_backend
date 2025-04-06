const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');

exports.getAllUsers = async () => {
    // Find all users
    const foundUsers = await db.RefactoredUser.find().select( '-password' );

    // Return success
    return { success: true, message: 'All Users Aquired', data: foundUsers };
}

exports.getProfile = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.RefactoredUser.findById( userId ).select('-password');
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    // Find User Notifications
    const notifications = await db.RefactoredNotification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .select('-userId -__v');
    const unreadNotifications = await db.RefactoredNotification.find({ recipient: userId, read: false }).countDocuments();

    return { 
        success: true, 
        message: 'User Aquired', 
        data: {
            user: foundUser,
            unreadNotifications,
            notifications
        } 
    };
}

exports.getOneUser = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.RefactoredUser.findById( userId ).select('-password');
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    return { success: true, message: 'User Aquired', data: foundUser };
}

exports.completePasswordReset = async ( { userId }, { newPassword, confirmNewPassword }, { auditInfo } ) => {
    // Find user in database
    const foundUser = await db.RefactoredUser.findById( userId );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    // Check if passwords match
    const matchingPasswords = newPassword === confirmNewPassword;
    if( !matchingPasswords ) return { success: false, message: 'Passwords Do Not Match' };

    // Update password
    foundUser.password = newPassword;
    await foundUser.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'RefactoredUser',
        entityId: userId,
        details: {
            message: `User Password Changed`
        }
    });

    return { success: true, message: 'Password Reset', data: null };
}

exports.deleteUser = async ({ userId }, { auditInfo }) => {
    // Delete user from database
    const deletedUser = await db.RefactoredUser.findByIdAndDelete( userId ).select( '-password' );
    if( !deletedUser ) return { success: false, message: 'Invalid User' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'RefactoredUser',
        entityId: userId,
        details: {
            message: `User Deleted`
        },
        previousValues: deletedUser.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'User Deleted', data: deletedUser }
}

module.exports = exports;