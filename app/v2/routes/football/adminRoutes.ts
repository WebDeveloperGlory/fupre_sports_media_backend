import { Router } from "express";
import { authenticateUser } from '../../middlewares/general/authMiddleware';
import { isHeadMediaAdmin, isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { getAllAdmins, getLiveFixtureAdmins, getMediaAdmins } from "../../controllers/football/adminController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.get('/all', authenticateUser, isSuperAdmin, getAllAdmins);
router.get('/media', authenticateUser, isHeadMediaAdmin, getMediaAdmins);
router.get('/live-fixture', authenticateUser, isSuperAdmin, getLiveFixtureAdmins);
// END OF ADMIN ROUTES //

export default router;