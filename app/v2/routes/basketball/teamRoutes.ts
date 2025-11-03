import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { singleImageUpload } from "../../utils/general/cloudinaryUtils";
import { createTeam, deleteTeam, getAllTeams, getTeamDetails, getTeamPlayers, updateTeam, updateTeamAdmin, updateTeamLogo } from "../../controllers/basketball/teamController";

const router = Router();

// USER ROUTES //

// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllTeams );
router.get('/:playerId', getTeamDetails );
router.get('/:playerId/players', getTeamPlayers );
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/', authenticateUser, isSuperAdmin, singleImageUpload, createTeam);
router.delete('/:teamId', authenticateUser, isSuperAdmin, deleteTeam);
router.put('/:teamId/update', authenticateUser, isSuperAdmin, updateTeam);
router.put('/:teamId/update/logo', authenticateUser, isSuperAdmin, singleImageUpload, updateTeamLogo);
router.put('/:teamId/update/admin', authenticateUser, isSuperAdmin, updateTeamAdmin);
// END OF ADMIN ROUTES //

export default router;