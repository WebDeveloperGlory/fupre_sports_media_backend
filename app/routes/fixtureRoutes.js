const { Router } = require('express');
const controller = require('../controllers/fixtureController');

const router = Router();

router.get( '/', controller.getAllFixtures );
router.post( '/', controller.createFixture );
router.get( '/:fixtureId', controller.getOneFixture );
router.patch( '/:fixtureId', controller.updateFixture );
router.get( '/:fixtureId/form', controller.getTeamFixtureTeamFormAndMatchData );
router.put( '/:fixtureId/result', controller.updateFixtureResult );
router.put( '/:fixtureId/formation', controller.updateFixtureFormation );

module.exports = router;