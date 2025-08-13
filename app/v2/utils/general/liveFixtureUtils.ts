import db from "../../config/db";
import { IV2FootballLiveFixture } from "../../models/football/LiveFixture";
import { FixtureResult, FixtureStatus } from "../../types/fixture.enums";
import { ILeagueStandings, IV2FootballCompetition } from "../../models/football/Competition";
import { IV2FootballFixture } from "../../models/football/Fixture";
import { CompetitionTeamForm } from "../../types/competition.enums";

async function updateFixtureDocument(
    { liveFixture }: { liveFixture: IV2FootballLiveFixture }
) {
    const fixtureUpdates = {
        status: FixtureStatus.COMPLETED,
        result: liveFixture.result,
        goalScorers: liveFixture.goalScorers,
        statistics: liveFixture.statistics,
        lineups: liveFixture.lineups,
        substitutions: liveFixture.substitutions,
        timeline: liveFixture.timeline,
        commentary: liveFixture.commentary,
        playerOfTheMatch: liveFixture.playerOfTheMatch,
        playerRatings: liveFixture.playerRatings,
        referee: liveFixture.referee,
        attendance: liveFixture.attendance,
        weather: liveFixture.weather,
        highlights: liveFixture.streamLinks,
        odds: liveFixture.odds,
        updatedAt: new Date()
    };

    return await db.V2FootballFixture.findByIdAndUpdate(
        liveFixture.fixture,
        fixtureUpdates,
        { new: true }
    );
}

function safeUpdateStanding(
    { standing, goalsFor, goalsAgainst, pointsSystem }:
    {
        standing: ILeagueStandings;
        goalsFor: number;
        goalsAgainst: number;
        pointsSystem: { win: number; draw: number; loss: number };
    }
) {
    if (!Array.isArray(standing.form)) standing.form = [];

    standing.played += 1;
    standing.goalsFor += goalsFor;
    standing.goalsAgainst += goalsAgainst;
    standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

    if (goalsFor > goalsAgainst) {
        standing.wins += 1;
        standing.points += pointsSystem.win;
        standing.form.push(CompetitionTeamForm.WIN);
    } else if (goalsFor < goalsAgainst) {
        standing.losses += 1;
        standing.points += pointsSystem.loss;
        standing.form.push(CompetitionTeamForm.LOSS);
    } else {
        standing.draws += 1;
        standing.points += pointsSystem.draw;
        standing.form.push(CompetitionTeamForm.DRAW);
    }

    if (standing.form.length > 5) standing.form.shift();

    return standing; // still a mongoose doc
}

function sortStandings(a: ILeagueStandings, b: ILeagueStandings) {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return 0;
}

async function updateLeagueStandings(
    { competition, fixture }: { competition: IV2FootballCompetition; fixture: IV2FootballFixture }
) {
    const { homeTeam, awayTeam, result } = fixture;
    const { homeScore, awayScore } = result;

    const pointsSystem = competition.format.leagueStage?.pointsSystem ?? { win: 3, draw: 1, loss: 0 };

    if (Array.isArray(competition.leagueTable) && competition.leagueTable.length) {
        competition.leagueTable = competition.leagueTable.map(standing => {
            if (standing.team.toString() === homeTeam.toString()) {
                return safeUpdateStanding({ standing, goalsFor: homeScore, goalsAgainst: awayScore, pointsSystem });
            }
            if (standing.team.toString() === awayTeam.toString()) {
                return safeUpdateStanding({ standing, goalsFor: awayScore, goalsAgainst: homeScore, pointsSystem });
            }
            return standing;
        });

        competition.leagueTable.sort(sortStandings);
        competition.leagueTable.forEach((standing, idx) => standing.position = idx + 1);
    }

    await competition.save();
}

async function updateGroupStageStandings(
    { competition, fixture }: { competition: IV2FootballCompetition; fixture: IV2FootballFixture }
) {
    const { homeTeam, awayTeam, result, _id: fixtureId } = fixture;
    const { homeScore, awayScore } = result;

    const pointsSystem = competition.format.leagueStage?.pointsSystem
        ?? competition.format.leagueStage?.pointsSystem
        ?? { win: 3, draw: 1, loss: 0 };

    if (Array.isArray(competition.groupStage) && competition.groupStage.length) {
        competition.groupStage = competition.groupStage.map(group => {
            if (!group.fixtures.some(fId => fId.toString() === fixtureId.toString())) {
                return group;
            }

            const updatedGroup = group;
            updatedGroup.standings = updatedGroup.standings.map(standing => {
                if (standing.team.toString() === homeTeam.toString()) {
                    return safeUpdateStanding({ standing, goalsFor: homeScore, goalsAgainst: awayScore, pointsSystem });
                }
                if (standing.team.toString() === awayTeam.toString()) {
                    return safeUpdateStanding({ standing, goalsFor: awayScore, goalsAgainst: homeScore, pointsSystem });
                }
                return standing;
            });

            updatedGroup.standings.sort(sortStandings);
            updatedGroup.standings.forEach((standing, idx) => standing.position = idx + 1);

            return updatedGroup;
        });

        competition.markModified('groupStage');
    }

    await competition.save();
}

async function updatePlayerStats(
    { liveFixture, competition }: { liveFixture: IV2FootballLiveFixture, competition: IV2FootballCompetition }
) {
    const playersToUpdate = new Set<string>();
    const goalScorers = liveFixture.goalScorers || [];
    const timelineEvents = liveFixture.timeline || [];

    // Collect all players who participated
    [
        ...liveFixture.lineups.home.startingXI,
        ...liveFixture.lineups.home.substitutes,
        ...liveFixture.lineups.away.startingXI,
        ...liveFixture.lineups.away.substitutes
    ].forEach(player => {
        playersToUpdate.add(player.player.toString());
    });

    // // Process goal scorers and assist providers
    // for (const goal of goalScorers) {
    //     playersToUpdate.add(goal.player.toString());
    // }

    // for (const event of timelineEvents) {
    //     if (event.type === 'goal' && event.relatedPlayer) {
    //         playersToUpdate.add(event.relatedPlayer.toString());
    //     }
    // }

    // Update each player's stats
    for (const playerId of playersToUpdate) {
        const player = await db.V2FootballPlayer.findById(playerId);
        if (!player) continue;

        // Update career stats
        player.careerStats.appearances += 1;
        
        // Update goals
        const goals = goalScorers.filter(g => g.player.toString() === playerId).length;
        player.careerStats.goals += goals;
        
        // Update assists
        const assists = timelineEvents.filter(e => 
            e.type === 'goal' && 
            e.relatedPlayer?.toString() === playerId
        ).length;
        player.careerStats.assists += assists;
        
        // Update clean sheets (for goalkeepers/defenders who played full match)
        // Implementation depends on position and substitution data
        
        // Update competition stats
        const compStats = player.competitionStats.find(
            s => s.competition.toString() === liveFixture.competition.toString()
        );
        
        if (compStats) {
            compStats.appearances += 1;
            compStats.goals += goals;
            compStats.assists += assists;
            compStats.minutesPlayed += 90; // Simplified
        } 
        // else {
        //     player.competitionStats.push({
        //         competition: liveFixture.competition,
        //         season: competition.season,
        //         team: player.currentTeam, // Need to determine which team they played for
        //         appearances: 1,
        //         goals,
        //         assists,
        //         yellowCards: 0,
        //         redCards: 0,
        //         minutesPlayed: 90,
        //         position: player.primaryPosition
        //     });
        // }

        await player.save();
    }
}

async function updateTeamStats(
    { liveFixture, result } : { liveFixture: IV2FootballLiveFixture, result: FixtureResult }
) {
    const homeTeam = await db.V2FootballTeam.findById(liveFixture.homeTeam);
    const awayTeam = await db.V2FootballTeam.findById(liveFixture.awayTeam);
    if (!homeTeam || !awayTeam) return;

    // Update home team stats
    homeTeam.stats.matchesPlayed += 1;
    homeTeam.stats.goalsFor += result.homeScore;
    homeTeam.stats.goalsAgainst += result.awayScore;
    
    if (result.homeScore > result.awayScore) {
        homeTeam.stats.wins += 1;
    } else if (result.homeScore < result.awayScore) {
        homeTeam.stats.losses += 1;
    } else {
        homeTeam.stats.draws += 1;
    }
    
    if (result.awayScore === 0) {
        homeTeam.stats.cleanSheets += 1;
    }

    // Update away team stats
    awayTeam.stats.matchesPlayed += 1;
    awayTeam.stats.goalsFor += result.awayScore;
    awayTeam.stats.goalsAgainst += result.homeScore;
    
    if (result.awayScore > result.homeScore) {
        awayTeam.stats.wins += 1;
    } else if (result.awayScore < result.homeScore) {
        awayTeam.stats.losses += 1;
    } else {
        awayTeam.stats.draws += 1;
    }
    
    if (result.homeScore === 0) {
        awayTeam.stats.cleanSheets += 1;
    }

    await Promise.all([
        homeTeam.save(),
        awayTeam.save()
    ]);
}

async function updateCompetitionStats(
    { competition, fixture }: { competition: IV2FootballCompetition, fixture: IV2FootballFixture }
) {
    // Update after fixture is saved
    const stats = await db.V2FootballFixture.aggregate([
        { $match: { competition: competition._id, status: FixtureStatus.COMPLETED } },
        {
            $group: {
                _id: null,
                totalGoals: { $sum: { $add: ["$result.homeScore", "$result.awayScore"] } },
                totalAttendance: { $sum: "$attendance" },
                matches: { $sum: 1 }
            }
        }
    ]);

    if (stats.length) {
        const { totalGoals, totalAttendance, matches } = stats[0];
        competition.stats.averageGoalsPerMatch = matches ? totalGoals / matches : 0;
        competition.stats.averageAttendance = matches ? totalAttendance / matches : 0;
    }

    // Update top scorers
    for (const scorer of fixture.goalScorers) {
        const existing = competition.stats.topScorers.find(
            s => s.player.toString() === scorer.player.toString()
        );
        
        if (existing) {
            existing.goals = (Number(existing.goals) + 1);
        } else {
            competition.stats.topScorers.push({
                player: scorer.player,
                team: scorer.team,
                goals: 1,
                penalties: 0
            });
        }
    }

    await competition.save();
}

function updateStanding(
    { standing, goalsFor, goalsAgainst, pointsSystem, isHome }:
    {
        standing: ILeagueStandings,
        goalsFor: number,
        goalsAgainst: number,
        pointsSystem: { win: number; draw: number; loss: number },
        isHome: boolean
    }
) {
    const updated = { ...standing };
    
    updated.played += 1;
    updated.goalsFor += goalsFor;
    updated.goalsAgainst += goalsAgainst;
    updated.goalDifference = updated.goalsFor - updated.goalsAgainst;

    if (goalsFor > goalsAgainst) {
        updated.wins += 1;
        updated.points += pointsSystem.win;
        updated.form.push(CompetitionTeamForm.WIN);
    } else if (goalsFor < goalsAgainst) {
        updated.losses += 1;
        updated.points += pointsSystem.loss;
        updated.form.push(CompetitionTeamForm.LOSS);
    } else {
        updated.draws += 1;
        updated.points += pointsSystem.draw;
        updated.form.push(CompetitionTeamForm.DRAW);
    }

    // Keep only last 5 form entries
    if (updated.form.length > 5) updated.form.shift();
    
    return updated;
}

const liveFixtureHelperFunctions = {
    updateFixtureDocument,
    updateLeagueStandings,
    updateGroupStageStandings,
    updateCompetitionStats,
    updatePlayerStats,
    updateTeamStats,
    updateStanding,
    sortStandings,

}

export default liveFixtureHelperFunctions;