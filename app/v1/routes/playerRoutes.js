const { Router } = require('express');
const controller = require('../controllers/playerController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { hasPlayerPermissions, authorize } = require('../middlewares/adminMiddleware');

const router = Router();

router.get('/:playerId', controller.getPlayer);
router.put('/:playerId', authenticateUser, hasPlayerPermissions, controller.updateTeamPlayer);
router.delete('/:playerId', authenticateUser, hasPlayerPermissions, controller.deleteTeamPlayer);

module.exports = router;