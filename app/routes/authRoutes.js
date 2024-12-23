const { Router } = require('express');
const controller = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = Router();

router.get( '/', controller.getAllUsers );
router.post( '/register', controller.createUser );
router.post( '/login', controller.loginUser );
router.get( '/:userId/profile', controller.getUserProfile );
router.delete( '/:userId/delete', controller.deleteUser );

module.exports = router;