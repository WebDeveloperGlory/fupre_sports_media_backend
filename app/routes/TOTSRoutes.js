const { Router } = require('express');
const controller = require('../controllers/TOTSController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

const router = Router();

// Public Routes //
router.get('/', controller.getAllSessions);
router.get('/:sessionId', controller.getSingleSession);
router.get('/:sessionId/players', controller.getPlayersPerSession);
router.get('/:sessionId/result', controller.getFinalVoteResult);
router.get('/:sessionId/vote/regular', authenticateUser, controller.getUserVote);
router.post('/:sessionId/vote/regular', authenticateUser, controller.submitUserVote);

// Private Routes //
router.post('/', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.createSession);
router.post('/:sessionId/players', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.addPlayersToSession);
router.delete('/:sessionId/players', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.deletePlayersFromSession);
router.put('/:sessionId/toggle', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.toggleVote);
router.post('/:sessionId/vote/admin', authenticateUser, authorize([ 'super-admin', 'competition-admin', 'mediaAdmin' ]), controller.submitAdminVote);
router.post('/:sessionId/finalize', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.calculateFinalResult);

module.exports = router;