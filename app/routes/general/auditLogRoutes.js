const { Router } = require('express');
const controller = require('../../controllers/general/auditLogController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.get( '/', authenticateUser, authorize( [ 'super-admin' ] ), controller.getAllAuditLogs );
router.get( '/:logId', authenticateUser, authorize( [ 'super-admin' ] ), controller.deleteAuditLog );
router.get( '/user/:userId', authenticateUser, authorize( [ 'super-admin' ] ), controller.getAuditLogsByUser );
router.get( '/entity/:entity/:entityId', authenticateUser, authorize( [ 'super-admin' ] ), controller.getAuditLogsByEntity );

module.exports = router;