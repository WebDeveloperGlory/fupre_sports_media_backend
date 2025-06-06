const { Router } = require('express');
const controller = require('../controllers/competitionController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { hasCompetitionPermissions, authorize } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/', controller.getAllCompetitions );
router.post( '/', authenticateUser, authorize([ 'super-admin' ]), controller.createCompetition );
router.get( '/:competitionId', controller.getSingleCompetition );
router.patch( '/:competitionId', authenticateUser, hasCompetitionPermissions, controller.updateCompetition );
router.patch( '/:competitionId/featured', authenticateUser, hasCompetitionPermissions, controller.makeFeatured );
router.get( '/:competitionId/overview', controller.getSingleLeagueCompetitionOverview );
router.get( '/:competitionId/player-stats', controller.getPlayerStats );
router.get( '/:competitionId/team-stats', controller.getAllTeamStats );
router.get( '/:competitionId/top-teams', controller.getTopTeams );
router.get( '/:competitionId/top-players', controller.getTopPlayers );
router.put( '/:competitionId/invite-teams', authenticateUser, hasCompetitionPermissions, controller.inviteTeamsToCompetition );
router.put( '/:competitionId/add-teams', authenticateUser, hasCompetitionPermissions, controller.addTeamsToCompetition );
router.put( '/:competitionId/admin', authenticateUser, authorize([ 'super-admin' ]), controller.updateCompetitionAdmin );
router.get( '/:competitionId/fixtures', controller.getCompetitionFixtures );
router.post( '/:competitionId/fixtures', authenticateUser, hasCompetitionPermissions, controller.addCompetitionFixture );
router.patch( '/:competitionId/fixtures/:fixtureId', authenticateUser, hasCompetitionPermissions, controller.updateCompetitionFixtureResult );
router.get( '/:competitionId/league-table', controller.getFullTable );
router.post( '/:competitionId/league-table', authenticateUser, hasCompetitionPermissions, controller.initializeLeagueTable );
router.get( '/:competitionId/knockout/phases', controller.getKnockoutPhases );
router.post( '/:competitionId/knockout/phases', authenticateUser, hasCompetitionPermissions, controller.addKnockoutPhases );
router.post( '/:competitionId/knockout/teams', authenticateUser, hasCompetitionPermissions, controller.addTeamsToKncokoutPhase );
router.post( '/:competitionId/knockout/fixtures', authenticateUser, hasCompetitionPermissions, controller.addFixturesToKnockoutPhase );

module.exports = router;