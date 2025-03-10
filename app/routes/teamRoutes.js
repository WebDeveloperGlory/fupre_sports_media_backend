const { Router } = require('express');
const controller = require('../controllers/teamController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { hasTeamPermissions, authorize } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/', controller.getAllTeams );
router.post( '/', authenticateUser, authorize([ 'super-admin' ]), controller.createTeam );
router.get( '/overview', controller.getTeamOverview );
router.get( '/:teamId', controller.getSingleTeam );
router.get( '/:teamId/overview', controller.getSingleTeamOverview );
router.get( '/:teamId/fixtures', controller.getSingleTeamFixtures );
router.get( '/:teamId/stats', controller.getSingleTeamStats );
router.patch( '/:teamId/admin', authenticateUser, authorize([ 'super-admin' ]), controller.updateTeamAdmin );
router.get( '/:teamId/players', controller.getTeamPlayers );
router.put( '/:teamId/players', authenticateUser, hasTeamPermissions, controller.addPlayerToTeam );
router.get( '/:teamId/friendly-request', authenticateUser, hasTeamPermissions, controller.getFriendlyRequests );
router.post( '/:teamId/friendly-request', authenticateUser, hasTeamPermissions, controller.sendMatchRequest );
router.put( '/:teamId/friendly-request/:requestId', authenticateUser, hasTeamPermissions, controller.updateMatchRequestStatus );
router.get( '/:teamId/competition-invitation', authenticateUser, hasTeamPermissions, controller.getCompetitionRequests );
router.put( '/:teamId/competition-invitation/:competitionId', authenticateUser, hasTeamPermissions, controller.updateCompetitionInvitationStatus );

module.exports = router;