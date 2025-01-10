const { Router } = require('express');
const controller = require('../controllers/competitionController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { isSuperAdmin, hasCompetitionPermissions } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/', controller.getAllCompetitions );
router.post( '/', authenticateUser, isSuperAdmin, controller.createCompetition );
router.get( '/:competitionId', controller.getSingleCompetition );
router.patch( '/:competitionId', authenticateUser, hasCompetitionPermissions, controller.updateCompetition );
router.get( '/:competitionId/overview', controller.getSingleLeagueCompetitionOverview );
router.get( '/:competitionId/player-stats', controller.getPlayerStats );
router.get( '/:competitionId/team-stats', controller.getAllTeamStats );
router.get( '/:competitionId/top-teams', controller.getTopTeams );
router.get( '/:competitionId/top-players', controller.getTopPlayers );
router.put( '/:competitionId/invite-teams', authenticateUser, hasCompetitionPermissions, controller.inviteTeamsToCompetition );
router.put( '/:competitionId/add-teams', authenticateUser, hasCompetitionPermissions, controller.addTeamsToCompetition );
router.put( '/:competitionId/admin', authenticateUser, isSuperAdmin, controller.updateCompetitionAdmin );
router.get( '/:competitionId/fixtures', controller.getCompetitionFixtures );
router.post( '/:competitionId/fixtures', authenticateUser, hasCompetitionPermissions, controller.addCompetitionFixture );
router.patch( '/:competitionId/fixtures/:fixtureId', authenticateUser, hasCompetitionPermissions, controller.updateCompetitionFixtureResult );
router.get( '/:competitionId/league-table', controller.getFullTable );
router.post( '/:competitionId/league-table', authenticateUser, hasCompetitionPermissions, controller.initializeLeagueTable );

module.exports = router;