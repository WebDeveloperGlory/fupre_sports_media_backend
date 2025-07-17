import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin, hasTeamPermissions } from "../../middlewares/general/adminMiddleware";
import { addPlayerToTeam, createPlayer, getPlayerById, getTeamSuggestedPlayers, registerUnverifiedPlayer, updatePlayer, verifyPlayerRegistration } from "../../controllers/football/playerController";

const router = Router();

// USER ROUTES //

// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/details/:playerId', getPlayerById);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.get('/suggested', authenticateUser, hasTeamPermissions, getTeamSuggestedPlayers);
router.post('/register/verified', authenticateUser, isSuperAdmin, createPlayer);
router.post('/register/unverified', authenticateUser, hasTeamPermissions, registerUnverifiedPlayer);

router.put('/:playerId/update', authenticateUser, isSuperAdmin, updatePlayer);
router.put('/:playerId/verify-registration', authenticateUser, isSuperAdmin, verifyPlayerRegistration);
router.put('/:playerId/team-registration', authenticateUser, hasTeamPermissions, addPlayerToTeam);
// END OF ADMIN ROUTES //

export default router;