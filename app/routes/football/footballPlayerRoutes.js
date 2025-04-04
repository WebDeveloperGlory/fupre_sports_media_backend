const { Router } = require('express');
const controller = require('../../controllers/football/footballPlayerController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { refactoredHasPlayerPermisions, authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.post('/', authenticateUser, authorize([ 'superAdmin' ]), controller.addPlayers);
router.get('/:playerId', controller.getPlayer);
router.put('/:playerId', authenticateUser, refactoredHasPlayerPermisions, controller.updatePlayer);
router.delete('/:playerId', authenticateUser, refactoredHasPlayerPermisions, controller.deleteTeamPlayer);
router.put('/:playerId/stats', authenticateUser, refactoredHasPlayerPermisions, controller.updatePlayerStats);
router.put( '/:playerId/transfer', authenticateUser, authorize([ 'superAdmin' ]), controller.transferOrLoanPlayer );

module.exports = router;