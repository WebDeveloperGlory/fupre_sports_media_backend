const { Router } = require('express');
const controller = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/adminMiddleware');

const router = Router();

router.get( '/', authenticateUser, isSuperAdmin, controller.getAllUsers );
router.post( '/register', controller.createUser );
router.post( '/login', controller.loginUser );
router.get( '/:userId', controller.getUserProfile );
router.delete( '/:userId', authenticateUser, isSuperAdmin, controller.deleteUser );

module.exports = router;