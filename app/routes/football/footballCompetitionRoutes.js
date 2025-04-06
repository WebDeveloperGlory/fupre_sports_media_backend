const { Router } = require('express');
const controller = require('../../controllers/football/footballCompetitionController');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const { authorize, refactoredHasCompetitionPermissions } = require('../../middlewares/adminMiddleware');

const router = Router();

// Public Routes //
router.get('/', controller.getAllCompetitions);
router.get('/:competitionId', controller.getSingleCompetition);
router.get('/:competitionId/fixtures', controller.getCompetitionFixtures);
router.get('/:competitionId/teams', controller.getCompetitionTeams);
router.get('/:competitionId/teams/:teamId/squad', controller.getCompetitionTeamSquadList);
router.get('/:competitionId/standings', controller.getCompetitionStandings);
router.get('/:competitionId/knockout', controller.getCompetitionKnockouts);
router.get('/:competitionId/groups', controller.getCompetitionGroups);
router.get('/:competitionId/groups/:groupName', controller.getCompetitionSingleGroup);

// Private Routes //
router.post('/', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), controller.createCompetition);
router.put('/:competitionId', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.updateCompetition);
router.put('/:competitionId/status', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.updateCompetitionStatus);
router.put('/:competitionId/feature', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.makeFeatured);
router.put('/:competitionId/admin', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.setCompetitionAdmin);
router.put('/:competitionId/teams/invite', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.inviteTeamsToCompetition);
router.put('/:competitionId/teams/add', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addTeamsToCompetition);
router.put('/:competitionId/teams/:teamId/remove', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.removeTeamFromCompetition);
router.put('/:competitionId/teams/:teamId/squad', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.registerTeamSquadList);
router.put('/:competitionId/initialize-table', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.initializeLeagueTable);
router.post('/:competitionId/fixtures', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addCompetitionFixture);
router.put('/:competitionId/fixtures/:fixtureId', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.updateCompetitionFixtureResult);
router.delete('/:competitionId/fixtures/:fixtureId', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.deleteCompetitionFixture);
router.put('/:competitionId/knockout', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addKnockoutPhases);
router.put('/:competitionId/knockout/fixtures/:fixtureId/add', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addFixturesToKnockoutPhase);
router.put('/:competitionId/knockout/fixtures/:fixtureId/remove', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.removeFixtureFromKonckoutPhase);
router.put('/:competitionId/groups', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addGroupStage);
router.put('/:competitionId/groups/teams/:teamId/add', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addTeamsToGroupStage);
router.put('/:competitionId/groups/teams/:teamId/remove', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.removeTeamFromGroupStage);
router.put('/:competitionId/groups/fixtures/:fixtureId/add', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.addFixturesToGroupStage);
router.put('/:competitionId/groups/fixtures/:fixtureId/remove', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.removeFixtureFromGroupStage);

// Danger Zone //
router.delete('/:competitionId', authenticateUser, authorize([ 'superAdmin', 'sportAdmin' ]), refactoredHasCompetitionPermissions, controller.deleteCompetition);

module.exports = router;