const db = require('../config/db');

const getFixtures = async (fixtures, id) => {
    if (!fixtures.length) return [];

    // Fetch the fixtures
    const fetchedFixtures = await db.Fixture.find({
        _id: { $in: fixtures },
    })
        .sort({ date: -1 }) // Sort by date in descending order
        .populate({
            path: 'homeTeam awayTeam competition',
            select: 'name department level shorthand',
        })
        .select('homeTeam awayTeam competition type status result date');

    // Group fixtures by competition or friendly
    const groupedFixtures = fetchedFixtures.reduce((acc, fixture) => {
        const title = fixture.type === 'friendly' ? 'Friendlies' : fixture.competition.name;

        // Find or create the group for this title
        let group = acc.find((g) => g.title === title);
        if (!group) {
            group = { title, fixtures: [] };
            acc.push(group);
        }

        // Add the fixture to the group
        group.fixtures.push(fixture);
        return acc;
    }, []);

    return groupedFixtures;
};

const getRecentPerformance = async (fixtures, id) => {
    if ( !fixtures.length ) return [ "N/A" ];

    // Fetch the most recent 5 fixtures (played before or at this moment)
    const now = new Date();
    const recentFixtures = await db.Fixture.find({ 
        _id: { $in: fixtures }, 
        date: { $lte: now }, // Fixtures up to and including now
        status: 'completed'
    })
    .sort({ date: -1 }) // Sort by date in descending order (most recent first)
    .limit(5);

    if ( !recentFixtures.length ) return [ "N/A" ]; // Handle no past fixtures

    return recentFixtures.map( ( fixture ) => {
        const { result } = fixture;
        const homeTeam = fixture.homeTeam.equals( id );

        // Handle unplayed fixtures
        if ( result.homeScore === null || result.awayScore === null ) return "N/A";

        if ( homeTeam ) {
            // Determine result for the home team
            if ( result.homePenalty === null || result.awayPenalty === null ) {
                if ( result.homeScore > result.awayScore ) return "W"; // Win
                if ( result.homeScore < result.awayScore ) return "L"; // Loss
                if ( result.homeScore === result.awayScore ) return "D"; // Draw
            } else {
                // Penalty shootout results
                if ( result.homePenalty > result.awayPenalty ) return "W"; // Win
                if ( result.homePenalty < result.awayPenalty ) return "L"; // Loss
            }
            return "D"; // Default to draw
        } else {
            // Determine result for the away team
            if ( result.homePenalty === null || result.awayPenalty === null ) {
                if ( result.awayScore > result.homeScore ) return "W"; // Win
                if ( result.awayScore < result.homeScore ) return "L"; // Loss
                if ( result.awayScore === result.homeScore ) return "D"; // Draw
            } else {
                // Penalty shootout results
                if ( result.awayPenalty > result.homePenalty ) return "W"; // Win
                if ( result.awayPenalty < result.homePenalty ) return "L"; // Loss
            }
        }
    });
};

const calculateRecord = async ( fixtures, id ) => {
    if ( !fixtures.length ) return { wins: 0, losses: 0, draws: 0 };

    const allFixtures = await db.Fixture.find({ _id: { $in: fixtures }, status: "completed" });
    let wins = 0;
    let draws = 0;
    let loss = 0;

    allFixtures.map( fixture => {
        const { result } = fixture;
        const homeTeam = fixture.homeTeam.equals( id );

        if( homeTeam ) {
            // Determine result for the home team
            if ( result.homePenalty === null || result.awayPenalty === null ) {
                if ( result.homeScore > result.awayScore ) return wins += 1;
                if ( result.homeScore < result.awayScore ) return loss += 1;
                if ( result.homeScore === result.awayScore ) return draws += 1;
            } else {
                // Penalty shootout results
                if ( result.homePenalty > result.awayPenalty ) return wins += 1;
                if ( result.homePenalty < result.awayPenalty ) return loss += 1;
            }
        } else {
            // Determine result for the away team
            if ( result.homePenalty === null || result.awayPenalty === null ) {
                if ( result.awayScore > result.homeScore ) return wins += 1;
                if ( result.awayScore < result.homeScore ) return loss += 1;
                if ( result.awayScore === result.homeScore ) return draws += 1;
            } else {
                // Penalty shootout results
                if ( result.awayPenalty > result.homePenalty ) return wins += 1;
                if ( result.awayPenalty < result.homePenalty ) return loss += 1;
            }
        }
    })

    const record = { wins, loss, draws }

    return record;
};

// Helper to shuffle an array
const shuffleArray = (array) => {
    return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const getTopStats = async ({ teamId, year }) => {
    const team = await db.Team.findById(teamId).populate({
        path: 'players',
        populate: [
            {
                path: 'generalRecord',
                match: { year: year },
                select: 'goals assists yellowCards redCards'
            },
            {
                path: 'competitionStats',
                match: { year: year },
                select: 'goals assists yellowCards redCards'
            }
        ]
    });

    const stats = team.players.map(player => {
        const generalYearStats = player.generalRecord.find(record => record.year === year) || {};
        const competitionYearStats = player.competitionStats.find(stat => stat.year === year) || {};

        return {
            name: player.name,
            position: player.position,
            totalGoals: (generalYearStats.goals || 0) + (competitionYearStats.goals || 0),
            totalAssists: (generalYearStats.assists || 0) + (competitionYearStats.assists || 0),
            totalYellowCards: (generalYearStats.yellowCards || 0) + (competitionYearStats.yellowCards || 0),
            totalRedCards: (generalYearStats.redCards || 0) + (competitionYearStats.redCards || 0)
        };
    });

    const sortByStat = (stat) => 
        stats.sort((a, b) => b[stat] - a[stat]).slice(0, 4);

    return {
        topScorers: sortByStat('totalGoals'),
        topAssisters: sortByStat('totalAssists'),
        topYellowCards: sortByStat('totalYellowCards'),
        topRedCards: sortByStat('totalRedCards')
    };
};

const getNextFixture = async ( teamId, currentDate = new Date() ) => {
    const nextFixture = await db.Fixture.findOne({
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ],
        date: { $gt: currentDate },
        status: 'upcoming'
    })
    .sort({ date: 1 })
    .limit( 1 )
    .populate({ 
        path: 'homeTeam awayTeam competition',
        select: 'name department level shorthand'
    })
    .select('homeTeam awayTeam competition type date stadium');

    return nextFixture || null;
}

/**
 * Helper function to aggregate team stats for a competition.
 * @param {Object} competition - The competition document.
 * @param {String} statType - 'total' or 'average'.
 * @returns {Object} An object containing aggregated team stats.
 */
const getTeamStatsHelper = async ( competition, statType = 'total' ) => {
    // Initialize team stats
    const teamStats = competition.teams.reduce((acc, teamEntry) => {
        acc[ teamEntry.team._id ] = {
            teamName: teamEntry.team.name,
            goalsScored: 0,
            goalsConceded: 0,
            cleanSheets: 0,
            shots: 0,
            shotsOnTarget: 0,
            shotsOffTarget: 0,
            corners: 0,
            offsides: 0,
            yellowCards: 0,
            redCards: 0,
            matchesPlayed: 0
        };
        return acc;
    }, {});

    // Aggregate stats from match statistics
    for (const fixture of competition.fixtures) {
        const matchStats = await db.MatchStatistic.findOne({ fixture: fixture._id });

        if (!matchStats || fixture.status !== 'completed') continue;

        const homeTeamId = String(fixture.homeTeam);
        const awayTeamId = String(fixture.awayTeam);

        if (teamStats[homeTeamId]) {
            teamStats[homeTeamId].goalsScored += fixture.result.homeScore || 0;
            teamStats[homeTeamId].goalsConceded += fixture.result.awayScore || 0;
            teamStats[homeTeamId].cleanSheets += fixture.result.awayScore === 0 ? 1 : 0;
            teamStats[homeTeamId].shots += matchStats.home.shotsOnTarget + matchStats.home.shotsOffTarget;
            teamStats[homeTeamId].shotsOnTarget += matchStats.home.shotsOnTarget;
            teamStats[homeTeamId].shotsOffTarget += matchStats.home.shotsOffTarget;
            teamStats[homeTeamId].corners += matchStats.home.corners;
            teamStats[homeTeamId].offsides += matchStats.home.offsides;
            teamStats[homeTeamId].yellowCards += matchStats.home.yellowCards;
            teamStats[homeTeamId].redCards += matchStats.home.redCards;
            teamStats[homeTeamId].matchesPlayed++;
        }

        if (teamStats[awayTeamId]) {
            teamStats[awayTeamId].goalsScored += fixture.result.awayScore || 0;
            teamStats[awayTeamId].goalsConceded += fixture.result.homeScore || 0;
            teamStats[awayTeamId].cleanSheets += fixture.result.homeScore === 0 ? 1 : 0;
            teamStats[awayTeamId].shots += matchStats.away.shotsOnTarget + matchStats.away.shotsOffTarget;
            teamStats[awayTeamId].shotsOnTarget += matchStats.away.shotsOnTarget;
            teamStats[awayTeamId].shotsOffTarget += matchStats.away.shotsOffTarget;
            teamStats[awayTeamId].corners += matchStats.away.corners;
            teamStats[awayTeamId].offsides += matchStats.away.offsides;
            teamStats[awayTeamId].yellowCards += matchStats.away.yellowCards;
            teamStats[awayTeamId].redCards += matchStats.away.redCards;
            teamStats[awayTeamId].matchesPlayed++;
        }
    }

    // Compute averages if requested
    if (statType === 'average') {
        for (const teamId in teamStats) {
            const matchesPlayed = teamStats[teamId].matchesPlayed || 1; // Avoid division by 0
            for (const stat in teamStats[teamId]) {
                if (stat !== 'teamName' && stat !== 'matchesPlayed') {
                    teamStats[teamId][stat] = parseFloat((teamStats[teamId][stat] / matchesPlayed).toFixed(2));
                }
            }
        }
    }

    return teamStats;
};

module.exports = { getRecentPerformance, calculateRecord, shuffleArray, getTopStats, getNextFixture, getFixtures, getTeamStatsHelper }