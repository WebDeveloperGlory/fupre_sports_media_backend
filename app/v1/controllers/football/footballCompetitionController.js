const competitionService = require('../../services/football/footballCompetitionService');
const dynamicUpdateService = require('../../services/general/dynamicUpdateService');
const { success, serverError, error } = require('../../utils/responseUtils');

exports.getAllCompetitions = async ( req, res ) => {
    try {
        const result = await competitionService.getAllCompetitions( req.query );

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

exports.getCompetitionFixtures = async ( req, res ) => {
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

exports.getCompetitionTeams = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionTeams( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionTeamSquadList = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionTeamSquadList( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionStandings = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionStandings( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionKnockouts = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionKnockouts( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionGroups = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionGroups( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.getCompetitionSingleGroup = async ( req, res ) => {
    try {
        const result = await competitionService.getCompetitionSingleGroup( req.params );

        if( result.success ) {
            return success( res, result.message, result.data );
        }
        return error( res, result.message );
    } catch ( err ) {
        return serverError( res, err );
    }
}

exports.createCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.createCompetition( 
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

exports.updateCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.updateCompetition( 
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

exports.updateCompetitionStatus = async ( req, res ) => {
    try {
        const result = await competitionService.updateCompetitionStatus( 
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

exports.inviteTeamsToCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.inviteTeamsToCompetition( 
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

exports.addTeamsToCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.addTeamsToCompetition( 
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

exports.removeTeamFromCompetition = async ( req, res ) => {
    try {
        const result = await competitionService.removeTeamFromCompetition( 
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

exports.registerTeamSquadList = async ( req, res ) => {
    try {
        const result = await competitionService.registerTeamSquadList( 
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

exports.initializeLeagueTable = async ( req, res ) => {
    try {
        const result = await competitionService.initializeLeagueTable( 
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

exports.addKnockoutPhases = async ( req, res ) => {
    try {
        const result = await competitionService.addKnockoutPhases( 
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

exports.addGroupStage = async ( req, res ) => {
    try {
        const result = await competitionService.addGroupStage( 
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

exports.addCompetitionFixture = async ( req, res ) => {
    try {
        const result = await competitionService.addCompetitionFixture( 
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

exports.updateCompetitionFixtureResult = async ( req, res ) => {
  try {
        const result = await competitionService.updateCompetitionFixtureResult( 
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

exports.deleteCompetitionFixture = async ( req, res ) => {
    try {
        const result = await competitionService.deleteCompetitionFixture( 
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

exports.addFixturesToKnockoutPhase = async ( req, res ) => {
  try {
        const result = await competitionService.addFixturesToKnockoutPhase( 
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

exports.addFixturesToGroupStage = async ( req, res ) => {
  try {
        const result = await competitionService.addFixturesToGroupStage( 
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

exports.addTeamsToGroupStage = async ( req, res ) => {
  try {
        const result = await competitionService.addTeamsToGroupStage( 
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

exports.removeFixtureFromKonckoutPhase = async ( req, res ) => {
  try {
        const result = await competitionService.removeFixtureFromKonckoutPhase( 
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

exports.removeFixtureFromGroupStage = async ( req, res ) => {
  try {
        const result = await competitionService.removeFixtureFromGroupStage( 
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

exports.removeTeamFromGroupStage = async ( req, res ) => {
  try {
        const result = await competitionService.removeTeamFromGroupStage( 
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

exports.makeFeatured = async ( req, res ) => {
  try {
        const result = await competitionService.makeFeatured( 
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

exports.setCompetitionAdmin = async ( req, res ) => {
  try {
        const result = await competitionService.setCompetitionAdmin( 
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

exports.deleteCompetition = async ( req, res ) => {
  try {
        const result = await competitionService.deleteCompetition( 
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