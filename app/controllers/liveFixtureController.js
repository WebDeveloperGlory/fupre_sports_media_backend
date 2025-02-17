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

exports.getAllLiveAdmins = async ( req, res ) => {
    try {
        const result = await liveFixtureService.getAllLiveAdmins();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllPossibleAdminLiveFixtures = async ( req, res ) => {
    try {
        const result = await liveFixtureService.getAllPossibleAdminLiveFixtures( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateLiveFixtureFormation = async ( req, res ) => {
    try {
        const result = await liveFixtureService.updateLiveFixtureFormation( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllAdminUpcomingFixtures = async ( req, res ) => {
    try {
        const result = await liveFixtureService.getAllAdminUpcomingFixtures( req.user );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;