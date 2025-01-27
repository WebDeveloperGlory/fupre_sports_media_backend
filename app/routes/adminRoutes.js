const { Router } = require('express');
const controller = require('../controllers/adminController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { isCompetitionAdmin, hasCompetitionPermissions } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/profile', authenticateUser, isCompetitionAdmin, controller.getAdminProfile );
router.get( '/fixtures', authenticateUser, isCompetitionAdmin, controller.getCompetitionAdminFixturePageData );
router.get( '/records', authenticateUser, isCompetitionAdmin, controller.getCompetitionAdminFixtureRecords );

module.exports = router;