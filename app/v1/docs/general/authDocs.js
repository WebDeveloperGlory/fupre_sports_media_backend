/**
 * @swagger
 * tags:
 *   - name: Authentication (Public)
 *     description: Public authentication endpoints
 *   - name: Authentication (Admin)
 *     description: Admin authentication management
 */


// ### Public Routes (No Authentication Required) ### //

/**
 * @swagger
 * /authentication/register/regular:
 *   post:
 *     summary: Register a new regular user
 *     tags: [Authentication (Public)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "User Created"
 *               data:
 *                 id: "60d0fe4f5311236168a109ca"
 *                 name: "John Doe"
 *                 email: "user@example.com"
 *                 role: "user"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /authentication/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication (Public)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Login Successful"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "60d0fe4f5311236168a109ca"
 *                   name: "John Doe"
 *                   email: "user@example.com"
 *                   role: "user"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */


// ### Admin Routes (Require Authentication) ### //

/**
 * @swagger
 * /authentication/register/admin:
 *   post:
 *     summary: Register a new admin user (SuperAdmin only)
 *     tags: [Authentication (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin User"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *               role:
 *                 type: string
 *                 enum: [admin, superAdmin]
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "AdminPassword123!"
 *     responses:
 *       201:
 *         description: Admin account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Admin Account Created"
 *               data:
 *                 id: "60d0fe4f5311236168a109cb"
 *                 name: "Admin User"
 *                 email: "admin@example.com"
 *                 role: "admin"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden (requires superAdmin role)
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /authentication/logout:
 *   post:
 *     summary: Log out authenticated user
 *     tags: [Authentication (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Logout Successful"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /authentication/update-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "NewSecurePassword456!"
 *               confirmNewPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePassword456!"
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *             example:
 *               code: "00"
 *               message: "Password Updated Successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin, superAdmin]
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     AuthToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         expiresIn:
 *           type: number
 *           example: 3600
 */

/**
 * @swagger
 * components:
 *   responses:
 *     ForbiddenError:
 *       description: Forbidden (requires admin privileges)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ErrorResponse"
 *           example:
 *             code: "03"
 *             message: "Insufficient permissions"
 */