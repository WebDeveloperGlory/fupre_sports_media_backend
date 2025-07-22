import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { getProfile, updateProfile } from "../../controllers/general/userController";

const router = Router();

// USER ROUTES //
router.get('/me', authenticateUser, getProfile);
router.put('/me', authenticateUser, updateProfile);
// END OF USER ROUTES //

// GENERAL ROUTES //
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
// END OF ADMIN ROUTES //

export default router;