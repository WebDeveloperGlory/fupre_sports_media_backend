const { Router } = require('express');
const controller = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = Router();

router.post( '/', controller.getAllUsers );
router.post( '/register', controller.createUser );
router.post( '/login', controller.loginUser );
router.post( '/:userId/profile', controller.getUserProfile );
router.post( '/:userId/delete', controller.deleteUser );

module.exports = router;