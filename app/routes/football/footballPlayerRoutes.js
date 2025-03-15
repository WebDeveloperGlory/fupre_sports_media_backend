const { Router } = require('express');
const controller = require('../../controllers/football/footballPlayerController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { refactoredHasPlayerPermisions, authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.post('/', authenticateUser, authorize([ 'superAdmin' ]), controller.addPlayers);
router.get('/:playerId', controller.getPlayer);
router.put('/:playerId', authenticateUser, refactoredHasPlayerPermisions, controller.updateTeamPlayer);
router.delete('/:playerId', authenticateUser, refactoredHasPlayerPermisions, controller.deleteTeamPlayer);
router.put('/:playerId/records', authenticateUser, refactoredHasPlayerPermisions, controller.updatePlayerRecords);

module.exports = router;