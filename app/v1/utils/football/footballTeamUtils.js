const db = require('../../config/db');

const calculateTeamStats = async( fixtures, teamId ) => {
    const stats = {
        played: fixtures.length,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        cleanSheets: 0,
        shotsOnTarget: 0,
        shotsBlocked: 0,
        shotsOffTarget: 0,
        corners: 0,
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
        homeRecord: { played: 0, wins: 0, draws: 0, losses: 0 },
        awayRecord: { played: 0, wins: 0, draws: 0, losses: 0 }
    };

    fixtures.forEach(fixture => {
        const isHome = fixture.homeTeam._id?.toString() === teamId.toString() || 
                fixture.homeTeam?.toString() === teamId.toString();
        const result = getMatchResult( fixture, teamId );
        const scoreData = getTeamScores( fixture, teamId );
        
        // Update basic stats
        if ( result === 'win' ) stats.wins++;
        else if ( result === 'draw' || result === 'unknown' ) stats.draws++;
        else stats.losses++;
        
        stats.goalsScored += scoreData.scored;
        stats.goalsConceded += scoreData.conceded;
        
        if ( scoreData.conceded === 0 ) stats.cleanSheets++;
        
        // Update home/away record
        if ( isHome ) {
            stats.homeRecord.played++;
            if ( result === 'win' ) stats.homeRecord.wins++;
            else if ( result === 'draw' || result === 'unknown' ) stats.homeRecord.draws++;
            else stats.homeRecord.losses++;
        } else {
            stats.awayRecord.played++;
            if ( result === 'win' ) stats.awayRecord.wins++;
            else if ( result === 'draw' || result === 'unknown' ) stats.awayRecord.draws++;
            else stats.awayRecord.losses++;
        }
        
        // Add match statistics if available
        if ( fixture.statistics ) {
            const teamSide = isHome ? 'home' : 'away';
            const statObj = fixture.statistics;
            
            stats.shotsOnTarget += statObj[ teamSide ].shotsOnTarget || 0;
            stats.shotsBlocked += statObj[ teamSide ].shotsBlocked || 0;
            stats.shotsOffTarget += statObj[ teamSide ].shotsOffTarget || 0;
            stats.corners += statObj[ teamSide ].corners || 0;
            stats.fouls += statObj[ teamSide ].fouls || 0;
            stats.yellowCards += statObj[ teamSide ].yellowCards || 0;
            stats.redCards += statObj[ teamSide ].redCards || 0;
        }
    });

    // Calculate averages and percentages
    stats.winPercentage = stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(2) : 0;
    stats.averageGoalsScored = stats.played > 0 ? (stats.goalsScored / stats.played).toFixed(2) : 0;
    stats.averageGoalsConceded = stats.played > 0 ? (stats.goalsConceded / stats.played).toFixed(2) : 0;
    stats.points = ( stats.wins * 3 ) + stats.draws;
    
    return stats;
}

// Get team form (last 5 games)
const getTeamForm = ( fixtures, teamId ) => {
    // Return N/A if no fixtures
    if ( !fixtures || fixtures.length === 0 ) {
        return ['N/A'];
    }
    
    // Get the last 5 matches (or fewer if not available)
    const recentFixtures = fixtures.slice( 0, 5 );
    
    // Map results to W, D, L
    return recentFixtures.map(fixture => {
        const result = this.getMatchResult( fixture, teamId );
        
        if ( result === 'win' ) return 'W';
        if ( result === 'draw' ) return 'D';
        if ( result === 'loss' ) return 'L';
        return 'N/A';
    });
}

// Process player statistics from a fixture
const processPlayerStatsFromFixture = ( fixture, teamId, playerStats ) => {
    const isHome = fixture.homeTeam._id?.toString() === teamId.toString() || 
                  fixture.homeTeam?.toString() === teamId.toString();
    const lineupField = isHome ? 'homeLineup' : 'awayLineup';
    
    // Process starting lineup
    if ( fixture[ lineupField ] && fixture[ lineupField ].startingXI ) {
        fixture[ lineupField ].startingXI.forEach( playerId => {
            const playerIdStr = playerId.toString();

            if ( playerStats[ playerIdStr ] ) {
                playerStats[ playerIdStr ].appearances++;
                // Assume full match if no substitution event
                playerStats[ playerIdStr ].minutesPlayed += 90;
            }
        });
    }
    
    // Process match events
    if ( fixture.matchEvents && fixture.matchEvents.length > 0 ) {
        fixture.matchEvents.forEach( event => {
            if ( !event.player || !event.team ) return;
            
            // Only process events for this team
            if ( event.team.toString() !== teamId.toString() ) return;
            
            const playerId = event.player.toString();
            if ( !playerStats[ playerId ] ) return;
            
            switch ( event.eventType ) {
                case 'goal':
                    playerStats[ playerId ].goals++;
                    break;
                case 'ownGoal':
                    playerStats[ playerId ].ownGoals++;
                    break;
                case 'assist':
                    playerStats[ playerId ].assists++;
                    break;
                case 'yellowCard':
                    playerStats[ playerId ].yellowCards++;
                    break;
                case 'redCard':
                    playerStats[ playerId ].redCards++;
                    break;
                case 'substitution':
                    // Adjust minutes played for the subbed player
                    if ( event.player && playerStats[ playerId ] ) {
                        playerStats[ playerId ].minutesPlayed -= (90 - event.time);
                    }
                    // Adjust minutes played for the player coming on
                    if ( event.substitutedFor ) {
                        const subPlayerIdStr = event.substitutedFor.toString();

                        if ( playerStats[ subPlayerIdStr ] ) {
                            playerStats[ subPlayerIdStr ].appearances++;
                            playerStats[ subPlayerIdStr ].minutesPlayed += (90 - event.time);
                        }
                    }
                    break;
                }
        });
    }
}

// Get match result from team's perspective
const getMatchResult = ( fixture, teamId ) => {
    const isHome = fixture.homeTeam._id?.toString() === teamId.toString() || 
                  fixture.homeTeam?.toString() === teamId.toString();
    
    if ( !fixture.result || fixture.result.homeScore === null || fixture.result.awayScore === null ) {
        return 'unknown';
    }
    
    const teamScore = isHome ? fixture.result.homeScore : fixture.result.awayScore;
    const opponentScore = isHome ? fixture.result.awayScore : fixture.result.homeScore;
    
    if ( teamScore > opponentScore ) return 'win';
    if ( teamScore < opponentScore ) return 'loss';
    return 'draw';
}

// Get score string from team's perspective (e.g. "2-1" or "0-3")
const getScoreString = ( fixture, teamId ) => {
    if ( !fixture.result || fixture.result.homeScore === null || fixture.result.awayScore === null ) {
        return 'N/A';
    }
      
    const isHome = fixture.homeTeam._id?.toString() === teamId.toString() || 
                fixture.homeTeam?.toString() === teamId.toString();
      
    const teamScore = isHome ? fixture.result.homeScore : fixture.result.awayScore;
    const opponentScore = isHome ? fixture.result.awayScore : fixture.result.homeScore;
      
    return `${ teamScore }-${ opponentScore }`;
}

// Get goals scored and conceeded by a team in a fixture
const getTeamScores = ( fixture, teamId ) => {
    if ( !fixture.result || fixture.result.homeScore === null || fixture.result.awayScore === null ) {
        return { scored: 0, conceded: 0 };
    }
      
    const isHome = fixture.homeTeam._id?.toString() === teamId.toString() || 
                fixture.homeTeam?.toString() === teamId.toString();
      
    return {
        scored: isHome ? fixture.result.homeScore : fixture.result.awayScore,
        conceded: isHome ? fixture.result.awayScore : fixture.result.homeScore
    };
}

// Helper function to determine which team type this player belongs to for the given teamId
function getPlayerTeamType(player, teamId) {
    if (player.baseTeam?.toString() === teamId.toString()) return 'base';
    if (player.departmentTeam?.toString() === teamId.toString()) return 'department';
    if (player.clubTeam?.toString() === teamId.toString()) return 'club';
    if (player.schoolTeam?.toString() === teamId.toString()) return 'school';
    return 'unknown';
}

module.exports = {
    calculateTeamStats,
    getTeamForm,
    processPlayerStatsFromFixture,
    getMatchResult,
    getScoreString,
    getTeamScores,
    getPlayerTeamType
}