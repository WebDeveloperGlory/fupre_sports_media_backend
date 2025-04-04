/**
 * @swagger
 * tags:
 *   - name: Football Player (Public)
 *     description: Public football player endpoints
 *   - name: Football Player (Admin)
 *     description: Football player management endpoints requiring authentication
 */

// ### Public Routes (No Authentication Required) ### //

/**
 * @swagger
 * /football/player/{playerId}:
 *   get:
 *     summary: Get details of a football player
 *     tags: [Football Player (Public)]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player to retrieve
 *     responses:
 *       200:
 *         description: Player details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player details retrieved"
 *               data:
 *                 _id: "650d1f99a2f45b1a3c2e77bc"
 *                 name: "John Doe"
 *                 department: "Electrical Engineering"
 *                 entryYear: 2023
 *                 position: "ST"
 *                 number: 9
 *                 birthDate: "2000-05-15T00:00:00.000Z"
 *                 baseTeam:
 *                   _id: "65a1b2c3d4e5f6g7h8i9j10"
 *                   name: "Electrical Engineering (2023/2024)"
 *                   type: "base"
 *                 departmentTeam:
 *                   _id: "65a1b2c3d4e5f6g7h8i9j11"
 *                   name: "Electrical Engineering Team"
 *                   type: "department"
 *                 clubTeam:
 *                   _id: "65a1b2c3d4e5f6g7h8i9j12"
 *                   name: "Thunder FC"
 *                   type: "club"
 *                 schoolTeam:
 *                   _id: "65a1b2c3d4e5f6g7h8i9j13"
 *                   name: "University All-Stars"
 *                   type: "school"
 *                 clubStatus: "active"
 *                 transferDetails: null
 *                 stats:
 *                   careerTotals:
 *                     goals: 15
 *                     assists: 8
 *                     yellowCards: 3
 *                     redCards: 0
 *                     appearances: 20
 *                     cleanSheets: 5
 *                     minutesPlayed: 1800
 *                   byTeam:
 *                     base:
 *                       friendly: []
 *                       competitive: []
 *                       totals:
 *                         season: "2023/2024"
 *                         goals: 2
 *                         assists: 1
 *                         appearances: 5
 *                         minutesPlayed: 450
 *                     department:
 *                       friendly:
 *                         - season: "2023/2024"
 *                           goals: 3
 *                           assists: 2
 *                           appearances: 4
 *                           minutesPlayed: 360
 *                       competitive: []
 *                       totals:
 *                         season: "2023/2024"
 *                         goals: 3
 *                         assists: 2
 *                         appearances: 4
 *                         minutesPlayed: 360
 *                     club:
 *                       friendly:
 *                         - season: "2023/2024"
 *                           goals: 5
 *                           assists: 3
 *                           appearances: 5
 *                           minutesPlayed: 450
 *                       competitive:
 *                         - season: "2023/2024"
 *                           goals: 5
 *                           assists: 2
 *                           appearances: 6
 *                           minutesPlayed: 540
 *                       totals:
 *                         season: "2023/2024"
 *                         goals: 10
 *                         assists: 5
 *                         appearances: 11
 *                         minutesPlayed: 990
 *                   byCompetition:
 *                     - competition:
 *                         _id: "65a1b2c3d4e5f6g7h8i9j14"
 *                         name: "Inter-Department League"
 *                       season: "2023/2024"
 *                       stats:
 *                         goals: 7
 *                         assists: 4
 *                         appearances: 8
 *                         minutesPlayed: 720
 *                 createdAt: "2023-09-01T10:30:00.000Z"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       404:
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               code: "404"
 *               message: "Player not found with ID 650d1f99a2f45b1a3c2e77bc"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ### Admin Routes (Require Authentication) ### //

/**
 * @swagger
 * /football/player:
 *   post:
 *     summary: Create a new football player
 *     tags: [Football Player (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: "650d1f99a2f45b1a3c2e77bd"
 *                 description: The ID of the team the players belong to
 *               teamType:
 *                 type: string
 *                 example: "baseTeam"
 *                 enum: [baseTeam, departmentTeam, clubTeam, schoolTeam]
 *                 description: The type of team the players belong to
 *               playerArray:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     department:
 *                       type: string
 *                       example: "Electrical/Electronic Engineering"
 *                     position:
 *                       type: string
 *                       enum: [CB, LB, RB, WB, GK, CMF, DMF, AMF, LW, RW, ST]
 *                       example: "LW"
 *                     number:
 *                       type: number
 *                       example: 11
 *     responses:
 *       200:
 *         description: Player created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Players Created"
 *               data:
 *                 - _id: "650d1f99a2f45b1a3c2e77bc"
 *                   name: "John Doe"
 *                   department: "Electrical/Electronic Engineering"
 *                   position: "ST"
 *                   number: 9
 *                   team: "650d1f99a2f45b1a3c2e77bd"
 *                   status: "active"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/player/{playerId}:
 *   put:
 *     summary: Update a football player's details
 *     tags: [Football Player (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player to update
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
 *                 enum: [CB, LB, RB, WB, GK, CMF, DMF, AMF, LW, RW, ST]
 *                 example: "LW"
 *               number:
 *                 type: integer
 *                 example: 11
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-15"
 *               departmentTeam:
 *                 type: string
 *                 description: ID of department team
 *               clubTeam:
 *                 type: string
 *                 description: ID of club team (will trigger transfer if changed)
 *               schoolTeam:
 *                 type: string
 *                 description: ID of school team
 *               clubStatus:
 *                 type: string
 *                 enum: [active, loaned, transferred, not-applicable]
 *     responses:
 *       200:
 *         description: Player details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Updated"
 *               data:
 *                 _id: "650d1f99a2f45b1a3c2e77bc"
 *                 name: "John Doe"
 *                 position: "LW"
 *                 number: 11
 *                 birthDate: "2000-05-15T00:00:00.000Z"
 *                 departmentTeam: "65a1b2c3d4e5f6g7h8i9j10"
 *                 clubTeam: "65a1b2c3d4e5f6g7h8i9j11"
 *                 schoolTeam: "65a1b2c3d4e5f6g7h8i9j12"
 *                 clubStatus: "active"
 *                 transferDetails: null
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
 * /football/player/{playerId}:
 *   delete:
 *     summary: Delete a football player
 *     tags: [Football Player (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player to delete
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Deleted"
 *               data:
 *                 _id: "650d1f99a2f45b1a3c2e77bc"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/player/{playerId}/stats:
 *   put:
 *     summary: Update a player's statistics
 *     tags: [Football Player (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player whose stats need to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamType:
 *                 type: string
 *                 enum: [base, department, club, school]
 *                 description: The type of team these stats apply to
 *                 example: "club"
 *               matchType:
 *                 type: string
 *                 enum: [friendly, competitive]
 *                 description: Type of match (optional)
 *                 example: "competitive"
 *               competitionId:
 *                 type: string
 *                 description: ID of competition (optional for competition-specific stats)
 *               season:
 *                 type: string
 *                 pattern: "^\\d{4}/\\d{4}$"
 *                 description: Academic year in YYYY/YYYY format
 *                 example: "2023/2024"
 *               stats:
 *                 type: object
 *                 properties:
 *                   goals:
 *                     type: integer
 *                     minimum: 0
 *                   ownGoals:
 *                     type: integer
 *                     minimum: 0
 *                   assists:
 *                     type: integer
 *                     minimum: 0
 *                   yellowCards:
 *                     type: integer
 *                     minimum: 0
 *                   redCards:
 *                     type: integer
 *                     minimum: 0
 *                   appearances:
 *                     type: integer
 *                     minimum: 0
 *                   cleanSheets:
 *                     type: integer
 *                     minimum: 0
 *                   minutesPlayed:
 *                     type: integer
 *                     minimum: 0
 *                 required:
 *                   - appearances
 *     responses:
 *       200:
 *         description: Player statistics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Stats Updated"
 *               data:
 *                 stats:
 *                   careerTotals:
 *                     goals: 15
 *                     assists: 8
 *                     yellowCards: 3
 *                     redCards: 0
 *                     appearances: 20
 *                     cleanSheets: 5
 *                     minutesPlayed: 1800
 *                   byTeam:
 *                     club:
 *                       competitive:
 *                         - season: "2023/2024"
 *                           goals: 10
 *                           assists: 5
 *                           appearances: 15
 *                           minutesPlayed: 1350
 *                       friendly:
 *                         - season: "2023/2024"
 *                           goals: 5
 *                           assists: 3
 *                           appearances: 5
 *                           minutesPlayed: 450
 *                       totals:
 *                         season: "2023/2024"
 *                         goals: 15
 *                         assists: 8
 *                         appearances: 20
 *                         minutesPlayed: 1800
 *                   byCompetition:
 *                     - competition: "65a1b2c3d4e5f6g7h8i9j13"
 *                       season: "2023/2024"
 *                       stats:
 *                         goals: 7
 *                         assists: 4
 *                         appearances: 10
 *                         minutesPlayed: 900
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             example:
 *               code: "400"
 *               message: "Invalid team type or missing required fields"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /football/player/{playerId}/transfer:
 *   put:
 *     summary: Transfer or loan a player to another club
 *     description: |
 *       Handles club-to-club transfers and loans. 
 *       For loans, a returnDate must be provided.
 *     tags: [Football Player (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *             required:
 *               - status
 *               - toClub
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["loaned", "transferred"]
 *                 description: Type of movement between clubs
 *                 example: "loaned"
 *               toClub:
 *                 type: string
 *                 description: ID of the destination club team
 *                 example: "652a3b8cf9e3457d8a2e67cd"
 *               transferDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when transfer/loan takes effect (defaults to now)
 *                 example: "2024-04-01T15:00:00Z"
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 description: Required for loans - date when loan ends
 *                 example: "2024-06-01T15:00:00Z"
 *     responses:
 *       200:
 *         description: Player transfer/loan processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player loaned successfully"
 *               data:
 *                 player:
 *                   id: "651d2e09b1c23e4d8c9f87ab"
 *                   name: "John Doe"
 *                 newClub:
 *                   id: "652a3b8cf9e3457d8a2e67cd"
 *                   name: "Thunder FC"
 *                 oldClub:
 *                   id: "650d1f99a2f45b1a3c2e77bd"
 *                   name: "Lightning FC"
 *                 transferDetails:
 *                   status: "loaned"
 *                   fromClub: "650d1f99a2f45b1a3c2e77bd"
 *                   toClub: "652a3b8cf9e3457d8a2e67cd"
 *                   transferDate: "2024-04-01T15:00:00Z"
 *                   returnDate: "2024-06-01T15:00:00Z"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               invalidStatus:
 *                 value:
 *                   code: "400"
 *                   message: "Invalid transfer/loan status"
 *               missingReturnDate:
 *                 value:
 *                   code: "400"
 *                   message: "Return date required for loans"
 *               sameClub:
 *                 value:
 *                   code: "400"
 *                   message: "Cannot transfer/loan to same club"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               playerNotFound:
 *                 value:
 *                   code: "404"
 *                   message: "Player not found"
 *               clubNotFound:
 *                 value:
 *                   code: "404"
 *                   message: "Target club not found"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         department:
 *           type: string
 *         position:
 *           type: string
 *           enum: [CB, LB, RB, WB, GK, CMF, DMF, AMF, LW, RW, ST]
 *         number:
 *           type: integer
 *         birthDate:
 *           type: string
 *           format: date-time
 *         baseTeam:
 *           $ref: "#/components/schemas/TeamReference"
 *         departmentTeam:
 *           $ref: "#/components/schemas/TeamReference"
 *         clubTeam:
 *           $ref: "#/components/schemas/TeamReference"
 *         schoolTeam:
 *           $ref: "#/components/schemas/TeamReference"
 *         clubStatus:
 *           type: string
 *           enum: [active, loaned, transferred, not-applicable]
 *         stats:
 *           $ref: "#/components/schemas/PlayerStats"
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     TeamReference:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 * 
 *     PlayerStats:
 *       type: object
 *       properties:
 *         careerTotals:
 *           type: object
 *           properties:
 *             goals:
 *               type: integer
 *             assists:
 *               type: integer
 *             yellowCards:
 *               type: integer
 *             redCards:
 *               type: integer
 *             appearances:
 *               type: integer
 *             cleanSheets:
 *               type: integer
 *             minutesPlayed:
 *               type: integer
 *         byTeam:
 *           type: object
 *           properties:
 *             base:
 *               type: object
 *               properties:
 *                 friendly:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 competitive:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 totals:
 *                   $ref: "#/components/schemas/TeamSeasonStats"
 *             department:
 *               type: object
 *               properties:
 *                 friendly:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 competitive:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 totals:
 *                   $ref: "#/components/schemas/TeamSeasonStats"
 *             club:
 *               type: object
 *               properties:
 *                 friendly:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 competitive:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 totals:
 *                   $ref: "#/components/schemas/TeamSeasonStats"
 *             school:
 *               type: object
 *               properties:
 *                 friendly:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 competitive:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/TeamSeasonStats"
 *                 totals:
 *                   $ref: "#/components/schemas/TeamSeasonStats"
 *         byCompetition:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               competition:
 *                 $ref: "#/components/schemas/CompetitionReference"
 *               season:
 *                 type: string
 *               stats:
 *                 $ref: "#/components/schemas/TeamSeasonStats"
 * 
 *     TeamSeasonStats:
 *       type: object
 *       properties:
 *         season:
 *           type: string
 *         goals:
 *           type: integer
 *         assists:
 *           type: integer
 *         appearances:
 *           type: integer
 *         minutesPlayed:
 *           type: integer
 * 
 *     CompetitionReference:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   responses:
 *     PlayerNotFoundError:
 *       description: Player not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *           example:
 *             code: "04"
 *             message: "Player not found"
 */