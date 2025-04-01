/**
 * @swagger
 * tags:
 *   name: Team of the Season (TOTS)
 *   description: API for managing Team of the Season voting sessions and results
 */

/**
 * @swagger
 * /football/tots:
 *   get:
 *     summary: Get all TOTS sessions
 *     tags: [Team of the Season (TOTS)]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Filter by year
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of TOTS sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Sessions Acquired"
 *               data:
 *                 sessions:
 *                   - _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                     year: 2023
 *                     competition: 
 *                       _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                       name: "Premier League"
 *                     isActive: true
 *                     startDate: "2023-05-01T00:00:00Z"
 *                     endDate: "2023-05-31T00:00:00Z"
 *                 pagination:
 *                   total: 1
 *                   page: 1
 *                   limit: 10
 *                   pages: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}:
 *   get:
 *     summary: Get a single TOTS session
 *     tags: [Team of the Season (TOTS)]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     responses:
 *       200:
 *         description: TOTS session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Session Acquired"
 *               data:
 *                 session:
 *                   _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                   year: 2023
 *                   competition:
 *                     _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                     name: "Premier League"
 *                   isActive: true
 *                   selectedFormation: "4-3-3"
 *                   elegiblePlayers:
 *                     GK:
 *                       - _id: "651a1b2c3d4e5f6g7h8i9j0m"
 *                         name: "John Doe"
 *                         position: "GK"
 *                         number: 1
 *                 totalVotes: 150
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/players:
 *   get:
 *     summary: Get players eligible for a TOTS session
 *     tags: [Team of the Season (TOTS)]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [GK, DEF, MID, FWD]
 *         description: Filter by player position
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Filter by team name
 *     responses:
 *       200:
 *         description: List of eligible players
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Players Acquired"
 *               data:
 *                 GK:
 *                   - _id: "651a1b2c3d4e5f6g7h8i9j0m"
 *                     name: "John Doe"
 *                     position: "GK"
 *                     number: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/result:
 *   get:
 *     summary: Get final voting results for a TOTS session
 *     tags: [Team of the Season (TOTS)]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     responses:
 *       200:
 *         description: Final voting results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Results Acquired"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0n"
 *                 session: 
 *                   _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                   year: 2023
 *                   competition:
 *                     _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                     name: "Premier League"
 *                 finalWinner:
 *                   formation: "4-3-3"
 *                   GK:
 *                     _id: "651a1b2c3d4e5f6g7h8i9j0m"
 *                     name: "John Doe"
 *                     position: "GK"
 *                     number: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/vote/regular:
 *   get:
 *     summary: Get a user's vote for a TOTS session
 *     tags: [Team of the Season (TOTS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     responses:
 *       200:
 *         description: User's vote details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Vote Acquired"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0o"
 *                 session:
 *                   _id: "651a1b2c3d4e5f6g7h8i9j0k"
 *                   year: 2023
 *                   competition:
 *                     _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                     name: "Premier League"
 *                 selectedFormation: "4-3-3"
 *                 selectedPlayers:
 *                   GK:
 *                     _id: "651a1b2c3d4e5f6g7h8i9j0m"
 *                     name: "John Doe"
 *                     position: "GK"
 *                     number: 1
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/vote/regular:
 *   post:
 *     summary: Submit a vote for a TOTS session
 *     tags: [Team of the Season (TOTS)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedFormation:
 *                 type: string
 *                 example: "4-3-3"
 *               selectedPlayers:
 *                 type: object
 *                 properties:
 *                   GK:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0m"]
 *                   DEF:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0p", "651a1b2c3d4e5f6g7h8i9j0q"]
 *                   MID:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0r", "651a1b2c3d4e5f6g7h8i9j0s"]
 *                   FWD:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0t"]
 *     responses:
 *       200:
 *         description: Vote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Vote Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0o"
 *                 selectedFormation: "4-3-3"
 *                 selectedPlayers:
 *                   GK: ["651a1b2c3d4e5f6g7h8i9j0m"]
 *                   DEF: ["651a1b2c3d4e5f6g7h8i9j0p", "651a1b2c3d4e5f6g7h8i9j0q"]
 *                   MID: ["651a1b2c3d4e5f6g7h8i9j0r", "651a1b2c3d4e5f6g7h8i9j0s"]
 *                   FWD: ["651a1b2c3d4e5f6g7h8i9j0t"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TOTSSession:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         year:
 *           type: number
 *         competition:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         isActive:
 *           type: boolean
 *         selectedFormation:
 *           type: string
 *         elegiblePlayers:
 *           type: object
 *           properties:
 *             GK:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             DEF:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             MID:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             FWD:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 * 
 *     TOTSResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         session:
 *           $ref: "#/components/schemas/TOTSSession"
 *         winningFormation:
 *           type: string
 *         winningFormationPercentage:
 *           type: number
 *         finalWinner:
 *           type: object
 *           properties:
 *             formation:
 *               type: string
 *             GK:
 *               $ref: "#/components/schemas/Player"
 *             DEF:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             MID:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             FWD:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 * 
 *     TOTSVote:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         session:
 *           $ref: "#/components/schemas/TOTSSession"
 *         selectedFormation:
 *           type: string
 *         selectedPlayers:
 *           type: object
 *           properties:
 *             GK:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             DEF:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             MID:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *             FWD:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Player"
 *         submittedAt:
 *           type: string
 *           format: date-time
 * 
 *     Player:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         position:
 *           type: string
 *         number:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Team of the Season (Admin)
 *   description: API for managing Team of the Season voting sessions (Admin only)
 */

/**
 * @swagger
 * /football/tots:
 *   post:
 *     summary: Create a new TOTS session
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: number
 *                 example: 2023
 *                 description: Year of the season
 *               competition:
 *                 type: string
 *                 example: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 description: ID of the competition
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the session is active
 *               showVoteCount:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to show vote counts
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-01T00:00:00Z"
 *                 description: Start date of voting
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-05-31T00:00:00Z"
 *                 description: End date of voting
 *               adminVoteWeight:
 *                 type: number
 *                 default: 10
 *                 description: Weight of admin votes
 *     responses:
 *       200:
 *         description: TOTS session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "TOTS Poll Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 year: 2023
 *                 competition: "651a1b2c3d4e5f6g7h8i9j0k"
 *                 isActive: true
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin or headMediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/players:
 *   post:
 *     summary: Add players to a TOTS session
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerArray:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0m", "651a1b2c3d4e5f6g7h8i9j0n"]
 *                 description: Array of player IDs to add
 *     responses:
 *       200:
 *         description: Players added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Players Added to Session"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 elegiblePlayers:
 *                   GK: ["651a1b2c3d4e5f6g7h8i9j0m"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin or headMediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/players:
 *   delete:
 *     summary: Remove players from a TOTS session
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerArray:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["651a1b2c3d4e5f6g7h8i9j0m", "651a1b2c3d4e5f6g7h8i9j0n"]
 *                 description: Array of player IDs to remove
 *     responses:
 *       200:
 *         description: Players removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Players Removed from Session"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 elegiblePlayers:
 *                   GK: []
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin or headMediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/toggle:
 *   put:
 *     summary: Toggle voting status for a TOTS session
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     responses:
 *       200:
 *         description: Voting status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Session Status Updated"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0l"
 *                 isActive: false
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin or headMediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/vote/admin:
 *   post:
 *     summary: Submit an admin vote for a TOTS session
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedFormation:
 *                 type: string
 *                 example: "4-3-3"
 *                 description: Selected formation
 *               selectedPlayers:
 *                 type: object
 *                 properties:
 *                   GK:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0m"]
 *                     description: Selected goalkeepers (exactly 1)
 *                   DEF:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0n", "651a1b2c3d4e5f6g7h8i9j0o"]
 *                     description: Selected defenders (3-5)
 *                   MID:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0p", "651a1b2c3d4e5f6g7h8i9j0q"]
 *                     description: Selected midfielders (2-5)
 *                   FWD:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["651a1b2c3d4e5f6g7h8i9j0r"]
 *                     description: Selected forwards (1-3)
 *     responses:
 *       200:
 *         description: Admin vote submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Admin Vote Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0s"
 *                 selectedFormation: "4-3-3"
 *                 selectedPlayers:
 *                   GK: ["651a1b2c3d4e5f6g7h8i9j0m"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin, headMediaAdmin, or mediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/tots/{sessionId}/finalize:
 *   post:
 *     summary: Finalize and calculate TOTS voting results
 *     tags: [Team of the Season (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the TOTS session
 *     responses:
 *       200:
 *         description: Results calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Result Created"
 *               data:
 *                 _id: "651a1b2c3d4e5f6g7h8i9j0t"
 *                 winningFormation: "4-3-3"
 *                 finalWinner:
 *                   GK: "651a1b2c3d4e5f6g7h8i9j0m"
 *                   DEF: ["651a1b2c3d4e5f6g7h8i9j0n"]
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (requires superAdmin or headMediaAdmin role)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TOTSAdminSession:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         year:
 *           type: number
 *         competition:
 *           type: string
 *         isActive:
 *           type: boolean
 *         showVoteCount:
 *           type: boolean
 *         selectedFormation:
 *           type: string
 *         elegiblePlayers:
 *           type: object
 *           properties:
 *             GK:
 *               type: array
 *               items:
 *                 type: string
 *             DEF:
 *               type: array
 *               items:
 *                 type: string
 *             MID:
 *               type: array
 *               items:
 *                 type: string
 *             FWD:
 *               type: array
 *               items:
 *                 type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         adminVoteWeight:
 *           type: number
 * 
 *     TOTSAdminVote:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         session:
 *           type: string
 *         selectedFormation:
 *           type: string
 *         selectedPlayers:
 *           type: object
 *           properties:
 *             GK:
 *               type: array
 *               items:
 *                 type: string
 *             DEF:
 *               type: array
 *               items:
 *                 type: string
 *             MID:
 *               type: array
 *               items:
 *                 type: string
 *             FWD:
 *               type: array
 *               items:
 *                 type: string
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         weight:
 *           type: number
 * 
 *     TOTSAdminResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         session:
 *           type: string
 *         winningFormation:
 *           type: string
 *         winningFormationPercentage:
 *           type: number
 *         finalWinner:
 *           type: object
 *           properties:
 *             GK:
 *               type: string
 *             DEF:
 *               type: array
 *               items:
 *                 type: string
 *             MID:
 *               type: array
 *               items:
 *                 type: string
 *             FWD:
 *               type: array
 *               items:
 *                 type: string
 *         votersChoice:
 *           type: object
 *           properties:
 *             formation:
 *               type: string
 *             GK:
 *               type: string
 *             DEF:
 *               type: array
 *               items:
 *                 type: string
 *             MID:
 *               type: array
 *               items:
 *                 type: string
 *             FWD:
 *               type: array
 *               items:
 *                 type: string
 *         adminChoice:
 *           type: object
 *           properties:
 *             formation:
 *               type: string
 *             GK:
 *               type: string
 *             DEF:
 *               type: array
 *               items:
 *                 type: string
 *             MID:
 *               type: array
 *               items:
 *                 type: string
 *             FWD:
 *               type: array
 *               items:
 *                 type: string
 */