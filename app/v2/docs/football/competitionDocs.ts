/**
 * @swagger
 * tags:
 *   - name: Competitions (General)
 *     description: General competition operations
 *   - name: Competitions (Admin)
 *     description: Admin-only competition operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Competition:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Competition ID
 *         name:
 *           type: string
 *           description: Competition name
 *         shorthand:
 *           type: string
 *           description: Short code for competition
 *         type:
 *           type: string
 *           enum: [league, knockout, hybrid]
 *           description: Competition type
 *         logo:
 *           type: string
 *           description: URL to competition logo
 *         coverImage:
 *           type: string
 *           description: URL to cover image
 *         description:
 *           type: string
 *           description: Competition description
 *         status:
 *           type: string
 *           enum: [upcoming, completed, ongoing, cancelled]
 *           description: Current status
 *         format:
 *           type: object
 *           properties:
 *             groupStage:
 *               type: object
 *               properties:
 *                 numberOfGroups:
 *                   type: number
 *                 teamsPerGroup:
 *                   type: number
 *                 advancingPerGroup:
 *                   type: number
 *             knockoutStage:
 *               type: object
 *               properties:
 *                 hasTwoLegs:
 *                   type: boolean
 *                 awayGoalsRule:
 *                   type: boolean
 *             leagueStage:
 *               type: object
 *               properties:
 *                 matchesPerTeam:
 *                   type: number
 *                 pointsSystem:
 *                   type: object
 *                   properties:
 *                     win:
 *                       type: number
 *                     draw:
 *                       type: number
 *                     loss:
 *                       type: number
 *         season:
 *           type: string
 *           description: Season identifier
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *         currentStage:
 *           type: string
 *         teams:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *               squad:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     player:
 *                       type: string
 *                     jerseyNumber:
 *                       type: number
 *                     isCaptain:
 *                       type: boolean
 *                     position:
 *                       type: string
 *         stats:
 *           type: object
 *           properties:
 *             averageGoalsPerMatch:
 *               type: number
 *             averageAttendance:
 *               type: number
 *             cleanSheets:
 *               type: number
 *             topScorers:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   player:
 *                     type: string
 *                   team:
 *                     type: string
 *                   goals:
 *                     type: number
 *                   penalties:
 *                     type: number
 *             topAssists:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   player:
 *                     type: string
 *                   team:
 *                     type: string
 *                   assists:
 *                     type: number
 *             bestDefenses:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team:
 *                     type: string
 *                   cleanSheets:
 *                     type: number
 *                   goalsConceded:
 *                     type: number
 *         leagueTable:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LeagueStandings'
 *         knockoutRounds:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KnockoutRound'
 *         groupStage:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroupTable'
 *         awards:
 *           type: object
 *           properties:
 *             player:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   winner:
 *                     type: object
 *                     properties:
 *                       player:
 *                         type: string
 *                       team:
 *                         type: string
 *             team:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   winner:
 *                     type: string
 *         rules:
 *           type: object
 *           properties:
 *             substitutions:
 *               type: object
 *               properties:
 *                 allowed:
 *                   type: boolean
 *                 maximum:
 *                   type: number
 *             extraTime:
 *               type: boolean
 *             penalties:
 *               type: boolean
 *             matchDuration:
 *               type: object
 *               properties:
 *                 normal:
 *                   type: number
 *                 extraTime:
 *                   type: number
 *             squadSize:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *         extraRules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               lastUpdated:
 *                 type: string
 *                 format: date-time
 *         sponsors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *               tier:
 *                 type: string
 *                 enum: [main, official, partner]
 *         prizeMoney:
 *           type: object
 *           properties:
 *             champion:
 *               type: number
 *             runnerUp:
 *               type: number
 *         isActive:
 *           type: boolean
 *         isFeatured:
 *           type: boolean
 *         admin:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     LeagueStandings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         team:
 *           type: string
 *         played:
 *           type: number
 *         points:
 *           type: number
 *         disciplinaryPoints:
 *           type: number
 *         wins:
 *           type: number
 *         losses:
 *           type: number
 *         draws:
 *           type: number
 *         goalsFor:
 *           type: number
 *         goalsAgainst:
 *           type: number
 *         goalDifference:
 *           type: number
 *         form:
 *           type: array
 *           items:
 *             type: string
 *             enum: [W, L, D]
 *         position:
 *           type: number
 * 
 *     KnockoutRound:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         fixtures:
 *           type: array
 *           items:
 *             type: string
 *         completed:
 *           type: boolean
 * 
 *     GroupTable:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         standings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LeagueStandings'
 *         fixtures:
 *           type: array
 *           items:
 *             type: string
 *         qualificationRules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *               destination:
 *                 type: string
 *                 enum: [knockout, playoffs, eliminated]
 *               knockoutRound:
 *                 type: string
 *               isBestLoserCandidate:
 *                 type: boolean
 *         qualifiedTeams:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *               originalPosition:
 *                 type: number
 *               qualifiedAs:
 *                 type: string
 *               destination:
 *                 type: string
 * 
 *     CreateCompetition:
 *       type: object
 *       required:
 *         - name
 *         - shorthand
 *         - type
 *         - season
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *         shorthand:
 *           type: string
 *         type:
 *           type: string
 *           enum: [league, knockout, hybrid]
 *         season:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         registrationDeadline:
 *           type: string
 *           format: date-time
 *         description:
 *           type: string
 * 
 *     CloneCompetition:
 *       type: object
 *       required:
 *         - name
 *         - season
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *         season:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /competition:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get all competitions
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, completed, ongoing, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [league, knockout, hybrid]
 *         description: Filter by competition type
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter featured competitions
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of competitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "All Competitions Acquired"
 *                 data:
 *                   type: object
 *                   properties:
 *                     competitions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Competition'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 * 
 *   post:
 *     tags: [Competitions (Admin)]
 *     summary: Create a new competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompetition'
 *     responses:
 *       201:
 *         description: Competition created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Created"
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */

/**
 * @swagger
 * /competition/{competitionId}:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition details
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Acquired"
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/clone:
 *   post:
 *     tags: [Competitions (Admin)]
 *     summary: Clone competition for new season (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID to clone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloneCompetition'
 *     responses:
 *       201:
 *         description: Competition cloned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Cloned"
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/league-table:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition league table
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: League table data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "League Table Acquired"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeagueStandings'
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/knockout:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition knockout rounds
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Knockout rounds data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Knockout Rounds Acquired"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnockoutRound'
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/groups:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition groups
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Groups data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Group Stage Acquired"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupTable'
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/teams:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition teams and squads
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Teams and squads data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Teams Acquired"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: string
 *                       squad:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             player:
 *                               type: string
 *                             jerseyNumber:
 *                               type: number
 *                             isCaptain:
 *                               type: boolean
 *                             position:
 *                               type: string
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/fixtures:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition fixtures
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter fixtures from date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter fixtures to date
 *     responses:
 *       200:
 *         description: Fixtures data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Fixtures Acquired"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fixtures:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           homeTeam:
 *                             type: string
 *                           awayTeam:
 *                             type: string
 *                           scheduledDate:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * /competition/{competitionId}/stats:
 *   get:
 *     tags: [Competitions (General)]
 *     summary: Get competition statistics
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Stats Acquired"
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageGoalsPerMatch:
 *                       type: number
 *                     averageAttendance:
 *                       type: number
 *                     cleanSheets:
 *                       type: number
 *                     topScorers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           player:
 *                             type: string
 *                           team:
 *                             type: string
 *                           goals:
 *                             type: number
 *                           penalties:
 *                             type: number
 *                     topAssists:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           player:
 *                             type: string
 *                           team:
 *                             type: string
 *                           assists:
 *                             type: number
 *                     bestDefenses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           team:
 *                             type: string
 *                           cleanSheets:
 *                             type: number
 *                           goalsConceded:
 *                             type: number
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [upcoming, completed, ongoing, cancelled]
 *           description: New competition status
 * 
 *     CompetitionInfoUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         shorthand:
 *           type: string
 *         season:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         prizeMoney:
 *           type: object
 *           properties:
 *             champion:
 *               type: number
 *             runnerUp:
 *               type: number
 *         substitutions:
 *           type: object
 *           properties:
 *             allowed:
 *               type: boolean
 *             maximum:
 *               type: number
 *         extraTime:
 *           type: boolean
 *         penalties:
 *           type: boolean
 *         matchDuration:
 *           type: object
 *           properties:
 *             normal:
 *               type: number
 *             extraTime:
 *               type: number
 *         squadSize:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 * 
 *     TeamRegistration:
 *       type: object
 *       required:
 *         - teamId
 *       properties:
 *         teamId:
 *           type: string
 *           description: ID of team to register/unregister
 * 
 *     TeamSquad:
 *       type: object
 *       required:
 *         - teamId
 *         - squadList
 *       properties:
 *         teamId:
 *           type: string
 *         squadList:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *               jerseyNumber:
 *                 type: number
 *               isCaptain:
 *                 type: boolean
 *               position:
 *                 type: string
 * 
 *     GroupInput:
 *       type: object
 *       required:
 *         - name
 *         - teamIds
 *       properties:
 *         name:
 *           type: string
 *         teamIds:
 *           type: array
 *           items:
 *             type: string
 *         qualificationRules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *               destination:
 *                 type: string
 *                 enum: [knockout, playoffs, eliminated]
 *               knockoutRound:
 *                 type: string
 *               isBestLoserCandidate:
 *                 type: boolean
 * 
 *     KnockoutRoundInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 * 
 *     FixtureInput:
 *       type: object
 *       required:
 *         - homeTeam
 *         - awayTeam
 *         - stadium
 *         - scheduledDate
 *         - referee
 *       properties:
 *         homeTeam:
 *           type: string
 *         awayTeam:
 *           type: string
 *         stadium:
 *           type: string
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         referee:
 *           type: string
 *         isDerby:
 *           type: boolean
 *         isKnockoutRound:
 *           type: boolean
 *         isGroupFixture:
 *           type: boolean
 *         knockoutId:
 *           type: string
 *         groupId:
 *           type: string
 * 
 *     FixtureUpdate:
 *       type: object
 *       required:
 *         - fixtureId
 *       properties:
 *         fixtureId:
 *           type: string
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, in_progress, postponed, completed, cancelled]
 *         postponedReason:
 *           type: string
 *         rescheduledDate:
 *           type: string
 *           format: date-time
 * 
 *     FixtureResultUpdate:
 *       type: object
 *       required:
 *         - fixtureId
 *         - result
 *       properties:
 *         fixtureId:
 *           type: string
 *         result:
 *           type: string
 *           enum: [home_win, away_win, draw, home_walkover, away_walkover]
 *         statistics:
 *           type: object
 *           properties:
 *             home:
 *               $ref: '#/components/schemas/FixtureStat'
 *             away:
 *               $ref: '#/components/schemas/FixtureStat'
 * 
 *     TeamStandingsUpdate:
 *       type: object
 *       required:
 *         - teamId
 *       properties:
 *         teamId:
 *           type: string
 *         isGroup:
 *           type: boolean
 *         groupId:
 *           type: string
 *         played:
 *           type: number
 *         points:
 *           type: number
 *         disciplinaryPoints:
 *           type: number
 *         wins:
 *           type: number
 *         losses:
 *           type: number
 *         draws:
 *           type: number
 *         goalsFor:
 *           type: number
 *         goalsAgainst:
 *           type: number
 *         form:
 *           type: array
 *           items:
 *             type: string
 *             enum: [W, L, D]
 */

/**
 * @swagger
 * /competition/{competitionId}/status/general:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update competition status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatus'
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Status Updated"
 *                 data:
 *                   type: string
 *                   example: "ongoing"
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/info:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update competition information (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompetitionInfoUpdate'
 *     responses:
 *       200:
 *         description: Info updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Info Updated"
 *                 data:
 *                   $ref: '#/components/schemas/Competition'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/team/register:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Register team in competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamRegistration'
 *     responses:
 *       200:
 *         description: Team registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: string
 *                       squad:
 *                         type: array
 *       400:
 *         description: Invalid team or already registered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/team/unregister:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Unregister team from competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamRegistration'
 *     responses:
 *       200:
 *         description: Team unregistered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team Removed"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: string
 *                       squad:
 *                         type: array
 *       400:
 *         description: Invalid team or not registered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/team/squad:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Register team squad for competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamSquad'
 *     responses:
 *       200:
 *         description: Squad registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team Squad List Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: string
 *                       squad:
 *                         type: array
 *       400:
 *         description: Invalid squad size or data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or team not found
 * 
 * /competition/{competitionId}/league-table:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Create league table for competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: League table created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "League table created successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeagueStandings'
 *       400:
 *         description: League table already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/group:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Create competition group (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupInput'
 *     responses:
 *       200:
 *         description: Group created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Group created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/GroupTable'
 *       400:
 *         description: Invalid teams or group exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/knockout:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Create knockout round (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KnockoutRoundInput'
 *     responses:
 *       200:
 *         description: Knockout round created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Knockout Bracket Created"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnockoutRound'
 *       400:
 *         description: Invalid competition type or round exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/group/{groupName}:
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Delete competition group (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Group deleted successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupTable'
 *       400:
 *         description: Cannot delete group
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or group not found
 * 
 * /competition/{competitionId}/knockout/{roundName}:
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Delete knockout round (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: roundName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Round deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Knockout round deleted successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KnockoutRound'
 *       400:
 *         description: Cannot delete round
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or round not found
 * 
 * /competition/{competitionId}/team/standings:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update team standings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamStandingsUpdate'
 *     responses:
 *       200:
 *         description: Standings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team standings updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LeagueStandings'
 *       400:
 *         description: Invalid standings data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or team not found
 * 
 * /competition/{competitionId}/fixture:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Create competition fixture (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FixtureInput'
 *     responses:
 *       200:
 *         description: Fixture created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Fixture created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Fixture'
 *       400:
 *         description: Invalid fixture data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or teams not found
 * 
 * /competition/{competitionId}/fixture/update:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update fixture details (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FixtureUpdate'
 *     responses:
 *       200:
 *         description: Fixture updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Fixture Updated"
 *                 data:
 *                   $ref: '#/components/schemas/Fixture'
 *       400:
 *         description: Invalid update data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Fixture not found
 * 
 * /competition/{competitionId}/fixture/result:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update fixture result (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FixtureResultUpdate'
 *     responses:
 *       200:
 *         description: Result updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Fixture Result Updated"
 *                 data:
 *                   $ref: '#/components/schemas/Fixture'
 *       400:
 *         description: Invalid result data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Fixture not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CompetitionRulesUpdate:
 *       type: object
 *       properties:
 *         substitutions:
 *           type: object
 *           properties:
 *             allowed:
 *               type: boolean
 *             maximum:
 *               type: number
 *         extraTime:
 *           type: boolean
 *         penalties:
 *           type: boolean
 *         matchDuration:
 *           type: object
 *           properties:
 *             normal:
 *               type: number
 *             extraTime:
 *               type: number
 *         squadSize:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 * 
 *     CompetitionFormatUpdate:
 *       type: object
 *       properties:
 *         groupStage:
 *           type: object
 *           properties:
 *             numberOfGroups:
 *               type: number
 *             teamsPerGroup:
 *               type: number
 *             advancingPerGroup:
 *               type: number
 *         knockoutStage:
 *           type: object
 *           properties:
 *             hasTwoLegs:
 *               type: boolean
 *             awayGoalsRule:
 *               type: boolean
 *         leagueStage:
 *           type: object
 *           properties:
 *             matchesPerTeam:
 *               type: number
 *             pointsSystem:
 *               type: object
 *               properties:
 *                 win:
 *                   type: number
 *                 draw:
 *                   type: number
 *                 loss:
 *                   type: number
 * 
 *     AdditionalRule:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 * 
 *     RuleRemoval:
 *       type: object
 *       required:
 *         - title
 *         - lastUpdated
 *       properties:
 *         title:
 *           type: string
 *         lastUpdated:
 *           type: string
 *           format: date-time
 * 
 *     SponsorInput:
 *       type: object
 *       required:
 *         - name
 *         - tier
 *       properties:
 *         name:
 *           type: string
 *         logo:
 *           type: string
 *         tier:
 *           type: string
 *           enum: [main, official, partner]
 * 
 *     SponsorRemoval:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 * 
 *     AwardInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 * 
 *     AdminUpdate:
 *       type: object
 *       required:
 *         - admin
 *       properties:
 *         admin:
 *           type: string
 * 
 *     ActiveStatus:
 *       type: object
 *       required:
 *         - isActive
 *       properties:
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /competition/{competitionId}/rule:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update competition rules (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompetitionRulesUpdate'
 *     responses:
 *       200:
 *         description: Rules updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition rules updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CompetitionRulesUpdate'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/format:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Update competition format (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompetitionFormatUpdate'
 *     responses:
 *       200:
 *         description: Format updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Format Updated"
 *                 data:
 *                   $ref: '#/components/schemas/CompetitionFormatUpdate'
 *       400:
 *         description: Invalid format for competition type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/additional-rule:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Add additional rule (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdditionalRule'
 *     responses:
 *       200:
 *         description: Rule added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Rule Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdditionalRule'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Remove additional rule (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RuleRemoval'
 *     responses:
 *       200:
 *         description: Rule removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Rule Removed"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdditionalRule'
 *       400:
 *         description: Invalid rule
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or rule not found
 * 
 * /competition/{competitionId}/sponsor:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Add sponsor (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SponsorInput'
 *     responses:
 *       200:
 *         description: Sponsor added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Sponsor Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SponsorInput'
 *       400:
 *         description: Invalid sponsor data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Remove sponsor (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SponsorRemoval'
 *     responses:
 *       200:
 *         description: Sponsor removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Sponsor Removed"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SponsorInput'
 *       400:
 *         description: Invalid sponsor name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or sponsor not found
 * 
 * /competition/{competitionId}/award/player:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Add player award (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AwardInput'
 *     responses:
 *       200:
 *         description: Award added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Player Award Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       winner:
 *                         type: object
 *                         nullable: true
 *       400:
 *         description: Missing award name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Remove player award (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AwardInput'
 *     responses:
 *       200:
 *         description: Award removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Player Award Removed"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       winner:
 *                         type: object
 *                         nullable: true
 *       400:
 *         description: Invalid award name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or award not found
 * 
 * /competition/{competitionId}/award/team:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Add team award (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AwardInput'
 *     responses:
 *       200:
 *         description: Award added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team Award Added"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       winner:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Missing award name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Remove team award (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AwardInput'
 *     responses:
 *       200:
 *         description: Award removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Team Award Removed"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       winner:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Invalid award name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition or award not found
 * 
 * /competition/{competitionId}/admin:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Set competition admin (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdate'
 *     responses:
 *       200:
 *         description: Admin updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Admin Updated"
 *                 data:
 *                   type: string
 *       400:
 *         description: Invalid admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin or invalid permissions)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/status/active:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Set competition active status (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActiveStatus'
 *     responses:
 *       200:
 *         description: Active status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Status Updated"
 *                 data:
 *                   type: boolean
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}/feature:
 *   put:
 *     tags: [Competitions (Admin)]
 *     summary: Make competition featured (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Featured status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Featured Status Updated"
 *                 data:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 * 
 * /competition/{competitionId}:
 *   delete:
 *     tags: [Competitions (Admin)]
 *     summary: Delete competition (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Competition deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Competition Deleted"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Competition not found
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */