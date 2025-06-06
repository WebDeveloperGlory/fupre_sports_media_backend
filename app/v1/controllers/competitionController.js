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
        const result = await competitionService.addCompetitionFixture( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.initializeLeagueTable = async ( req, res ) => {
    try {
        const result = await competitionService.initializeLeagueTable( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getSingleLeagueCompetitionOverview = async ( req, res )  => {
    try {
        const result = await competitionService.getSingleLeagueCompetitionOverview( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getFullTable = async ( req, res )  => {
    try {
        const result = await competitionService.getFullTable( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getKnockoutPhases = async ( req, res )  => {
    try {
        const result = await competitionService.getKnockoutPhases( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionFixtures = async ( req, res )  => {
    try {
        const result = await competitionService.getCompetitionFixtures( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.updateCompetitionFixtureResult = async ( req, res )  => {
    try {
        const result = await competitionService.updateCompetitionFixtureResult( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTopPlayers = async ( req, res )  => {
    try {
        const result = await competitionService.getTopPlayers( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getTopTeams = async ( req, res ) => {
    try {
        const result = await competitionService.getTopTeams( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getAllTeamStats = async ( req, res ) => {
    try {
        const result = await competitionService.getAllTeamStats( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getPlayerStats = async ( req, res ) => {
    try {
        const result = await competitionService.getPlayerStats( req.params, req.query );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addKnockoutPhases = async ( req, res ) => {
    try {
        const result = await competitionService.addKnockoutPhases( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addTeamsToKncokoutPhase = async ( req, res ) => {
    try {
        const result = await competitionService.addTeamsToKncokoutPhase( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.addFixturesToKnockoutPhase = async ( req, res ) => {
    try {
        const result = await competitionService.addFixturesToKnockoutPhase( req.params, req.body );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.makeFeatured = async ( req, res ) => {
    try {
        const result = await competitionService.makeFeatured( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;