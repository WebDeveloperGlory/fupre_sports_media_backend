/**
 * @swagger
 * tags:
 *   - name: Football Team (Public)
 *     description: Public football team endpoints
 *   - name: Football Team (Admin)
 *     description: Football team management endpoints requiring authentication
 *   - name: Team Players
 *     description: Player management for football teams
 *   - name: Team Competitions
 *     description: Team competition participation
 *   - name: Team Statistics
 *     description: Football team statistics and analytics
 *   - name: Friendly Matches
 *     description: Friendly match requests and management
 *   - name: Team Management
 *     description: Team administration and leadership
 */

// ==================== TEAM CRUD OPERATIONS ==================== //

/**
 * @swagger
 * /football/team:
 *   get:
 *     summary: Get all football teams
 *     tags: [Football Team (Public)]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter teams by department
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter teams by academic year
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Set limit on number of returned team
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Change the page of the returned teams
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Teams Acquired"
 *               data:
 *                 teams:
 *                   - id: "651d2e09b1c23e4d8c9f87ab"
 *                     name: "Eagles FC"
 *                     shorthand: "EFC"
 *                     department: "Engineering"
 *                     year: "2024/2024"
 *                 pagination:
 *                   total: 15
 *                   page: 1
 *                   limit: 10
 *                   pages: 2
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team:
 *   post:
 *     summary: Create a new football team
 *     tags: [Football Team (Admin)]
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
 *                 example: "Eagles FC"
 *               shorthand:
 *                 type: string
 *                 example: "EFC"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               year:
 *                 type: string
 *                 example: "2024/2025"
 *     responses:
 *       200:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Created"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 name: "Eagles FC"
 *                 shorthand: "EFC"
 *                 department: "Engineering"
 *                 year: "2024/2025"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}:
 *   get:
 *     summary: Get details of a specific football team
 *     tags: [Football Team (Public)]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to retrieve
 *     responses:
 *       200:
 *         description: Team details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Acquired"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 name: "Eagles FC"
 *                 shorthand: "EFC"
 *                 department: "Engineering"
 *                 year: "2024/2025"
 *                 players: ["650d1f99a2f45b1a3c2e77bd", "650d1f99a2f45b1a3c2e77be"]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}:
 *   put:
 *     summary: Update details of a football team
 *     tags: [Football Team (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Eagles United"
 *               shorthand:
 *                 type: string
 *                 example: "EUFC"
 *               department:
 *                 type: string
 *                 example: "Computer Science"
 *               year:
 *                 type: string
 *                 example: "2024/2025"
 *               coaches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Head Coach"
 *                     role:
 *                       type: string
 *                       enum: ["head", "assistant", "goalkeeping", "fitness"]
 *                       example: "head"
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Updated"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 name: "Eagles United"
 *                 shorthand: "EUFC"
 *                 department: "Computer Science"
 *                 year: "2024/2025"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}:
 *   delete:
 *     summary: Delete a football team (Admin Only)
 *     tags: [Football Team (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to delete
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Deleted"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 name: "Eagles FC"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ==================== TEAM PLAYERS MANAGEMENT ==================== //

/**
 * @swagger
 * /football/team/{teamId}/players:
 *   get:
 *     summary: Get all players in a specific football team
 *     tags: [Team Players]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to get players for
 *     responses:
 *       200:
 *         description: Team players retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Players Acquired"
 *               data:
 *                 team: "Eagles FC"
 *                 players:
 *                   - id: "650d1f99a2f45b1a3c2e77bd"
 *                     name: "John Doe"
 *                     position: "ST"
 *                     number: 9
 *                   - id: "650d1f99a2f45b1a3c2e77be"
 *                     name: "James Smith"
 *                     position: "GK"
 *                     number: 1
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/players:
 *   post:
 *     summary: Add a player to a football team
 *     tags: [Team Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to add a player to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               department:
 *                 type: string
 *                 example: "Electrical/Electronics Engineering"
 *               position:
 *                 type: string
 *                 enum: ["CB", "LB", "RB", "WB", "GK", "CMF", "DMF", "AMF", "LW", "RW", "ST"]
 *                 example: "ST"
 *               number:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Player added to the team successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Added"
 *               data:
 *                 id: "650d1f99a2f45b1a3c2e77bd"
 *                 name: "John Doe"
 *                 position: "ST"
 *                 number: 10
 *                 team: "651d2e09b1c23e4d8c9f87ab"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/players/{playerId}:
 *   delete:
 *     summary: Remove a player from a football team
 *     tags: [Team Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player to remove
 *     responses:
 *       200:
 *         description: Player removed from team successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Removed"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ==================== TEAM COMPETITIONS ==================== //

/**
 * @swagger
 * /football/team/{teamId}/competitions:
 *   get:
 *     summary: Get competitions a team is participating in
 *     tags: [Team Competitions]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: Team competitions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Competitions Acquired"
 *               data:
 *                 team: "Eagles FC"
 *                 competitions:
 *                   - status: "accepted"
 *                     competition:
 *                       name: "University Cup"
 *                       sportType: "football"
 *                       format: "league"
 *                       status: "ongoing"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ==================== TEAM STATISTICS ==================== //

/**
 * @swagger
 * /football/team/{teamId}/form:
 *   get:
 *     summary: Get the last five match results of a team
 *     tags: [Team Statistics]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: Team form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Form Acquired"
 *               data: ["W", "L", "D", "W", "W"]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/team-statistics:
 *   get:
 *     summary: Get a team's statistics
 *     tags: [Team Statistics]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: Team statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Statistics Acquired"
 *               data:
 *                 team:
 *                   name: "Eagles FC"
 *                   shorthand: "EFC"
 *                   id: "651f1b29c45a1b3a3c4e8dcd"
 *                 stats:
 *                   played: 5
 *                   wins: 2
 *                   draws: 2
 *                   losses: 1
 *                   goalsScored: 12
 *                   goalsConceded: 7
 *                   cleanSheets: 2
 *                   shotsOnTarget: 27
 *                   shotsBlocked: 30
 *                   shotsOffTarget: 20
 *                   corners: 40
 *                   fouls: 73
 *                   yellowCards: 4
 *                   redCards: 2
 *                   homeRecord: 
 *                     played: 3
 *                     wins: 2
 *                     draws: 1
 *                     losses: 0
 *                   awayRecord:
 *                     played: 2
 *                     wins: 0
 *                     draws: 1
 *                     losses: 1
 *                 form: ["W", "L", "D", "W", "D"]
 *                 fixtures:
 *                   - id: "651f1b29c45a1b3a3c4e8dcd"
 *                     date: "2021-09-20T00:00:00.000Z"
 *                     opponent: "Lions FC"
 *                     isHome: true
 *                     result: "win"
 *                     score: "3-1"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/player-statistics:
 *   get:
 *     summary: Get a team's player statistics
 *     tags: [Team Statistics]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering statistics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering statistics (YYYY-MM-DD)
 *       - in: query
 *         name: competitionId
 *         schema:
 *           type: string
 *         description: ID of competition to filter statistics by
 *     responses:
 *       200:
 *         description: Team player statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Players Statistics Acquired"
 *               data:
 *                 - playerId: "650d1f99a2f45b1a3c2e77bc"
 *                   name: "John Doe"
 *                   number: 9
 *                   position: "ST"
 *                   teamType: "base"
 *                   appearances: 15
 *                   starts: 12
 *                   substitutions: 3
 *                   minutesPlayed: 1125
 *                   goals: 8
 *                   ownGoals: 0
 *                   assists: 5
 *                   shotsOnTarget: 24
 *                   shotsOffTarget: 18
 *                   corners: 3
 *                   offsides: 7
 *                   foulsCommitted: 12
 *                   foulsSuffered: 22
 *                   yellowCards: 2
 *                   redCards: 0
 *                   goalsPerMatch: 0.53
 *                   assistsPerMatch: 0.33
 *                   shotAccuracy: 57.1
 *                 - playerId: "650d1f99a2f45b1a3c2e77bd"
 *                   name: "James Smith"
 *                   number: 1
 *                   position: "GK"
 *                   teamType: "base"
 *                   appearances: 15
 *                   starts: 15
 *                   substitutions: 0
 *                   minutesPlayed: 1350
 *                   goals: 0
 *                   ownGoals: 0
 *                   assists: 1
 *                   cleanSheets: 6
 *                   goalsConceded: 12
 *                   saves: 42
 *                   penaltySaves: 1
 *                   goalsConcededPer90: 0.8
 *                   savePercentage: 77.8
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               code: "400"
 *               message: "Invalid Team"
 *       404:
 *         description: Team not found or has no players
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               code: "404"
 *               message: "Team Has No Players"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ==================== FRIENDLY MATCHES ==================== //

/**
 * @swagger
 * /football/team/{teamId}/friendly-requests:
 *   get:
 *     summary: Get friendly match requests for a football team
 *     tags: [Friendly Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     responses:
 *       200:
 *         description: Friendly requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Friendly Requests Retrieved"
 *               data:
 *                 - requestId: "652a3b8cf9e3457d8a2e67cd"
 *                   team: "Red Lions"
 *                   date: "2024-05-01T18:00:00Z"
 *                   location: "Main Stadium"
 *                   status: "pending"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/friendly-requests:
 *   post:
 *     summary: Send a friendly match request to another team
 *     tags: [Friendly Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team sending the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientTeamId:
 *                 type: string
 *                 example: "652a3b8cf9e3457d8a2e67cd"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-05-10T18:00:00Z"
 *               location:
 *                 type: string
 *                 example: "Main Stadium"
 *     responses:
 *       200:
 *         description: Friendly request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Friendly Request Sent Successfully"
 *               data:
 *                 requestId: "652a3b8cf9e3457d8a2e67cd"
 *                 team: "Red Lions"
 *                 date: "2024-05-10T18:00:00Z"
 *                 location: "Main Stadium"
 *                 status: "pending"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/friendly-requests/{requestId}/status:
 *   put:
 *     summary: Update the status of a friendly match request
 *     tags: [Friendly Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the friendly request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["accepted", "rejected"]
 *                 example: "accepted"
 *     responses:
 *       200:
 *         description: Friendly request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Request Status Updated"
 *               data:
 *                 requestId: "652a3b8cf9e3457d8a2e67cd"
 *                 team: "Red Lions"
 *                 status: "accepted"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ==================== TEAM MANAGEMENT ==================== //

/**
 * @swagger
 * /football/team/{teamId}/captain:
 *   put:
 *     summary: Change the captain of a football team
 *     tags: [Team Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *                 example: "650d1f99a2f45b1a3c2e77bd"
 *     responses:
 *       200:
 *         description: Team captain updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team Captain Updated"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 captain: "650d1f99a2f45b1a3c2e77bd"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/team/{teamId}/admin:
 *   put:
 *     summary: Update the admin of a football team
 *     tags: [Team Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 example: "651d2e09b1c23e4d8c9f87ab"
 *     responses:
 *       200:
 *         description: Team admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Admin Updated"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 admin: "651d2e09b1c23e4d8c9f87ab"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         shorthand:
 *           type: string
 *         department:
 *           type: string
 *         year:
 *           type: string
 *         players:
 *           type: array
 *           items:
 *             type: string
 *         coaches:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["head", "assistant", "goalkeeping", "fitness"]
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         position:
 *           type: string
 *           enum: ["CB", "LB", "RB", "WB", "GK", "CMF", "DMF", "AMF", "LW", "RW", "ST"]
 *         number:
 *           type: number
 *         team:
 *           type: string
 * 
 *     PlayerStatistics:
 *       type: object
 *       properties:
 *         playerId:
 *           type: string
 *         name:
 *           type: string
 *         number:
 *           type: integer
 *         position:
 *           type: string
 *         teamType:
 *           type: string
 *         appearances:
 *           type: integer
 *         starts:
 *           type: integer
 *         substitutions:
 *           type: integer
 *         minutesPlayed:
 *           type: integer
 *         goals:
 *           type: integer
 *         ownGoals:
 *           type: integer
 *         assists:
 *           type: integer
 *         shotsOnTarget:
 *           type: integer
 *         shotsOffTarget:
 *           type: integer
 *         corners:
 *           type: integer
 *         offsides:
 *           type: integer
 *         foulsCommitted:
 *           type: integer
 *         foulsSuffered:
 *           type: integer
 *         yellowCards:
 *           type: integer
 *         redCards:
 *           type: integer
 *         cleanSheets:
 *           type: integer
 *         goalsConceded:
 *           type: integer
 *         saves:
 *           type: integer
 *         penaltySaves:
 *           type: integer
 *         goalsPerMatch:
 *           type: number
 *         assistsPerMatch:
 *           type: number
 *         shotAccuracy:
 *           type: number
 *         goalsConcededPer90:
 *           type: number
 *         savePercentage:
 *           type: number
 */

/**
 * @swagger
 * components:
 *   responses:
 *     TeamNotFoundError:
 *       description: Team not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *           example:
 *             code: "04"
 *             message: "Team not found"
 *     PlayerNotFoundError:
 *       description: Player not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *           example:
 *             code: "05"
 *             message: "Player not found"
 */