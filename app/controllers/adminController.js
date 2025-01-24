const competitionService = require('../services/competitionService');
const adminService = require('../services/adminService');
const dynamicUpdateService = require('../services/dynamicUpdateService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.getCompetitionAdminFixturePageData = async ( req, res ) => {
    try {
        const result = await adminService.getCompetitionAdminFixturePageData( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAdminProfile = async ( req, res ) => {
    try {
        const result = await adminService.getAdminProfile( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;