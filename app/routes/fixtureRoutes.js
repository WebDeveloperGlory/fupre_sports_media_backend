/**
 * @swagger
 * tags:
 *   name: Fixtures
 *   description: Fixture management API
 */
const { Router } = require('express');
const controller = require('../controllers/fixtureController');
const { authorize } = require('../middlewares/adminMiddleware');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @swagger
 * /fixture/:
 *   get:
 *     summary: Get all fixtures
 *     tags: [Fixtures]
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of fixtures to return
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: filterBy
 *         description: Filter fixtures by specific date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: completed
 *         description: Show completed fixtures only
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: live
 *         description: Show completed fixtures only
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: upcoming
 *         description: Show completed fixtures only
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: A list of fixtures
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (no access to this route)
 */
router.get( '/', controller.getAllFixtures );

/**
 * @swagger
 * /fixture/:
 *   post:
 *     summary: Create a new fixture
 *     tags: [Fixtures]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeTeam
 *               - awayTeam
 *               - type
 *               - date
 *               - stadium
 *               - competition
 *             properties:
 *               homeTeam:
 *                 type: string
 *                 example: "Team A"
 *               awayTeam:
 *                 type: string
 *                 example: "Team B"
 *               type:
 *                 type: string
 *                 example: "league"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-10T18:30:00Z"
 *               stadium:
 *                 type: string
 *                 example: "Stadium A"
 *               competition:
 *                 type: string
 *                 example: "Premier League"
 *     responses:
 *       201:
 *         description: Fixture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (missing or invalid input)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.post( '/', authenticateUser, authorize([ 'super-admin' ]), controller.createFixture );

/**
 * @swagger
 * /fixture/{fixtureId}:
 *   get:
 *     summary: Get details of a specific fixture
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       200:
 *         description: Fixture details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Fixture not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get( '/:fixtureId', controller.getOneFixture );

/**
 * @swagger
 * /fixture/{fixtureId}:
 *   patch:
 *     summary: Update a specific fixture
 *     tags: [Fixtures]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeTeam:
 *                 type: string
 *               awayTeam:
 *                 type: string
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-10T18:30:00Z"
 *               stadium:
 *                 type: string
 *                 example: "Stadium A"
 *               competition:
 *                 type: string
 *                 example: "Premier League"
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: Fixture not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.patch( '/:fixtureId', authenticateUser, authorize([ 'super-admin' ]), controller.updateFixture );

/**
 * @swagger
 * /fixture/{fixtureId}/form:
 *   get:
 *     summary: Get form data and match stats for a fixture's teams
 *     tags: [Fixtures]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       200:
 *         description: Form data and match stats for the fixture's teams
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Fixture not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get( '/:fixtureId/form', controller.getTeamFixtureTeamFormAndMatchData );

/**
 * @swagger
 * /fixture/{fixtureId}/result:
 *   put:
 *     summary: Update the result of a fixture
 *     tags: [Fixtures]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - result
 *             properties:
 *               result:
 *                 type: object
 *                 properties:
 *                   homeScore:
 *                     type: integer
 *                     example: 2
 *                   awayScore:
 *                     type: integer
 *                     example: 1
 *               statistics:
 *                 type: object
 *                 properties:
 *                   home:
 *                     type: object
 *                   away:
 *                     type: object
 *               playerStats:
 *                 type: object
 *                 properties:
 *                   goals:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         playerId:
 *                           type: string
 *                         count:
 *                           type: integer
 *                           example: 2
 *                         times:
 *                           type: array
 *                           items:
 *                             type: integer
 *                             example: 45
 *     responses:
 *       200:
 *         description: Fixture result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: Fixture not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.put( '/:fixtureId/result', authenticateUser, authorize([ 'super-admin' ]), controller.updateFixtureResult );

/**
 * @swagger
 * /fixture/{fixtureId}/formation:
 *   put:
 *     summary: Update the lineup/formation of a fixture
 *     tags: [Fixtures]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeLineup
 *               - awayLineup
 *             properties:
 *               homeLineup:
 *                 type: object
 *                 properties:
 *                   formation:
 *                     type: string
 *                   startingXI:
 *                     type: array
 *                     items:
 *                       type: string
 *                   subs:
 *                     type: array
 *                     items:
 *                       type: string
 *               awayLineup:
 *                 type: object
 *                 properties:
 *                   formation:
 *                     type: string
 *                   startingXI:
 *                     type: array
 *                     items:
 *                       type: string
 *                   subs:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Fixture lineup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: Fixture not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.put( '/:fixtureId/formation', authenticateUser, authorize([ 'super-admin', 'live-match-admin' ]), controller.updateFixtureFormation );

module.exports = router;