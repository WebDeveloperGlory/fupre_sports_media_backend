const { Router } = require('express');
const controller = require('../controllers/generalController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { hasCompetitionPermissions, authorize } = require('../middlewares/adminMiddleware');

const router = Router();

router.get('/', controller.getGeneralInfo);

module.exports = router;