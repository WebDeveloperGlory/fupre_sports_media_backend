/**
 * @swagger
 * tags:
 *   name: FootballCompetition
 *   description: API for managing football competitions
 *
 * /football/competition:
 *   get:
 *     summary: Retrieve all football competitions
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description: Filter competitions by status
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [football, chess, basketball, volleyball]
 *         description: Filter competitions by sport type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Competitions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Competitions Acquired"
 *               data:
 *                 competitions: [...]
 *                 pagination:
 *                   total: 50
 *                   page: 1
 *                   limit: 10
 *                   pages: 5
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   post:
 *     summary: Create a new competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premier League"
 *               sportType:
 *                 type: string
 *                 enum: [football, chess, basketball, volleyball]
 *                 example: "football"
 *               description:
 *                 type: string
 *                 example: "Annual university football league"
 *               rounds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Group Stage", "Quarter Finals"]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-15T00:00:00Z"
 *               format:
 *                 type: string
 *                 enum: [knockout, hybrid, league]
 *                 example: "league"
 *               rules:
 *                 type: object
 *                 properties:
 *                   substitutions:
 *                     type: object
 *                     properties:
 *                       allowed:
 *                         type: boolean
 *                         example: true
 *                       maximum:
 *                         type: number
 *                         example: 5
 *                   extraTime:
 *                     type: boolean
 *                     example: false
 *                   penalties:
 *                     type: boolean
 *                     example: false
 *     responses:
 *       200:
 *         description: Competition created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 name: "Premier League"
 *                 sportType: "football"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}:
 *   get:
 *     summary: Get details of a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition to retrieve
 *     responses:
 *       200:
 *         description: Competition details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Acquired"
 *               data: {...}
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   put:
 *     summary: Update competition details
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated League Name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               rounds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Group Stage", "Semi Finals"]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-10-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-20T00:00:00Z"
 *     responses:
 *       200:
 *         description: Competition updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Updated"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 name: "Updated League Name"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   delete:
 *     summary: Delete a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition to delete
 *     responses:
 *       200:
 *         description: Competition deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Deleted"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 name: "Premier League"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/status:
 *   put:
 *     summary: Update competition status
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *                 example: "ongoing"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Status Updated"
 *               data:
 *                 status: "ongoing"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/fixtures:
 *   get:
 *     summary: Get fixtures of a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Fixtures Acquired"
 *               data:
 *                 fixtures: [...]
 *                 pagination: {...}
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   post:
 *     summary: Add a fixture to a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeTeam:
 *                 type: string
 *                 example: "651a1b2c3d4e5f6g7h8i9j0l"
 *               awayTeam:
 *                 type: string
 *                 example: "651a1b2c3d4e5f6g7h8i9j0m"
 *               matchWeek:
 *                 type: number
 *                 example: 1
 *               referee:
 *                 type: string
 *                 example: "651a1b2c3d4e5f6g7h8i9j0n"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-01T15:00:00Z"
 *               stadium:
 *                 type: string
 *                 example: "Main Stadium"
 *     responses:
 *       200:
 *         description: Fixture created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0o"
 *                 homeTeam: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 awayTeam: "651a1b2c3d4e5f6g7h8i9j0m"
 *                 type: "competition"
 *                 competition: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 status: "pending"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/fixtures/{fixtureId}:
 *   put:
 *     summary: Update a competition fixture result
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture
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
 *                     type: number
 *                     example: 2
 *                   awayScore:
 *                     type: number
 *                     example: 1
 *                   homePenalty:
 *                     type: number
 *                     example: 0
 *                   awayPenalty:
 *                     type: number
 *                     example: 0
 *               statistics:
 *                 type: object
 *                 properties:
 *                   home:
 *                     type: object
 *                     properties:
 *                       shots:
 *                         type: number
 *                         example: 10
 *                       shotsOnTarget:
 *                         type: number
 *                         example: 5
 *                       possession:
 *                         type: number
 *                         example: 55
 *                       fouls:
 *                         type: number
 *                         example: 12
 *                       yellowCards:
 *                         type: number
 *                         example: 2
 *                       redCards:
 *                         type: number
 *                         example: 0
 *                   away:
 *                     type: object
 *                     properties:
 *                       shots:
 *                         type: number
 *                         example: 8
 *                       shotsOnTarget:
 *                         type: number
 *                         example: 3
 *                       possession:
 *                         type: number
 *                         example: 45
 *                       fouls:
 *                         type: number
 *                         example: 15
 *                       yellowCards:
 *                         type: number
 *                         example: 3
 *                       redCards:
 *                         type: number
 *                         example: 1
 *               matchEvents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     eventType:
 *                       type: string
 *                       enum: [goal, ownGoal, assist, yellowCard, redCard]
 *                       example: "goal"
 *                     player:
 *                       type: string
 *                       example: "651a1b2c3d4e5f6g7h8i9j0p"
 *                     team:
 *                       type: string
 *                       example: "651a1b2c3d4e5f6g7h8i9j0l"
 *                     time:
 *                       type: number
 *                       example: 34
 *               homeSubs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0q", "651a1b2c3d4e5f6g7h8i9j0r"]
 *               awaySubs:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0s", "651a1b2c3d4e5f6g7h8i9j0t"]
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Updated And Competition Stats Updated"
 *               data:
 *                 refreshedFixture:
 *                   _id: "651a1b2c3d4e5f6g7h8i9j0o"
 *                   status: "completed"
 *                   result:
 *                     homeScore: 2
 *                     awayScore: 1
 *                 refreshedCompetition:
 *                   stats:
 *                     totalGoals: 3
 *                     homeWinsPercentage: 100
 *                     awayWinsPercentage: 0
 *                     drawsPercentage: 0
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   delete:
 *     summary: Delete a competition fixture
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture
 *     responses:
 *       200:
 *         description: Fixture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Deleted"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0o"
 *                 homeTeam: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 awayTeam: "651a1b2c3d4e5f6g7h8i9j0m"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/teams:
 *   get:
 *     summary: Get teams participating in a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Teams Acquired"
 *               data: [...]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/teams/invite:
 *   put:
 *     summary: Invite teams to a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0k", "651a1b2c3d4e5f6g7h8i9j0l"]
 *     responses:
 *       200:
 *         description: Teams invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Invitations Sent Successfully"
 *               data:
 *                 validUpdates: ["651a1b2c3d4e5f6g7h8i9j0k"]
 *                 invalidUpdates: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/teams/add:
 *   put:
 *     summary: Add teams to a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0k", "651a1b2c3d4e5f6g7h8i9j0l"]
 *     responses:
 *       200:
 *         description: Teams added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Teams Added Successfully"
 *               data:
 *                 refreshedCompetition:
 *                   teams:
 *                     - team: "651a1b2c3d4e5f6g7h8i9j0k"
 *                       squadList: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/teams/{teamId}/remove:
 *   put:
 *     summary: Remove a team from a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to remove
 *     responses:
 *       200:
 *         description: Team removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Removed"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/teams/{teamId}/squad:
 *   get:
 *     summary: Get squad list of a team in a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: Squad list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Teams Squad Acquired"
 *               data: {...}
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   put:
 *     summary: Register a team's squad list for a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               players:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0m", "651a1b2c3d4e5f6g7h8i9j0n"]
 *     responses:
 *       200:
 *         description: Squad list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team squad list updated successfully"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/initialize-table:
 *   put:
 *     summary: Initialize league table for a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     responses:
 *       200:
 *         description: League table initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "League Table Initialized"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 leagueTable:
 *                   - team: "651a1b2c3d4e5f6g7h8i9j0l"
 *                     played: 0
 *                     points: 0
 *                     wins: 0
 *                     losses: 0
 *                     draws: 0
 *                     goalsFor: 0
 *                     goalsAgainst: 0
 *                     goalDifference: 0
 *                     form: []
 *                     position: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/standings:
 *   get:
 *     summary: Get standings of a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *     responses:
 *       200:
 *         description: Standings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "League Table Acquired"
 *               data: [...]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/knockout:
 *   get:
 *     summary: Get knockout rounds of a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *     responses:
 *       200:
 *         description: Knockout rounds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Knockout Rounds Acquired"
 *               data: [...]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   put:
 *     summary: Add knockout phases to a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Round of 16"
 *               fixtureFormat:
 *                 type: string
 *                 enum: [single_leg, two_legs, best_of_three]
 *                 example: "single_leg"
 *     responses:
 *       200:
 *         description: Knockout phase added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Knockout Rounds Added"
 *               data:
 *                 - name: "Round of 16"
 *                   fixtureFormat: "single_leg"
 *                   fixtures: []
 *                   completed: false
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/knockout/fixtures/{fixtureId}/add:
 *   put:
 *     summary: Add fixtures to a knockout phase
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture to add
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roundName:
 *                 type: string
 *                 example: "Quarter Finals"
 *     responses:
 *       200:
 *         description: Fixture added to knockout phase successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Added To Knockout"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 knockoutRounds:
 *                   - name: "Quarter Finals"
 *                     fixtures: ["651a1b2c3d4e5f6g7h8i9j0l"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/knockout/fixtures/{fixtureId}/remove:
 *   put:
 *     summary: Remove fixture from knockout phase
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roundName:
 *                 type: string
 *                 example: "Quarter Finals"
 *     responses:
 *       200:
 *         description: Fixture removed from knockout phase successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Removed From Knockout"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 knockoutRounds:
 *                   - name: "Quarter Finals"
 *                     fixtures: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/groups:
 *   get:
 *     summary: Get all groups in a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Groups Acquired"
 *               data: [...]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   put:
 *     summary: Add group stage to a competition
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Group A"
 *     responses:
 *       200:
 *         description: Group stage added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Group Stage Added"
 *               data:
 *                 - name: "Group A"
 *                   fixtures: []
 *                   standings: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/competition/{competitionId}/groups/{groupName}:
 *   get:
 *     summary: Get details of a specific group in a football competition
 *     tags: [FootballCompetition]
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the competition
 *       - in: path
 *         name: groupName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the group
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Single Group Acquired"
 *               data: {...}
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/groups/fixtures/{fixtureId}/add:
 *   put:
 *     summary: Add fixtures to a group stage
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture to add
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "Group A"
 *     responses:
 *       200:
 *         description: Fixture added to group stage successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Added To Group Stage"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 groupStage:
 *                   - name: "Group A"
 *                     fixtures: ["651a1b2c3d4e5f6g7h8i9j0l"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/groups/fixtures/{fixtureId}/remove:
 *   put:
 *     summary: Remove fixture from group stage
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the fixture to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "Group A"
 *     responses:
 *       200:
 *         description: Fixture removed from group stage successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Removed From Group Stage"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 groupStage:
 *                   - name: "Group A"
 *                     fixtures: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/groups/teams/{teamId}/add:
 *   put:
 *     summary: Add teams to a group stage
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to add
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "Group A"
 *     responses:
 *       200:
 *         description: Team added to group stage successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Added To Group Stage"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 groupStage:
 *                   - name: "Group A"
 *                     standings:
 *                       - team: "651a1b2c3d4e5f6g7h8i9j0m"
 *                         played: 0
 *                         points: 0
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/groups/teams/{teamId}/remove:
 *   put:
 *     summary: Remove team from group stage
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the team to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: "Group A"
 *     responses:
 *       200:
 *         description: Team removed from group stage successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Removed From Group Stage"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 groupStage:
 *                   - name: "Group A"
 *                     standings: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/feature:
 *   put:
 *     summary: Mark competition as featured
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     responses:
 *       200:
 *         description: Competition marked as featured successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Competition Featured"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 isFeatured: true
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 * /football/competition/{competitionId}/admin:
 *   put:
 *     summary: Set competition admin
 *     tags: [FootballCompetition]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: competitionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the competition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 example: "651a1b2c3d4e5f6g7h8i9j0n"
 *     responses:
 *       200:
 *         description: Competition admin set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Admin Updated"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 admin: "651a1b2c3d4e5f6g7h8i9j0n"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */