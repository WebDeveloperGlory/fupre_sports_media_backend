const { Router } = require('express');
const controller = require('../../controllers/football/footballFixtureController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/adminMiddleware');

const router = Router();

// Public Routes //
router.get('/', controller.getAllFixtures);
router.get('/:fixtureId', controller.getOneFixture);
router.get('/teams/:teamId', controller.getTeamFixtures);

// Private Routes //
router.post('/', authenticateUser, authorize([ 'superAdmin' ]), controller.createFriendlyFixture);
router.put('/:fixtureId', authenticateUser, authorize([ 'superAdmin' ]), controller.updateFixture);
router.put('/:fixtureId/status', authenticateUser, authorize([ 'superAdmin' ]), controller.updateFixtureStatus);
router.put('/:fixtureId/formation', authenticateUser, authorize([ 'superAdmin' ]), controller.updateFixtureFormation);
router.put('/:fixtureId/result', authenticateUser, authorize([ 'superAdmin' ]), controller.updateFixtureResult);

// Danger Zone //
router.delete('/:fixtureId', authenticateUser, authorize([ 'superAdmin' ]), controller.deleteFriendlyFixture);

module.exports = router;