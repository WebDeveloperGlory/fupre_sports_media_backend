import { IV2FootballFixture } from '../../../models/football/Fixture';

export const getTeamFixtureStats = async (
    { fixtures, teamId }: { fixtures: IV2FootballFixture[], teamId: string }
) => {
    const homeStats = { played: 0, wins: 0, draws: 0, losses: 0 };
    const awayStats = { played: 0, wins: 0, draws: 0, losses: 0 };

    const general = {
        shotsOnTarget: 0,
        shotsOffTarget: 0,
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
        offsides: 0,
        corners: 0,
        possessionTime: 0
    };

    const form: string[] = [];

    for (const fixture of fixtures) {
        const isHome = String(fixture.homeTeam) === String(teamId);
        const teamScore = isHome ? fixture.result.homeScore : fixture.result.awayScore;
        const opponentScore = isHome ? fixture.result.awayScore : fixture.result.homeScore;

        // Form record
        if (form.length < 5) {
            if (teamScore > opponentScore) form.push('W');
            else if (teamScore < opponentScore) form.push('L');
            else form.push('D');
        }

        // Win/Draw/Loss
        const targetStats = isHome ? homeStats : awayStats;
        targetStats.played += 1;

        if (teamScore > opponentScore) targetStats.wins += 1;
        else if (teamScore < opponentScore) targetStats.losses += 1;
        else targetStats.draws += 1;

        // General Stats
        const statBlock = isHome ? fixture.statistics.home : fixture.statistics.away;

        general.shotsOnTarget += statBlock.shotsOnTarget || 0;
        general.shotsOffTarget += statBlock.shotsOffTarget || 0;
        general.fouls += statBlock.fouls || 0;
        general.yellowCards += statBlock.yellowCards || 0;
        general.redCards += statBlock.redCards || 0;
        general.offsides += statBlock.offsides || 0;
        general.corners += statBlock.corners || 0;
        general.possessionTime += statBlock.possessionTime || 0;
    }

    return { homeStats, awayStats, form: form.slice(0,5), general }
}