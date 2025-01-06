const fixtureService = require('../services/fixtureService');
const dynamicUpdateService = require('../services/dynamicUpdateService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.createFixture = async ( req, res ) => {
    try {
        const result = await fixtureService.createFixture( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllFixtures = async ( req, res ) => {
    try {
        const result = await fixtureService.getAllFixtures( req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getOneFixture = async ( req, res ) => {
    try {
        const result = await fixtureService.getOneFixture( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}
exports.updateFixture = async ( req, res ) => {
    try {
        // Get fixture
        const getFixture = await fixtureService.getOneFixture( req.params );
        if( !getFixture.success ) {
            return error( res, getFixture.message );
        }
        // Update the fixture
        const result = await dynamicUpdateService.dynamicUpdate( getFixture.data, req.body, [ 'type', 'competition', 'result', 'statistics', 'createdAt' ] );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateFixtureResult = async ( req, res ) => {
    try {
        const result = await fixtureService.updateFixtureResult( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTeamFixtureTeamFormAndMatchData = async ( req, res ) => {
    try {
        const result = await fixtureService.getTeamFixtureTeamFormAndMatchData( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;