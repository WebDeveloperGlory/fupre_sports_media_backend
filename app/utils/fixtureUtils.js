const db = require('../config/db');

const getTeamWins = async ( fixtures, teamId ) => {
    const homeWins = ({ result }) => ( result.homeScore > result.awayScore ) || ( result.homePenalty > result.awayPenalty );
    const awayWins = ({ result }) => ( result.homeScore < result.awayScore ) || ( result.homePenalty < result.awayPenalty );

    let wins = 0;
    let draws = 0;
    let losses = 0;

    fixtures.map( fixture => {
        const isHome = fixture.homeTeam._id.equals( teamId );

        if( !homeWins( fixture ) && !awayWins( fixture ) ) return draws += 1;

        if( isHome ) {
            homeWins( fixture ) ? wins += 1 : losses += 1;
        } else {
            awayWins( fixture ) ? wins += 1 : losses += 1;
        }
    });

    return { wins, draws, losses };
};

module.exports = { getTeamWins };