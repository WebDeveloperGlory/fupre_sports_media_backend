/**
 * @swagger
 * tags:
 *   name: FootballFixture
 *   description: API for managing football fixtures
 *
 * /football/fixture:
 *   get:
 *     summary: Get all football fixtures with advanced filtering
 *     tags: [FootballFixture]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [live, upcoming, completed, postponed, scheduled, tbd]
 *         description: Filter by fixture status (can be array)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter fixtures starting from date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter fixtures ending before date (YYYY-MM-DD)
 *       - in: query
 *         name: competition
 *         schema:
 *           type: string
 *         description: Filter by competition ID
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Filter by team ID (either home or away)
 *       - in: query
 *         name: includeTBD
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include fixtures with TBD dates
 *     responses:
 *       200:
 *         description: Fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               data:
 *                 fixtures:
 *                   - _id: "652a3b8cf9e3457d8a2e67cd"
 *                     homeTeam: 
 *                       _id: "650d1f99a2f45b1a3c2e77bd"
 *                       name: "Team A"
 *                       shorthand: "TMA"
 *                     awayTeam: 
 *                       _id: "650d1f99a2f45b1a3c2e77be"
 *                       name: "Team B"
 *                       shorthand: "TMB"
 *                     type: "competition"
 *                     competition: 
 *                       _id: "651f1b29c45a1b3a3c4e8dcd"
 *                       name: "Premier League"
 *                     date: "2024-03-20T15:00:00Z"
 *                     isDateTBD: false
 *                     status: "upcoming"
 *                     displayDate: "2024-03-20T15:00:00Z"
 *                 pagination:
 *                   total: 1
 *                   page: 1
 *                   limit: 10
 *                   pages: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   post:
 *     summary: Create a new football fixture
 *     tags: [FootballFixture]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeTeam
 *               - awayTeam
 *             properties:
 *               homeTeam:
 *                 type: string
 *                 description: ID of home team
 *               awayTeam:
 *                 type: string
 *                 description: ID of away team
 *               type:
 *                 type: string
 *                 enum: [friendly, competition]
 *                 default: "friendly"
 *               competition:
 *                 type: string
 *                 description: Required if type=competition
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Not required if isDateTBD=true
 *               isDateTBD:
 *                 type: boolean
 *                 default: false
 *               tentativeSchedule:
 *                 type: object
 *                 properties:
 *                   period:
 *                     type: string
 *                   weekNumber:
 *                     type: number
 *               stadium:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fixture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               message: "Fixture created"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "friendly"
 *                 date: null
 *                 isDateTBD: true
 *                 tentativeSchedule: { period: "Mid-October" }
 *                 status: "tbd"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Home and away teams cannot be the same"
 *               code: 400
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/fixture/{fixtureId}:
 *   get:
 *     summary: Get details of a specific football fixture
 *     tags: [FootballFixture]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fixture details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam:
 *                   _id: "650d1f99a2f45b1a3c2e77bd"
 *                   name: "Team A"
 *                   department: "Computer Science"
 *                   shorthand: "TMA"
 *                 awayTeam:
 *                   _id: "650d1f99a2f45b1a3c2e77be"
 *                   name: "Team B"
 *                   department: "Mathematics"
 *                   shorthand: "TMB"
 *                 type: "competition"
 *                 competition:
 *                   _id: "651f1b29c45a1b3a3c4e8dcd"
 *                   name: "Premier League"
 *                 date: "2024-03-20T15:00:00Z"
 *                 isDateTBD: false
 *                 status: "upcoming"
 *                 isDerby: false
 *                 displayDate: "March 20, 2024"
 *                 homeLineup:
 *                   formation: "4-3-3"
 *                   startingXI: []
 *                   subs: []
 *                 awayLineup:
 *                   formation: "4-4-2"
 *                   startingXI: []
 *                   subs: []
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/fixture/{fixtureId}/status:
 *   put:
 *     summary: Update fixture status
 *     tags: [FootballFixture]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [live, upcoming, completed, postponed, scheduled, tbd]
 *               postponementReason:
 *                 type: string
 *                 description: Required when status=postponed
 *               newDate:
 *                 type: string
 *                 format: date-time
 *                 description: New date for postponed fixtures
 *     responses:
 *       200:
 *         description: Fixture status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               message: "Fixture status updated to postponed"
 *               data:
 *                 status: "postponed"
 *                 isPostponed: true
 *                 postponementInfo:
 *                   reason: "Bad weather"
 *                   originalDate: "2024-03-20T15:00:00Z"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Postponement reason required"
 *               code: 400
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/fixture/{fixtureId}/result:
 *   put:
 *     summary: Update fixture result and statistics
 *     tags: [FootballFixture]
 *     security:
 *       - bearerAuth: []
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
 *                   awayScore:
 *                     type: integer
 *                   halftimeHomeScore:
 *                     type: integer
 *                   halftimeAwayScore:
 *                     type: integer
 *                   homePenalty:
 *                     type: integer
 *                   awayPenalty:
 *                     type: integer
 *                   isPenaltyShootout:
 *                     type: boolean
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
 *                       enum: [goal, ownGoal, assist, yellowCard, redCard, substitution, foul, corner, offside, shotOnTarget, shotOffTarget, kickoff, halftime, fulltime, varDecision, injury, injuryTime, goalDisallowed, goalConfirmed, penaltyAwarded, penaltyScored, penaltyMissed, penaltySaved]
 *                     player:
 *                       type: string
 *                     team:
 *                       type: string
 *                     time:
 *                       type: number
 *               homeSubs:
 *                 type: array
 *                 items:
 *                   type: string
 *               awaySubs:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Fixture result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               success: true
 *               message: "Fixture result updated"
 *               data:
 *                 status: "completed"
 *                 result:
 *                   homeScore: 2
 *                   awayScore: 1
 *                 goalScorers:
 *                   - id: "player1"
 *                     team: "team1"
 *                     time: 23
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Cannot update completed fixture"
 *               code: 400
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *   responses:
 *     NotFoundError:
 *       description: The requested resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Fixture not found"
 *               code:
 *                 type: integer
 *                 example: 404
 *     BadRequestError:
 *       description: Invalid request parameters
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Invalid date format"
 *               code:
 *                 type: integer
 *                 example: 400
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Internal server error"
 *               code:
 *                 type: integer
 *                 example: 500
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */