const { Router } = require('express');
const controller = require('../../controllers/general/notificationController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

router.get( '/', controller.getUserNotifications );
router.post( '/', authenticateUser, controller.createNotification );
router.delete( '/', authenticateUser, controller.deleteNotification );
router.get( '/stats', authenticateUser, controller.getNotificationStats );
router.post( '/all', authenticateUser, authorize([ 'superAdmin' ]), controller.adminSendNotificationToAll );
router.put( '/read-all', authenticateUser, controller.markAllNotificationsRead );
router.put( '/:notificationId/status', authenticateUser, controller.updateNotificationStatus );
router.put( '/:notificationId/read', authenticateUser, controller.markNotificationRead );

module.exports = router;