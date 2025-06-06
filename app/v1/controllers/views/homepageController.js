const competitionService = require('../../services/football/footballCompetitionService');
const fixtureService = require('../../services/football/footballFixtureService');
const teamService = require('../../services/football/footballTeamService');
const { success, serverError, error } = require('../../utils/responseUtils');

exports.homePageData = async ( req, res ) => {
    const { fixtureFilterBy, fixtureLimit } = req.query;
    try {
        const [ highlightedFixture, allFixtures, allCompetitions, ongoingCompetitions, allTeams, featuredCompetition ] = await Promise.all([
            fixtureService.getAllFixtures({ 
                filterBy: fixtureFilterBy,
                limit: fixtureLimit,
            }),
            fixtureService.getAllFixtures( req.params ),
            competitionService.getAllCompetitions( req.params ),
            competitionService.getAllCompetitions({ status: 'ongoing' }),
            teamService.getAllTeams( req.params ),
            competitionService.getAllCompetitions({ isFeatured: true })
            // competitionService.getCompetition( req.params )
        ]);

        return res.status( 200 ).json({
            code: '00',
            message: 'Success',
            data: {
                highlightedFixture: highlightedFixture.data.fixtures[0] || null,
                totalFixtures: allFixtures.data.pagination.total,
                totalCompetitions: allCompetitions.data.pagination.total,
                totalOngoingCompetitions: ongoingCompetitions.data.pagination.total,
                totalTeams: allTeams.data.pagination.total,
                featuredCompetition: featuredCompetition.data.competitions[0] || null,
            }
        })
    } catch ( err ) {
        return serverError( res, err );
    }
}

module.exports = exports;