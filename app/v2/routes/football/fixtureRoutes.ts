import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { getAllTodayFixtures, getFixtureById, getFixtures, getRecentFixtures, rescheduleFixture } from "../../controllers/football/fixtureController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getFixtures);
router.get('/single/:fixtureId', getFixtureById);
router.get('/today', getAllTodayFixtures);
router.get('/recent', getRecentFixtures);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.put('/:fixtureId/reschedule', authenticateUser, isSuperAdmin, rescheduleFixture);
// END OF ADMIN ROUTES //

export default router;