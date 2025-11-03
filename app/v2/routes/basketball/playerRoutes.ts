import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin, hasTeamPermissions } from "../../middlewares/general/adminMiddleware";
import { createPlayer, getAllPlayers, getPlayerDetails, updatePlayer, updatePlayerImage } from "../../controllers/basketball/playerController";
import { singleImageUpload } from "../../utils/general/cloudinaryUtils";

const router = Router();

// USER ROUTES //

// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllPlayers );
router.get('/:playerId', getPlayerDetails );
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/register/verified', authenticateUser, isSuperAdmin, singleImageUpload, createPlayer);
router.put('/:playerId/update', authenticateUser, isSuperAdmin, updatePlayer);
router.put('/:playerId/update/image', authenticateUser, isSuperAdmin, singleImageUpload, updatePlayerImage);
// END OF ADMIN ROUTES //

export default router;