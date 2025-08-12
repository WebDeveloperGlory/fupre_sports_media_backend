import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin, hasLiveFixturePermissions, hasCommentaryPermissions, hasRatingPermissions } from "../../middlewares/general/adminMiddleware";
import { getAllLiveFixtures, getLiveFixtureById, getLiveFixtureTeamPlayers, updateLiveFixtureStatus, updateLiveFixtureStatistics, updateLiveFixtureLineup, createTimeLineEvent, editTimelineEvent, deleteTimelineEvent, addSubstitution, updateSubstitution, removeSubstitution, updateFixtureScore, addGoalScorer, removeGoalScorer, updateOfficialPOTM, updateOfficialPlayerRatings, generalUpdates, updateTime, submitUserPlayerRating, submitUserPOTMVote, handleTeamCheer, initializeLiveFixture, endCompetitionLiveFixture } from "../../controllers/football/liveFixtureController";

const router = Router();

// USER ROUTES //
router.put('/:fixtureId/user/cheer/unofficial', handleTeamCheer);
router.put('/:fixtureId/user/cheeer/official', authenticateUser, handleTeamCheer);
router.put('/:fixtureId/user/player-rating/submit', submitUserPlayerRating);
router.put('/:fixtureId/user/potm/submit', authenticateUser, submitUserPOTMVote);
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllLiveFixtures);
router.get('/:fixtureId', getLiveFixtureById);
router.get('/:fixtureId/players', getLiveFixtureTeamPlayers);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/', authenticateUser, isSuperAdmin, initializeLiveFixture);
router.post('/:fixtureId/end', authenticateUser, isSuperAdmin, endCompetitionLiveFixture);

router.put('/:fixtureId/status/update', authenticateUser, hasLiveFixturePermissions, updateLiveFixtureStatus);
router.put('/:fixtureId/stats/update', authenticateUser, hasLiveFixturePermissions, updateLiveFixtureStatistics);
router.put('/:fixtureId/lineups/update', authenticateUser, hasLiveFixturePermissions, updateLiveFixtureLineup);
router.put('/:fixtureId/score/update', authenticateUser, hasLiveFixturePermissions, updateFixtureScore);
router.put('/:fixtureId/general/update', authenticateUser, hasLiveFixturePermissions, generalUpdates);
router.put('/:fixtureId/time/update', authenticateUser, hasLiveFixturePermissions, updateTime);

router.put('/:fixtureId/timeline/add', authenticateUser, hasLiveFixturePermissions, createTimeLineEvent);
router.put('/:fixtureId/timeline/edit', authenticateUser, hasLiveFixturePermissions, editTimelineEvent);
router.put('/:fixtureId/timeline/delete', authenticateUser, hasLiveFixturePermissions, deleteTimelineEvent);
router.put('/:fixtureId/substitution/add', authenticateUser, hasLiveFixturePermissions, addSubstitution);
router.put('/:fixtureId/substitution/edit', authenticateUser, hasLiveFixturePermissions, updateSubstitution);
router.put('/:fixtureId/substitution/delete', authenticateUser, hasLiveFixturePermissions, removeSubstitution);
router.put('/:fixtureId/goalscorer/add', authenticateUser, hasLiveFixturePermissions, addGoalScorer);
router.put('/:fixtureId/goalscorer/delete', authenticateUser, hasLiveFixturePermissions, removeGoalScorer);

router.put('/:fixtureId/admin/potm/submit', authenticateUser, hasRatingPermissions, updateOfficialPOTM);
router.put('/:fixtureId/admin/player-rating/submit', authenticateUser, hasRatingPermissions, updateOfficialPlayerRatings);
// END OF ADMIN ROUTES //

export default router;