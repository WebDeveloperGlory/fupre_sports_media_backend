import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isHeadMediaAdmin, isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { getHeadMediaAdminDashboardAnalytics, getHeadMediaAdminFixturesForRating, getSuperAdminFootballDashboardAnalytics } from "../../controllers/views/adminDashboardController";

const router = Router();

// USER ROUTES //

// END OF USER ROUTES //

// GENERAL ROUTES //

// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.get('/media-admin/dashboard', authenticateUser, isHeadMediaAdmin, getHeadMediaAdminDashboardAnalytics);
router.get('/media-admin/potm-fixtures', authenticateUser, isHeadMediaAdmin, getHeadMediaAdminFixturesForRating);

router.get('/super-admin/dashboard/football', authenticateUser, isSuperAdmin, getSuperAdminFootballDashboardAnalytics);
// END OF ADMIN ROUTES //

export default router;