const { Router } = require('express');
const controller = require('../../controllers/football/footballTOTSController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

// Public Routes //
router.get('/', controller.getAllSessions);
router.get('/:sessionId', controller.getSingleSession);
router.get('/:sessionId/players', controller.getPlayersPerSession);
router.get('/:sessionId/result', controller.getFinalVoteResult);
router.get('/:sessionId/vote/regular', authenticateUser, controller.getUserVote);
router.post('/:sessionId/vote/regular', authenticateUser, controller.submitUserVote);

// Private Routes //
router.post('/', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin' ]), controller.createSession);
router.post('/:sessionId/players', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin' ]), controller.addPlayersToSession);
router.delete('/:sessionId/players', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin' ]), controller.deletePlayersFromSession);
router.put('/:sessionId/toggle', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin' ]), controller.toggleVote);
router.post('/:sessionId/vote/admin', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin', 'mediaAdmin' ]), controller.submitAdminVote);
router.post('/:sessionId/finalize', authenticateUser, authorize([ 'superAdmin', 'headMediaAdmin' ]), controller.calculateFinalResult);

module.exports = router;