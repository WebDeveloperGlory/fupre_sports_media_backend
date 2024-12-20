const { Router } = require('express');
const controller = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = Router();

router.post( '/register', controller.createUser );
router.post( '/login', controller.loginUser );

module.exports = router;