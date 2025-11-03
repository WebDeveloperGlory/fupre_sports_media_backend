import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { createPlayer, extendPlayerContract, getAllPlayers, getPlayerDetails, signPlayerContract, updatePlayer, updatePlayerImage } from "../../controllers/basketball/playerController";
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
router.put('/:playerId/contracts/sign', authenticateUser, isSuperAdmin, singleImageUpload, signPlayerContract);
router.put('/:playerId/contracts/extend', authenticateUser, isSuperAdmin, singleImageUpload, extendPlayerContract);
// END OF ADMIN ROUTES //

export default router;