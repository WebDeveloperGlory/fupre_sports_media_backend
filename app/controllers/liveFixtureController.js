const liveFixtureService = require('../services/liveFixtureService');
const { success, serverError, error } = require('../utils/responseUtils');

exports.initializeLiveFixture = async ( req, res ) => {
    try {
        const result = await liveFixtureService.initializeLiveFixture( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateLiveFixture = async ( req, res ) => {
    try {
        const result = await liveFixtureService.updateLiveFixture( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getLiveFixture = async ( req, res ) => {
    try {
        const result = await liveFixtureService.getLiveFixture( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllAdminTodayFixtures = async ( req, res ) => {
    try {
        const result = await liveFixtureService.getAllAdminTodayFixtures( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;