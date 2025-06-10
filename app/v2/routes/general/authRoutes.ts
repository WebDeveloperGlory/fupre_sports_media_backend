import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { changePassword, generateOTP, registerAdmin, registerRegularUser, verifyOTP } from "../../controllers/general/authController";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";

const router = Router();

// USER ROUTES //
router.post('/signup/user', registerRegularUser);
// END OF USER ROUTES //

// GENERAL ROUTES //
router.post('/otp/request', generateOTP);
router.post('/otp/verify', verifyOTP);
router.post('/password/reset', changePassword);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/signup/admin', authenticateUser, isSuperAdmin, registerAdmin);
// END OF ADMIN ROUTES //

export default router;