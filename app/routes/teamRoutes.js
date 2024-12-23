const { Router } = require('express');
const controller = require('../controllers/teamController');

const router = Router();

router.get( '/', controller.getAllTeams );
router.post( '/', controller.createTeam );
router.get( '/:teamId', controller.getSingleTeam );
router.get( '/:teamId/players', controller.getTeamPlayers );
router.post( '/:teamId/players', controller.addPlayerToTeam );
router.get( '/:teamId/friendly-request', controller.getFriendlyRequests );
router.post( '/:teamId/friendly-request', controller.sendMatchRequest );
router.post( '/:teamId/friendly-request/:requestId', controller.updateMatchRequestStatus );
router.post( '/:teamId/competition-invitation', controller.getCompetitionRequests );
router.post( '/:teamId/competition-invitation/:competitionId', controller.updateCompetitionInvitationStatus );

module.exports = router;