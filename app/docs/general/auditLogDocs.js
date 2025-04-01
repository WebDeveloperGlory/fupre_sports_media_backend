/**
 * @swagger
 * tags:
 *   - name: Audit Logs (Admin)
 *     description: Admin endpoints for managing audit logs (requires authentication)
 */

/**
 * @swagger
 * /audit/audit-logs:
 *   get:
 *     summary: Get all audit logs (Admin)
 *     tags: [Audit Logs (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Audit logs retrieved"
 *               data:
 *                 logs:
 *                   - _id: "650d1f99a2f45b1a3c2e77bc"
 *                     action: "UPDATE"
 *                     entity: "Match"
 *                     timestamp: "2024-03-09T12:34:56Z"
 *                 pagination:
 *                   total: 100
 *                   page: 1
 *                   pages: 5
 *                   limit: 20
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /audit/audit-logs/{logId}:
 *   get:
 *     summary: Get detailed audit log (Admin)
 *     tags: [Audit Logs (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the audit log
 *     responses:
 *       200:
 *         description: Detailed audit log
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Audit log retrieved"
 *               data:
 *                 _id: "650d1f99a2f45b1a3c2e77bc"
 *                 userId: "651d2e09b1c23e4d8c9f87ab"
 *                 action: "DELETE"
 *                 entity: "Player"
 *                 entityId: "652a3b8cf9e3457d8a2e67cd"
 *                 details: { reason: "Player contract terminated" }
 *                 previousValues: { status: "active" }
 *                 newValues: { status: "inactive" }
 *                 timestamp: "2024-03-09T12:34:56Z"
 *                 ipAddress: "192.168.1.1"
 *                 userAgent: "Mozilla/5.0"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /audit/audit-logs/user/{userId}:
 *   get:
 *     summary: Get user-specific audit logs (Admin)
 *     tags: [Audit Logs (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of logs to return
 *     responses:
 *       200:
 *         description: User audit logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User audit logs retrieved"
 *               data:
 *                 - _id: "650d1f99a2f45b1a3c2e77bc"
 *                   action: "LOGIN"
 *                   entity: "User"
 *                   timestamp: "2024-03-09T12:34:56Z"
 *                   ipAddress: "192.168.1.1"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (admin access required)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /audit/audit-logs/entity/{entity}/{entityId}:
 *   get:
 *     summary: Get entity-specific audit logs (Admin)
 *     tags: [Audit Logs (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity type (e.g., Competition, Team)
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: Entity audit history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Entity audit logs retrieved"
 *               data:
 *                 - _id: "650d1f99a2f45b1a3c2e77bc"
 *                   userId: "651d2e09b1c23e4d8c9f87ab"
 *                   action: "UPDATE"
 *                   previousValues: { name: "Summer Cup 2023" }
 *                   newValues: { name: "Summer Cup 2024" }
 *                   timestamp: "2024-03-09T12:34:56Z"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         description: Forbidden (admin access required)
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         action:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
 *         entity:
 *           type: string
 *         entityId:
 *           type: string
 *         details:
 *           type: object
 *         previousValues:
 *           type: object
 *         newValues:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   responses:
 *     ForbiddenError:
 *       description: Forbidden (admin access required)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *           example:
 *             code: "03"
 *             message: "Insufficient permissions"
 */