const authService = require('../../services/general/authService');
const { success, error, serverError } = require('../../utils/responseUtils');

exports.registerRegularUser = async ( req, res ) => {
    try {
        const result = await authService.registerRegularUser(
            req.body,
            { auditInfo: req.auditInfo }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.registerAdmin = async ( req, res ) => {
    try {
        const result = await authService.registerAdmin(
            req.body,
            { 
                userId: req.user.userId,
                auditInfo: req.auditInfo
            }
        );

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
        const result = await authService.loginUser(
            req.body,
            { auditInfo: req.auditInfo }
        );

        if( result.success ) {
            // Send JWT as HTTP-only cookie
            res.cookie('authToken', result.data, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.logoutUser = async ( req, res ) => {
    try {
        const result = await authService.logoutUser({ 
            userId: req.user.userId,
            auditInfo: req.auditInfo
        });

        if( result.success ) {
            res.cookie('authToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 5 * 1000 // 5 seconds
            });
            // Clear Cookies
            // res.clearCookie('authToken');

            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.changePassword = async ( req, res ) => {
    try {
        const result = await authService.changePassword(
            req.body,
            { 
                userId: req.user.userId,
                auditInfo: req.auditInfo
            }
        );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;