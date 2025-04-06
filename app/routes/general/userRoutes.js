const { Router } = require('express');
const controller = require('../../controllers/general/userController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.get( '/', authenticateUser, authorize([ 'superAdmin' ]), controller.getAllUsers );
router.get( '/me', authenticateUser, controller.getProfile );
router.get( '/:userId', authenticateUser, controller.getOneUser );
router.put( '/:userId', authenticateUser, controller.updateUser );
router.delete( '/:userId', authenticateUser, authorize([ 'superAdmin' ]), controller.deleteUser );
router.put( '/:userId/reset-password', authenticateUser, authorize([ 'superAdmin' ]), controller.completePasswordReset );

module.exports = router;