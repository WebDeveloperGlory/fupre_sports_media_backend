const { Router } = require('express');
const controller = require('../../controllers/general/auditLogController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.get( '/', authenticateUser, authorize( [ 'superAdmin' ] ), controller.getAllAuditLogs );
router.get( '/:logId', authenticateUser, authorize( [ 'superAdmin' ] ), controller.getSingleAuditLog );
router.delete( '/:logId', authenticateUser, authorize( [ 'superAdmin' ] ), controller.deleteAuditLog );
router.get( '/user/:userId', authenticateUser, authorize( [ 'superAdmin' ] ), controller.getAuditLogsByUser );
router.get( '/entity/:entity/:entityId', authenticateUser, authorize( [ 'superAdmin' ] ), controller.getAuditLogsByEntity );

module.exports = router;