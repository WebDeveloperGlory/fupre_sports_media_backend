const { Router } = require('express');
const controller = require('../controllers/adminController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { hasCompetitionPermissions, authorize } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/profile', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.getAdminProfile );
router.get( '/fixtures', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.getCompetitionAdminFixturePageData );
router.get( '/records', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.getCompetitionAdminFixtureRecords );

module.exports = router;