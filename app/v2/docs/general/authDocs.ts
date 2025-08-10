/**
 * @swagger
 * tags:
 *   - name: Auth (User)
 *     description: User authentication operations
 *   - name: Auth (General)
 *     description: General authentication operations
 *   - name: Auth (Admin)
 *     description: Admin authentication operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 * 
 *     AdminRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [super-admin, media-admin, head-media-admin, competition-admin, team-admin, live-fixture-admin]
 * 
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 * 
 *     OTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 * 
 *     OTPVerification:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 * 
 *     PasswordChange:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *         - confirmNewPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *         confirmNewPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 * 
 *     UserStatus:
 *       type: string
 *       enum: [active, inactive, suspended]
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/signup/user:
 *   post:
 *     tags: [Auth (User)]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "User Created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input or email already registered
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth (General)]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "User Logged In"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: authToken=abc123; HttpOnly; Secure; SameSite=None; Max-Age=86400
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth (General)]
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "User Logged Out"
 *                 data:
 *                   type: null
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: authToken=; HttpOnly; Secure; SameSite=None; Max-Age=0
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/otp/request:
 *   post:
 *     tags: [Auth (General)]
 *     summary: Request OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "OTP sent to email"
 *                 data:
 *                   type: string
 *                   description: The OTP code (only returned in development)
 *       400:
 *         description: Invalid user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     tags: [Auth (General)]
 *     summary: Verify OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerification'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "OTP Verified"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: authToken=abc123; HttpOnly; Secure; SameSite=None; Max-Age=86400
 *       400:
 *         description: Invalid/expired OTP
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     tags: [Auth (General)]
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Password Changed Successfully"
 *                 data:
 *                   type: null
 *       400:
 *         description: Passwords don't match or invalid user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/signup/admin:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: Register a new admin (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRegistration'
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Admin Account Created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       $ref: '#/components/schemas/UserStatus'
 *       400:
 *         description: Invalid input or email already registered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no signup permissions)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/check/super-admin:
 *   get:
 *     tags: [Auth (Admin)]
 *     summary: Check super admin status (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Check Passed"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not super admin)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/check/live-fixture-admin:
 *   get:
 *     tags: [Auth (Admin)]
 *     summary: Check live fixture admin status (Live Fixture Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Check Passed"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not live fixture admin)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/check/media-admin:
 *   get:
 *     tags: [Auth (Admin)]
 *     summary: Check media admin status (Media Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Check Passed"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not media admin)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/check/head-media-admin:
 *   get:
 *     tags: [Auth (Admin)]
 *     summary: Check head media admin status (Head Media Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 message:
 *                   type: string
 *                   example: "Check Passed"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not head media admin)
 *       500:
 *         description: Server error
 */