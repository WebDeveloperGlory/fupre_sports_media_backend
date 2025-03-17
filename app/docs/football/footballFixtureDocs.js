/**
 * @swagger
 * tags:
 *   name: FootballFixture
 *   description: API for managing football fixtures
 *
 * /football/fixture:
 *   get:
 *     summary: Get all football fixtures
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
 *         name: filterBy
 *         schema:
 *           type: string
 *         description: Filter fixtures by date (YYYY-MM-DD)
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completed fixtures
 *       - in: query
 *         name: live
 *         schema:
 *           type: boolean
 *         description: Filter by live fixtures
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter by upcoming fixtures
 *       - in: query
 *         name: postponed
 *         schema:
 *           type: boolean
 *         description: Filter by postponed fixtures
 *     responses:
 *       200:
 *         description: Fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixtures retrieved successfully"
 *               data:
 *                 fixtures:
 *                   - _id: "652a3b8cf9e3457d8a2e67cd"
 *                     homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                     awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                     type: "competition"
 *                     competition: "651f1b29c45a1b3a3c4e8dcd"
 *                     matchWeek: "5"
 *                     referee: "John Smith"
 *                     date: "2024-03-20T15:00:00Z"
 *                     stadium: "National Stadium"
 *                     status: "upcoming"
 *                 pagination:
 *                  total: 1
 *                  page: 1
 *                  limit: 10
 *                  pages: 1
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   post:
 *     summary: Create a new friendly fixture
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
 *               homeTeam:
 *                 type: string
 *               awayTeam:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
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
 *               code: "00"
 *               message: "Fixture Created"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
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
 *         description: The ID of the fixture to retrieve
 *     responses:
 *       200:
 *         description: Fixture details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture retrieved successfully"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *   put:
 *     summary: Update a football fixture
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
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [upcoming, live, completed, postponed]
 *               stadium:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fixture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture updated successfully"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *   delete:
 *     summary: Delete a specific football fixture
 *     tags: [FootballFixture]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fixture to delete
 *     responses:
 *       200:
 *         description: Fixture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture deleted successfully"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/fixture/teams/{teamId}:
 *   get:
 *     summary: Get all fixtures for a specific team
 *     tags: [FootballFixture]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the team to get fixtures for
 *     responses:
 *       200:
 *         description: Team fixtures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Team fixtures retrieved successfully"
 *               data:
 *                 fixtures:
 *                   - _id: "652a3b8cf9e3457d8a2e67cd"
 *                     homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                     awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                     type: "competition"
 *                     competition: "651f1b29c45a1b3a3c4e8dcd"
 *                     matchWeek: "5"
 *                     referee: "John Smith"
 *                     date: "2024-03-20T15:00:00Z"
 *                     stadium: "National Stadium"
 *                     status: "upcoming"
 *       400:
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [upcoming, live, completed, postponed]
 *     responses:
 *       200:
 *         description: Fixture status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Status Updated"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /football/fixture/{fixtureId}/result:
 *   put:
 *     summary: Update fixture result
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
 *     responses:
 *       200:
 *         description: Fixture result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Fixture Result Updated"
 *               data:
 *                 _id: "652a3b8cf9e3457d8a2e67cd"
 *                 homeTeam: "650d1f99a2f45b1a3c2e77bd"
 *                 awayTeam: "650d1f99a2f45b1a3c2e77be"
 *                 type: "competition"
 *                 competition: "651f1b29c45a1b3a3c4e8dcd"
 *                 matchWeek: "5"
 *                 referee: "John Smith"
 *                 date: "2024-03-20T15:00:00Z"
 *                 stadium: "National Stadium"
 *                 status: "upcoming"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */