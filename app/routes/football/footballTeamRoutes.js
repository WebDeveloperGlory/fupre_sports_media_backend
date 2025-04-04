const { Router } = require('express');
const controller = require('../../controllers/football/footballTeamController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

// Public Routes //
router.get( '/', controller.getAllTeams );
router.get( '/:teamId', controller.getSingleTeam );
router.get( '/:teamId/players', controller.getTeamPlayers );
router.get( '/:teamId/competitions', controller.getTeamCompetitions );
router.get( '/:teamId/form', controller.getTeamForm );
router.get( '/:teamId/team-statistics', controller.getTeamStatistics );
router.get( '/:teamId/player-statistics', controller.getTeamPlayersStatistics );

// Private Routes //
router.post( '/', authenticateUser, controller.createTeam );
router.put( '/:teamId', authenticateUser, controller.updateTeam );
router.put( '/:teamId/captain', authenticateUser, controller.changeTeamCaptain );
router.put( '/:teamId/admin', authenticateUser, authorize([ 'superAdmin' ]), controller.updateTeamAdmin );
router.post( '/:teamId/players', authenticateUser, controller.addPlayerToTeam );
router.delete( '/:teamId/players/:playerId', authenticateUser, controller.removePlayerFromTeam );
router.get( '/:teamId/friendly-requests', authenticateUser, controller.getFriendlyRequests );
router.post( '/:teamId/friendly-requests', authenticateUser, controller.sendFriendlyRequest );
router.put( '/:teamId/friendly-requests/:requestId/status', authenticateUser, controller.updateFriendlyRequestStatus );

// Danger Zone //
router.delete( '/:teamId', authenticateUser, authorize([ 'superAdmin' ]), controller.deleteTeam );

module.exports = router;