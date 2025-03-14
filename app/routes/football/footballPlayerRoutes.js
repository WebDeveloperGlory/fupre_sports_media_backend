const { Router } = require('express');
const controller = require('../../controllers/football/footballPlayerController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { hasPlayerPermissions, authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.post('/', authenticateUser, authorize([ 'super-admin', 'team-admin' ]), controller.addPlayers);
router.get('/:playerId', controller.getPlayer);
router.put('/:playerId', authenticateUser, hasPlayerPermissions, controller.updateTeamPlayer);
router.delete('/:playerId', authenticateUser, hasPlayerPermissions, controller.deleteTeamPlayer);
router.put('/:playerId/records', authenticateUser, hasPlayerPermissions, controller.updatePlayerRecords);

module.exports = router;