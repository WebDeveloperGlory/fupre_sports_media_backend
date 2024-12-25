const authService = require('../services/authService');
// const dynamicUpdateService = require('../services/dynamicUpdateService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.createUser = async ( req, res ) => {
    try {
        const result = await authService.createUser( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.loginUser = async ( req, res ) => {
    try {
        const result = await authService.loginUser( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllUsers = async ( req, res ) => {
    try {
        const result = await authService.getAllUsers();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getUserProfile = async ( req, res ) => {
    try {
        const result = await authService.getUserProfile( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.deleteUser = async ( req, res ) => {
    try {
        const result = await authService.deleteUser( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

// exports.updateUserProfile = async ( req, res ) => {
//     try {
//         // Get user profile
//         const getResult = await authService.getUserProfile( req.user );
//         // Update the user profile
//         const result = await dynamicUpdateService.dynamicUpdate( getResult.data, req.body, [ 'password', 'status', 'createdAt', 'otpExpiresAt', 'otp', 'otpUpdatedAt', 'email' ]);

//         if( result.success ) {
//             return success( res, result.message, result.data );
//         }
//         return error( res, result.message );
//     } catch ( err ) {
//         return serverError( res, err );
//     }
// }

module.exports = exports;