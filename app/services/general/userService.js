const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');

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

    return { success: true, message: 'Password Reset Successfully', data: null };
}

// exports.completePasswordReset = async ( req, res ) => {
//     try {
//         const result = await authService.completePasswordReset(
//             req.params,
//             req.body,
//             { 
//                 userId: req.user.userId,
//                 auditInfo: req.auditInfo
//             }
//         );

//         if( result.success ) {
//             return success( res, result.message, result.data );
//         }
//         return error( res, result.message );
//     } catch ( err ) {
//         return serverError( res, err );
//     }
// }

exports.getAllUsers = async () => {
    // Find all users
    const foundUsers = await db.RefactoredUser.find().select( '-password' );

    // Return success
    return { success: true, message: 'All Users Aquired', data: foundUsers };
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
            message: `User Login`
        }
    });

    // Return success
    return { success: true, message: 'User Deleted', data: deletedUser }
}

module.exports = exports;