/**
 * @swagger
 * tags:
 *   name: Live Fixtures
 *   description: Live Fixture management API
 */
const { Router } = require('express');
const controller = require('../controllers/liveFixtureController');
const { authorize } = require('../middlewares/adminMiddleware');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @swagger
 * /live-fixtures/initialize:
 *   post:
 *     summary: Initialize a live fixture
 *     tags: [Live Fixtures]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixtureId
 *             properties:
 *               fixtureId:
 *                 type: string
 *                 example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       201:
 *         description: Live fixture initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid fixture ID or fixture already exists)
 *       404:
 *         description: Fixture not found
 */
router.post('/initialize', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.initializeLiveFixture);

router.post('/finalize', authenticateUser, authorize([ 'super-admin', 'competition-admin', 'live-admin' ]), controller.endLiveFixture);

/**
 * @swagger
 * /live-fixtures/update/{fixtureId}:
 *   put:
 *     summary: Update a live fixture
 *     tags: [Live Fixtures]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The live fixture ID
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
 *               result:
 *                 type: object
 *                 properties:
 *                   homeScore:
 *                     type: integer
 *                     example: 2
 *                   awayScore:
 *                     type: integer
 *                     example: 1
 *                   homePenalty:
 *                     type: integer
 *                     nullable: true
 *                     example: null
 *                   awayPenalty:
 *                     type: integer
 *                     nullable: true
 *                     example: null
 *               statistics:
 *                 type: object
 *                 properties:
 *                   home:
 *                     type: object
 *                   away:
 *                     type: object
 *               matchEvents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     eventType:
 *                       type: string
 *                       example: "goal"
 *                     team:
 *                       type: string
 *                       example: "60b8c0a1a8b3a12b8c99a58b"
 *                     player:
 *                       type: string
 *                       example: "60b8c0a1a8b3a12b8c99a58b"
 *                     time:
 *                       type: integer
 *                       example: 45
 *                     commentary:
 *                       type: string
 *                       example: "enter event commentary"
 *               homeLineup:
 *                 type: object
 *                 properties:
 *                   formation:
 *                     type: string
 *                     example: "4-3-3"
 *                   startingXI:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "playerId1"
 *                   subs:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "playerId2"
 *               awayLineup:
 *                 type: object
 *                 properties:
 *                   formation:
 *                     type: string
 *                     example: "4-4-2"
 *                   startingXI:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "playerId3"
 *                   subs:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "playerId4"
 *     responses:
 *       200:
 *         description: Live fixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: Live fixture not found
 */
router.put('/update/:fixtureId', authenticateUser, authorize([ 'super-admin', 'live-match-admin', 'competition-admin' ]), controller.updateLiveFixture);


router.get('/fixtures', authenticateUser, authorize([ 'super-admin', 'live-match-admin', 'competition-admin', 'team-admin' ]), controller.getAllAdminUpcomingFixtures);

/**
 * @swagger
 * /live-fixtures/{fixtureId}:
 *   get:
 *     summary: Get a live fixture
 *     tags: [Live Fixtures]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         description: The live fixture ID
 *         schema:
 *           type: string
 *           example: "60b8c0a1a8b3a12b8c99a58b"
 *     responses:
 *       200:
 *         description: Live fixture details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Live fixture not found
 */
router.get('/fixtures/:fixtureId', controller.getLiveFixture);

router.get('/fixtures/:fixtureId/players', controller.getLiveFixtureTeamPlayers);
router.put('/fixtures/:fixtureId/formation', controller.updateLiveFixtureFormation);

router.get('/admins', authenticateUser, authorize([ 'super-admin', 'competition-admin' ]), controller.getAllLiveAdmins);

router.get('/admins/live', authenticateUser, authorize([ 'super-admin', 'competition-admin', 'live-match-admin' ]), controller.getAllPossibleAdminLiveFixtures);

module.exports = router;