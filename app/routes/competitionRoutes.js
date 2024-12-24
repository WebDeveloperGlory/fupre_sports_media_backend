const { Router } = require('express');
const controller = require('../controllers/competitionController');

const router = Router();

router.get( '/', controller.getAllCompetitions );
router.post( '/', controller.createCompetition );
router.get( '/:competitionId', controller.getSingleCompetition );
router.patch( '/:competitionId', controller.updateCompetition );
router.put( '/:competitionId/invite-teams', controller.inviteTeamsToCompetition );
router.put( '/:competitionId/add-teams', controller.addTeamsToCompetition );
router.put( '/:competitionId/admin', controller.updateCompetitionAdmin );
router.post( '/:competitionId/fixtures', controller.addCompetitionFixture );

module.exports = router;