import { Router } from "express";
import { footballCompetitionPage, getCompetitionPageStatistics, getHomePageStatistics } from "../../controllers/views/homepageController";

const router = Router();

// USER ROUTES //

// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/homepage', getHomePageStatistics);
router.get('/competition', getCompetitionPageStatistics);
router.get('/competition/football', footballCompetitionPage);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
// END OF ADMIN ROUTES //

export default router;