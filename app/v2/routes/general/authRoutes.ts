import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { changePassword, checkStatus, generateOTP, loginUser, logoutUser, registerAdmin, registerRegularUser, verifyOTP } from "../../controllers/general/authController";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";

const router = Router();

// USER ROUTES //
router.post('/signup/user', registerRegularUser);
// END OF USER ROUTES //

// GENERAL ROUTES //
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/otp/request', generateOTP);
router.post('/otp/request', generateOTP);
router.post('/otp/verify', verifyOTP);
router.post('/password/reset', changePassword);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/signup/admin', authenticateUser, isSuperAdmin, registerAdmin);
router.get('/check/super-admin', authenticateUser, isSuperAdmin, checkStatus);
// END OF ADMIN ROUTES //

export default router;