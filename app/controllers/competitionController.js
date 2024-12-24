const competitionService = require('../services/competitionService');
const fixtureService = require('../services/fixtureService');
const authService = require('../services/authService');
const dynamicUpdateService = require('../services/dynamicUpdateService');
const { success, error, serverError } = require('../utils/responseUtils');

exports.createCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.createCompetition( req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllCompetitions = async ( req, res ) => {
    try {
        const result = await competitionService.getAllCompetitions();

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.getSingleCompetition( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateCompetition = async ( req, res ) => {
    try {
        // Get competition
        const getCompetition = await competitionService.getSingleCompetition( req.params );
        if( !getCompetition.success ) {
            return error( res, getCompetition.message );
        }

        // Update competition
        const result = await dynamicUpdateService.dynamicUpdate( getCompetition.data, req.body, [ 'teams', 'fixtures', 'admin', 'playerStats', 'knockoutRounds', 'groupStage', 'leagueTable', 'createdAt' ] )
        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.inviteTeamsToCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.inviteTeamsToCompetition( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addTeamsToCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.addTeamsToCompetition( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateCompetitionAdmin = async ( req, res ) => {
    try {
        // Check if user exists
        const foundAdmin = await authService.getUserProfile( req.body )
        if( !foundAdmin.success ) {
            return error( res, foundAdmin.message );
        }

        const result = await competitionService.updateCompetitionAdmin( req.params, { adminId: foundAdmin.data._id } );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addCompetitionFixture = async ( req, res ) => {
    try {
        // Check if user exists
        const createdFixture = await fixtureService.createFixture( req.body )
        if( !createdFixture.success ) {
            return error( res, createdFixture.message );
        }

        const result = await competitionService.addCompetitionFixture( req.params, { fixtureId: createdFixture.data._id } );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;