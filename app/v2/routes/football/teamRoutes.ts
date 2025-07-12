import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { createTeam, getAllTeams, getSingleTeam, getTeamStats, getTeamPlayers, getTeamCompetitionAndCompetitionPerformance, updateTeamBasicInfo, updateTeamCoaches, setTeamAdmin, updateTeamLifetimeStats, deleteTeam } from "../../controllers/football/teamController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllTeams);
router.get('/:teamId', getSingleTeam);
router.get('/:teamId/stats', getTeamStats);
router.get('/:teamId/players', getTeamPlayers);
router.get('/:teamId/competition', getTeamCompetitionAndCompetitionPerformance);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/', authenticateUser, isSuperAdmin, createTeam);
router.delete('/:teamId/delete', authenticateUser, isSuperAdmin, deleteTeam);
router.put('/:teamId/update/info', authenticateUser, isSuperAdmin, updateTeamBasicInfo);
router.put('/:teamId/update/coaches', authenticateUser, isSuperAdmin, updateTeamCoaches);
router.put('/:teamId/update/admin', authenticateUser, isSuperAdmin, setTeamAdmin);
router.put('/:teamId/update/stats', authenticateUser, isSuperAdmin, updateTeamLifetimeStats);
// END OF ADMIN ROUTES //

export default router;