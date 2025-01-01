const db = require('../config/db');

const getRecentPerformance = async (fixtures, id) => {
    if ( !fixtures.length ) return [ "N/A" ];

    // Fetch the most recent 5 fixtures (played before or at this moment)
    const now = new Date();
    const recentFixtures = await db.Fixture.find({ 
        _id: { $in: fixtures }, 
        date: { $lte: now } // Fixtures up to and including now
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

module.exports = { getRecentPerformance, calculateRecord, shuffleArray }