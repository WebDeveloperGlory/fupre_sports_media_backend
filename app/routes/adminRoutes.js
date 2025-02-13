/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management API
 */
const { Router } = require('express');
const controller = require('../controllers/adminController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/adminMiddleware');

const router = Router();

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Access Denied
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticateUser, authorize(['super-admin', 'competition-admin']), controller.getAdminProfile);

/**
 * @swagger
 * /admin/fixtures:
 *   get:
 *     summary: Get competition admin fixture page data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixture page data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Access Denied
 *       500:
 *         description: Internal server error
 */
router.get('/fixtures', authenticateUser, authorize(['super-admin', 'competition-admin']), controller.getCompetitionAdminFixturePageData);

/**
 * @swagger
 * /admin/records:
 *   get:
 *     summary: Get competition admin fixture records
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixture records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Access Denied
 *       500:
 *         description: Internal server error
 */
router.get('/records', authenticateUser, authorize(['super-admin', 'competition-admin']), controller.getCompetitionAdminFixtureRecords);

module.exports = router;