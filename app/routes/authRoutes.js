/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API for users
 */
const { Router } = require('express');
const controller = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/adminMiddleware');

const router = Router();

/**
 * @swagger
 * /auth/:
 *   get:
 *     summary: Get all users
 *     tags: [Auth]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (no access to this route)
 */
router.get( '/', authenticateUser, isSuperAdmin, controller.getAllUsers );

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [ 'team-admin', 'super-admin', 'competition-admin' ]
 *                 example: 'team-admin'
 *     responses:
 *       201:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid input)
 */
router.post( '/register', controller.createUser );

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successfully logged in, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "your_jwt_token_here"
 *       400:
 *         description: Bad request (invalid input)
 *       401:
 *         description: Unauthorized (invalid credentials)
 */
router.post( '/login', controller.loginUser );

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.post( '/logout', controller.logoutUser );

/**
 * @swagger
 * /auth/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 */
router.get( '/:userId', controller.getUserProfile );

/**
 * @swagger
 * /auth/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden (no permission to delete)
 *       401:
 *         description: Unauthorized (invalid token)
 */
router.delete( '/:userId', authenticateUser, isSuperAdmin, controller.deleteUser );

module.exports = router;