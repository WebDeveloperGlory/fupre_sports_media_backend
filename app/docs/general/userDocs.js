/**
 * @swagger
 * tags:
 *   - name: User Management (Public)
 *     description: Public user management endpoints
 *   - name: User Management (Admin)
 *     description: Admin user management operations
 */


// ### Public Routes (No Authentication Required) ### //

// There are no public routes in the provided user management documentation


// ### Admin Routes (Require Authentication) ### //

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User Management (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "All Users Acquired"
 *               data:
 *                 - _id: "651d2e09b1c23e4d8c9f87ab"
 *                   name: "John Doe"
 *                   email: "john.doe@example.com"
 *                   role: "user"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get a specific user
 *     tags: [User Management (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Acquired"
 *               data:
 *                 _id: "651d2e09b1c23e4d8c9f87ab"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 role: "user"
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   put:
 *     summary: Update a user's details
 *     tags: [User Management (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Updated"
 *               data: null
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 *
 *   delete:
 *     summary: Delete a user
 *     tags: [User Management (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Deleted"
 *               data: null
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */

/**
 * @swagger
 * /user/{userId}/reset-password:
 *   put:
 *     summary: Reset user password
 *     tags: [User Management (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose password will be reset (SuperAdmin Only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Password Reset"
 *               data: null
 *       400:
 *         $ref: "#/components/responses/NotFoundError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */