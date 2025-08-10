import { Router } from "express";
import { authenticateUser } from '../../middlewares/general/authMiddleware';
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { cloneCompetitionForNewSeason, createCompetition, getAllCompetitions, getCompetitiionLeagueTable, getCompetitionById, getCompetitiionKnockoutRounds, getCompetitiionGroups, getCompetitiionTeamsAndSquadList, getCompetitiionFixtures, getCompetitiionStats, updateCompetitionStatus, updateCompetitionInfo, registerCompetitionTeam, unregisterCompetitionTeam, registerCompetitionTeamSquad, createCompetitionLeagueTable, createCompetitionGroup, createCompetitionKnockoutRound, deleteCompetitionGroup, deleteCompetitionKnockoutRound, updateCompetitionTeamStandings, createCompetitionFixture, updateCompetitionFixture, updateCompetitionFixtureResult, updateCompetitionRules, updateCompetitionFormat, addCompetitionAdditionalRule, removeCompetitionAdditionalRule, addCompetitionSponsor, removeCompetitionSponsor, addPlayerAwards, removePlayerAwards, addTeamAwards, removeTeamAwards, setCompetitionAdmin, setCompetitionActiveStatus, makeCompetitionFeatured, deleteCompetition } from "../../controllers/football/competitionController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllCompetitions);
router.get('/:competitionId', getCompetitionById);
router.get('/:competitionId/league-table', getCompetitiionLeagueTable);
router.get('/:competitionId/knockout', getCompetitiionKnockoutRounds);
router.get('/:competitionId/group', getCompetitiionGroups);
router.get('/:competitionId/team', getCompetitiionTeamsAndSquadList);
router.get('/:competitionId/fixture', getCompetitiionFixtures);
router.get('/:competitionId/stat', getCompetitiionStats);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/', authenticateUser, isSuperAdmin, createCompetition);
router.post('/:competitionId/clone', authenticateUser, isSuperAdmin, cloneCompetitionForNewSeason);

router.put('/:competitionId/status/general', authenticateUser, isSuperAdmin, updateCompetitionStatus);
router.put('/:competitionId/info', authenticateUser, isSuperAdmin, updateCompetitionInfo);
router.put('/:competitionId/team/register', authenticateUser, isSuperAdmin, registerCompetitionTeam);
router.put('/:competitionId/team/unregister', authenticateUser, isSuperAdmin, unregisterCompetitionTeam);
router.put('/:competitionId/team/standings', authenticateUser, isSuperAdmin, updateCompetitionTeamStandings);
router.put('/:competitionId/team/squad', authenticateUser, isSuperAdmin, registerCompetitionTeamSquad);
router.put('/:competitionId/league-table', authenticateUser, isSuperAdmin, createCompetitionLeagueTable);
router.put('/:competitionId/group', authenticateUser, isSuperAdmin, createCompetitionGroup);
router.put('/:competitionId/knockout', authenticateUser, isSuperAdmin, createCompetitionKnockoutRound);
router.delete('/:competitionId/group/groupName', authenticateUser, isSuperAdmin, deleteCompetitionGroup);
router.delete('/:competitionId/knockout/roundName', authenticateUser, isSuperAdmin, deleteCompetitionKnockoutRound);

router.put('/:competitionId/fixture', authenticateUser, isSuperAdmin, createCompetitionFixture);
router.put('/:competitionId/fixture/update', authenticateUser, isSuperAdmin, updateCompetitionFixture);
router.put('/:competitionId/fixture/result', authenticateUser, isSuperAdmin, updateCompetitionFixtureResult);

router.put('/:competitionId/rule', authenticateUser, isSuperAdmin, updateCompetitionRules);
router.put('/:competitionId/format', authenticateUser, isSuperAdmin, updateCompetitionFormat);
router.put('/:competitionId/additional-rule', authenticateUser, isSuperAdmin, addCompetitionAdditionalRule);
router.delete('/:competitionId/additional-rule', authenticateUser, isSuperAdmin, removeCompetitionAdditionalRule);
router.put('/:competitionId/sponsor', authenticateUser, isSuperAdmin, addCompetitionSponsor);
router.delete('/:competitionId/sponsor', authenticateUser, isSuperAdmin, removeCompetitionSponsor);
router.put('/:competitionId/award/player', authenticateUser, isSuperAdmin, addPlayerAwards);
router.delete('/:competitionId/award/player', authenticateUser, isSuperAdmin, removePlayerAwards);
router.put('/:competitionId/award/team', authenticateUser, isSuperAdmin, addTeamAwards);
router.delete('/:competitionId/award/team', authenticateUser, isSuperAdmin, removeTeamAwards);
router.put('/:competitionId/admin', authenticateUser, isSuperAdmin, setCompetitionAdmin);
router.put('/:competitionId/status/active', authenticateUser, isSuperAdmin, setCompetitionActiveStatus);
router.put('/:competitionId/feature', authenticateUser, isSuperAdmin, makeCompetitionFeatured);
router.delete('/:competitionId', authenticateUser, isSuperAdmin, deleteCompetition);
// END OF ADMIN ROUTES //

export default router;