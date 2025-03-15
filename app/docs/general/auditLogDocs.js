/**
 * @swagger
 * tags:
 *   name: AuditLog
 *   description: API for managing audit logs
 *
 * /audit/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Audit logs retrieved"
 *               data:
 *                 - _id: "650d1f99a2f45b1a3c2e77bc"
 *                   userId: "651d2e09b1c23e4d8c9f87ab"
 *                   action: "UPDATE"
 *                   entity: "Match"
 *                   entityId: "652a3b8cf9e3457d8a2e67cd"
 *                   details: { description: "Updated match score" }
 *                   previousValues: { score: "1-0" }
 *                   newValues: { score: "2-1" }
 *                   timestamp: "2024-03-09T12:34:56Z"
 *                   ipAddress: "192.168.1.1"
 *                   userAgent: "Mozilla/5.0"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /audit/audit-logs/{logId}:
 *   get:
 *     summary: Get a specific audit log
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the audit log to retrieve
 *     responses:
 *       200:
 *         description: Log retrieved successfully
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
 *                 timestamp: "2024-03-09T12:34:56Z"
 *                 ipAddress: "192.168.1.1"
 *                 userAgent: "Mozilla/5.0"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /audit/audit-logs/user/{userId}:
 *   get:
 *     summary: Get audit logs for a specific user
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose logs to retrieve
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User audit logs retrieved"
 *               data:
 *                 - _id: "650d1f99a2f45b1a3c2e77bc"
 *                   userId: "651d2e09b1c23e4d8c9f87ab"
 *                   action: "LOGIN"
 *                   entity: "User"
 *                   entityId: "651d2e09b1c23e4d8c9f87ab"
 *                   timestamp: "2024-03-09T12:34:56Z"
 *                   ipAddress: "192.168.1.1"
 *                   userAgent: "Mozilla/5.0"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 * /audit/audit-logs/entity/{entity}/{entityId}:
 *   get:
 *     summary: Get audit logs by entity
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *         description: The entity name
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The entity ID
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
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
 *                   entity: "Competition"
 *                   entityId: "652a3b8cf9e3457d8a2e67cd"
 *                   previousValues: { name: "Summer Cup 2023" }
 *                   newValues: { name: "Summer Cup 2024" }
 *                   timestamp: "2024-03-09T12:34:56Z"
 *                   ipAddress: "192.168.1.1"
 *                   userAgent: "Mozilla/5.0"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */