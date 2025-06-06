/**
 * @swagger
 * tags:
 *   - name: Notifications (Public)
 *     description: User notification management endpoints
 *   - name: Notifications (Admin)
 *     description: Admin notification management operations
 */

// ### Public Routes (Require Authentication) ### //

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: includeRead
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include read notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User notifications retrieved"
 *               data:
 *                 - _id: "651d2e09b1c23e4d8c9f87cd"
 *                   recipient: "651d2e09b1c23e4d8c9f87ab"
 *                   title: "New Message"
 *                   message: "You have received a new message"
 *                   date: "2023-10-04T12:30:00.000Z"
 *                   read: false
 *                   createdAt: "2023-10-04T12:30:00.000Z"
 *                   updatedAt: "2023-10-04T12:30:00.000Z"
 *               pagination:
 *                 total: 50
 *                 page: 1
 *                 limit: 20
 *                 pages: 3
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Notification stats retrieved"
 *               data:
 *                 total: 50
 *                 unread: 10
 *                 read: 40
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/{notificationId}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Notification marked as read"
 *               data:
 *                 _id: "651d2e09b1c23e4d8c9f87cd"
 *                 recipient: "651d2e09b1c23e4d8c9f87ab"
 *                 title: "New Message"
 *                 message: "You have received a new message"
 *                 date: "2023-10-04T12:30:00.000Z"
 *                 read: true
 *                 createdAt: "2023-10-04T12:30:00.000Z"
 *                 updatedAt: "2023-10-04T12:35:00.000Z"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All notifications marked as read"
 *               data:
 *                 modifiedCount: 10
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Notification deleted"
 *               data:
 *                 deleted: true
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/{notificationId}/status:
 *   put:
 *     summary: Update notification status (read/unread)
 *     tags: [Notifications (Public)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *                 description: Set to true to mark as read, false for unread
 *             required:
 *               - read
 *     responses:
 *       200:
 *         description: Notification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Notification marked as read"
 *               data:
 *                 _id: "651d2e09b1c23e4d8c9f87cd"
 *                 recipient: "651d2e09b1c23e4d8c9f87ab"
 *                 title: "New Message"
 *                 message: "You have received a new message"
 *                 date: "2023-10-04T12:30:00.000Z"
 *                 read: true
 *                 createdAt: "2023-10-04T12:30:00.000Z"
 *                 updatedAt: "2023-10-04T12:40:00.000Z"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

// ### Admin Routes (Require Authentication and Admin Privilege) ### //

/**
 * @swagger
 * /notification:
 *   post:
 *     summary: Send notification to specific users
 *     tags: [Notifications (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to send notification to
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional notification date (defaults to current time)
 *             required:
 *               - recipients
 *               - title
 *               - message
 *     responses:
 *       200:
 *         description: Notifications sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Sent notifications to 5 users"
 *               data:
 *                 - _id: "651d2e09b1c23e4d8c9f87cd"
 *                   recipient: "651d2e09b1c23e4d8c9f87ab"
 *                   title: "System Update"
 *                   message: "System will be down for maintenance"
 *                   date: "2023-10-04T12:30:00.000Z"
 *                   read: false
 *                   createdAt: "2023-10-04T12:30:00.000Z"
 *                   updatedAt: "2023-10-04T12:30:00.000Z"
 *       400:
 *         $ref: "#/components/responses/BadRequestError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /notification/all:
 *   post:
 *     summary: Send notification to all users
 *     tags: [Notifications (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Optional notification date (defaults to current time)
 *             required:
 *               - title
 *               - message
 *     responses:
 *       200:
 *         description: Notifications sent to all users successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Sent notification to all users (125)"
 *               data:
 *                 count: 125
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
 * /notification/{notificationId}:
 *   delete:
 *     summary: Admin delete a notification
 *     tags: [Notifications (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Notification deleted by admin"
 *               data:
 *                 deleted: true
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
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the notification
 *         recipient:
 *           type: string
 *           description: User ID of the notification recipient
 *         title:
 *           type: string
 *           description: Title of the notification
 *         message:
 *           type: string
 *           description: Content of the notification
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date the notification was created or scheduled for
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the notification was last updated
 *       required:
 *         - _id
 *         - recipient
 *         - title
 *         - message
 *         - date
 *         - read
 *         - createdAt
 *         - updatedAt
 *   responses:
 *     BadRequestError:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               code:
 *                 type: number
 *                 example: 400
 *     UnauthorizedError:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               code:
 *                 type: number
 *                 example: 401
 *     NotFoundError:
 *       description: Not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               code:
 *                 type: number
 *                 example: 404
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *               code:
 *                 type: number
 *                 example: 500
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */