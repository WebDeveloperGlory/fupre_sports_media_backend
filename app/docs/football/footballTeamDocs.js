/**
 * @swagger
 * tags:
 *   name: FootballTeam
 *   description: API for managing football teams
 *
 * /football/team:
 *   get:
 *     summary: Get all football teams
 *     tags: [FootballTeam]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter teams by department
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: ["100", "200", "300", "400", "500", "General"]
 *         description: Filter teams by academic level
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
 *                     level: "300"
 *                 pagination:
 *                   total: 15
 *                   page: 1
 *                   limit: 10
 *                   pages: 2
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   post:
 *     summary: Create a new football team
 *     tags: [FootballTeam]
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
 *               level:
 *                 type: string
 *                 enum: ["100", "200", "300", "400", "500", "General"]
 *                 example: "300"
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
 *                 level: "300"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/team/{teamId}:
 *   get:
 *     summary: Get details of a specific football team
 *     tags: [FootballTeam]
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
 *                 level: "300"
 *                 players: ["650d1f99a2f45b1a3c2e77bd", "650d1f99a2f45b1a3c2e77be"]
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   put:
 *     summary: Update details of a football team
 *     tags: [FootballTeam]
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
 *               level:
 *                 type: string
 *                 enum: ["100", "200", "300", "400", "500", "General"]
 *                 example: "400"
 *               coach:
 *                 type: string
 *                 example: "Head Coach"
 *               assistantCoach:
 *                 type: string
 *                 example: "Assistant Coach"
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
 *                 level: "400"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 * 
 *   delete:
 *     summary: Delete a football team (Admin Only)
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/players:
 *   get:
 *     summary: Get all players in a specific football team
 *     tags: [FootballTeam]
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
 * 
 *   post:
 *     summary: Add a player to a football team
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/players/{playerId}:
 *   delete:
 *     summary: Remove a player from a football team
 *     tags: [FootballTeam]
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
 * 
 * /football/team/{teamId}/players/{playerId}/transfer:
 *   put:
 *     summary: Transfer or loan a player to another team
 *     tags: [FootballTeam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player's current team
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player being transferred or loaned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["loaned", "transferred"]
 *                 example: "loaned"
 *               fromTeam:
 *                 type: string
 *                 example: "650d1f99a2f45b1a3c2e77bd"
 *               toTeam:
 *                 type: string
 *                 example: "652a3b8cf9e3457d8a2e67cd"
 *               transferDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-01T15:00:00Z"
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-01T15:00:00Z"
 *     responses:
 *       200:
 *         description: Player transfer/loan details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Transfer/Loan Details Updated"
 *               data:
 *                 id: "651d2e09b1c23e4d8c9f87ab"
 *                 status: "loaned"
 *                 fromTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 toTeam: "652a3b8cf9e3457d8a2e67cd"
 *                 transferDate: "2024-04-01T15:00:00Z"
 *                 returnDate: "2024-06-01T15:00:00Z"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/team/{teamId}/competitions:
 *   get:
 *     summary: Get competitions a team is participating in
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/form:
 *   get:
 *     summary: Get the last five match results of a team
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/team-statistics:
 *   get:
 *     summary: Get a team's statistics
 *     tags: [FootballTeam]
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
 *                      name: "Eagles FC"
 *                      shorthand: "EFC"
 *                      id: "651f1b29c45a1b3a3c4e8dcd"
 *                 stats:
 *                      played: 5
 *                      wins: 2
 *                      draws: 2
 *                      losses: 1
 *                      goalsScored: 12
 *                      goalsConceded: 7
 *                      cleanSheets: 2
 *                      shotsOnTarget: 27
 *                      shotsBlocked: 30
 *                      shotsOffTarget: 20
 *                      corners: 40
 *                      fouls: 73
 *                      yellowCards: 4
 *                      redCards: 2
 *                      homeRecord: { played: 3, wins: 2, draws: 1, losses: 0 }
 *                      awayRecord: { played: 2, wins: 0, draws: 1, losses: 1 }
 *                 form:
 *                      - "W"
 *                      - "L"
 *                      - "D"
 *                      - "W"
 *                      - "D"
 *                 fixtures:
 *                      - id: "651f1b29c45a1b3a3c4e8dcd"
 *                        date: "2021-09-20T00:00:00.000Z"
 *                        opponent: "Lions FC"
 *                        isHome: true
 *                        result: "win"
 *                        score: "3-1"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/team/{teamId}/player-statistics:
 *   get:
 *     summary: Get a team's player statistics
 *     tags: [FootballTeam]
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
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/team/{teamId}/friendly-requests:
 *   get:
 *     summary: Get friendly match requests for a football team
 *     tags: [FootballTeam]
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
 * 
 *   post:
 *     summary: Send a friendly match request to another team
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/friendly-requests/{requestId}/status:
 *   put:
 *     summary: Update the status of a friendly match request
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/captain:
 *   put:
 *     summary: Change the captain of a football team
 *     tags: [FootballTeam]
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
 *
 * /football/team/{teamId}/admin:
 *   put:
 *     summary: Update the admin of a football team
 *     tags: [FootballTeam]
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