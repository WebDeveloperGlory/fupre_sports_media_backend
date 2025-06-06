const { Router } = require('express');
const controller = require('../../controllers/general/authController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.post( '/register/regular', controller.registerRegularUser );
router.post( '/register/admin', authenticateUser, authorize([ 'superAdmin' ]), controller.registerAdmin );
router.post( '/login', controller.loginUser );
router.post( '/logout', authenticateUser, controller.logoutUser );
router.post( '/update-password', authenticateUser, controller.changePassword );

module.exports = router;