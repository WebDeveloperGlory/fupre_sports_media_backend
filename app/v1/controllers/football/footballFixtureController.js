const fixtureService = require('../../services/football/footballFixtureService');
const { success, serverError, error } = require('../../utils/responseUtils');
const dynamicUpdateService = require('../../services/general/dynamicUpdateService');

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

exports.getTeamFixtures = async ( req, res ) => {
    try {
        const result = await fixtureService.getTeamFixtures( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.createFriendlyFixture = async ( req, res ) => {
    try {
        const result = await fixtureService.createFriendlyFixture( 
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

exports.updateFixture = async ( req, res ) => {
    try {
        const restrictedFields = [ 'type', 'competition', 'status', 'result', 'goalScorers', 'statistics', 'homeLineup', 'awayLineup', 'matchEvents', 'preMatchOdds' ];
        const fixtureDocument = await fixtureService.getOneFixture( req.params );
        const result = await dynamicUpdateService.dynamicUpdate(
            fixtureDocument.data,
            { updates: req.body },
            restrictedFields,
            {
                entityName: 'FootballFixture', 
                updateMessage: 'Fixture Updated',
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

exports.updateFixtureStatus = async ( req, res ) => {
    try {
        const result = await fixtureService.updateFixtureStatus(
            req.params,
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

exports.updateFixtureResult = async ( req, res ) => {
    try {
        const result = await fixtureService.updateFixtureResult(
            req.params,
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

exports.updateFixtureFormation = async ( req, res ) => {
    try {
        const result = await fixtureService.updateFixtureFormation(
            req.params,
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

exports.deleteFriendlyFixture = async ( req, res ) => {
    try {
        const result = await fixtureService.deleteFriendlyFixture(
            req.params,
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