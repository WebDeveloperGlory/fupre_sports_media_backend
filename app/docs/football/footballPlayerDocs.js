/**
 * @swagger
 * tags:
 *   name: FootballPlayer
 *   description: API for managing football players
 *
 * /football/player:
 *   post:
 *     summary: Create a new football player
 *     tags: [FootballPlayer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *                 example: "650d1f99a2f45b1a3c2e77bd"
 *                 description: The ID of the team the players belong to
 *               playerArray:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
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
 *                   position: "ST"
 *                   number: 9
 *                   team: "650d1f99a2f45b1a3c2e77bd"
 *                   status: "active"
 *                   generalRecord:
 *                     - year: 2024
 *                       goals: 10
 *                       assists: 5
 *                       yellowCards: 1
 *                       redCards: 0
 *                       appearances: 15
 *                       cleanSheets: 0
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/player/{playerId}:
 *   get:
 *     summary: Get details of a football player
 *     tags: [FootballPlayer]
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
 *               message: "Player Acquired"
 *               data:
 *                 _id: "650d1f99a2f45b1a3c2e77bc"
 *                 name: "John Doe"
 *                 position: "ST"
 *                 number: 9
 *                 team: "650d1f99a2f45b1a3c2e77bd"
 *                 status: "active"
 *                 generalRecord:
 *                   - year: 2024
 *                     goals: 10
 *                     assists: 5
 *                     yellowCards: 1
 *                     redCards: 0
 *                     appearances: 15
 *                     cleanSheets: 0
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   put:
 *     summary: Update a football player's details
 *     tags: [FootballPlayer]
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
 *                 type: number
 *                 example: 11
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
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   delete:
 *     summary: Delete a football player
 *     tags: [FootballPlayer]
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
 * /football/player/{playerId}/records:
 *   put:
 *     summary: Update a player's records
 *     tags: [FootballPlayer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the player whose records need to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goals:
 *                 type: integer
 *                 description: Number of goals scored by the player
 *               assists:
 *                 type: integer
 *                 description: Number of assists made by the player
 *               yellowCards:
 *                 type: integer
 *                 description: Number of yellow cards received
 *               redCards:
 *                 type: integer
 *                 description: Number of red cards received
 *               appearances:
 *                 type: integer
 *                 description: Number of matches the player appeared in
 *               cleanSheets:
 *                 type: integer
 *                 description: Number of clean sheets (for goalkeepers)
 *     responses:
 *       200:
 *         description: Player records updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Player Record Updated"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 generalRecord:
 *                   - year: 2024
 *                     goals: 10
 *                     assists: 5
 *                     yellowCards: 2
 *                     redCards: 0
 *                     appearances: 15
 *                     cleanSheets: 3
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */