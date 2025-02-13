const db = require('../config/db');
const { addToFront, calculatePercentage } = require('../utils/functionUtils');
const { processStatUpdate, updatePlayerCompetitionStats, updatePlayerGeneralRecord } = require('../utils/playerStatUtils');
const { getTeamStatsHelper } = require('../utils/teamUtils');

exports.createCompetition = async ({ name, rules, type, description, startDate, endDate }) => {
    // Create competition
    const competition = await db.Competition.create({ name, rules, type, description, startDate, endDate });

    // Return success
    return { success: true, message: 'Competition Created', data: competition };
};

exports.getAllCompetitions = async () => {
    // Get all competitions
    const allCompetitions = await db.Competition.find().select('-admin');

    // Return success 
    return { success: true, message: 'All Competitions Acquired', data: allCompetitions };
}

exports.getSingleCompetition = async ({ competitionId }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Return success
    return { success: true, message: 'Competition Acquired', data: foundCompetition }
}

exports.inviteTeamsToCompetition = async ( { competitionId }, { teamIds } ) => {
    // Validate input
    if( !Array.isArray( teamIds ) ) return { success: false, message: 'Invalid Input Format' };

    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    const updates = teamIds.map( async ( teamId ) => {
        // Check if team exists
        const team = await db.Team.findById( teamId );
        if( !team ) {
            console.warn( 'Skipped A Team' );
            return null;
        }

        // Update competitionInvitations in team
        await db.Team.findByIdAndUpdate( 
            teamId, 
            { $addToSet: { competitionInvitations: foundCompetition._id } },
            { new: true }
        );

        return teamId
    });

    // Wait for updates and filter all invalidIds
    await Promise.all( updates );
    const validUpdates = updates.filter( id => id !== null );
    const invalidUpdates = updates.filter( id => id === null );

    // Return success
    return { success: true, message: 'Invitations Sent Successfully', data: { validUpdates, invalidUpdates } };
}

exports.addTeamsToCompetition = async ({ competitionId }, { teamIds }) => {
    // Validate input
    if( !Array.isArray( teamIds ) ) return { success: false, message: 'Invalid Input Format' };

    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    const updates = teamIds.map( async ( teamId ) => {
        // Check if team exists
        const team = await db.Team.findById( teamId );
        if( !team ) {
            console.warn( 'Skipped A Team' );
            return null;
        }

        // Check if cpompetition invite has already been sent
        const competitionInvite = team.competitionInvitations.some( invite => invite.competition.equals( foundCompetition._id ) );
        if( competitionInvite ) {
            const updatedTeam = await db.Team.findOneAndUpdate(
                { _id: teamId, "competitionInvitations.competitions": foundCompetition._id },
                { $set: { "competitionInvitations.$.status": "accepted" } },
                { new: true }
            );
            const updatedCompetition = await db.Competition.findByIdAndUpdate(
                competitionId,
                { 
                    $addToSet: { 
                        teams: { 
                            team: updatedTeam._id 
                        } 
                    } 
                },
                { new: true }
            )

            return updatedTeam
        } else {
            const updatedTeam = await db.Team.findByIdAndUpdate( 
                teamId,
                { 
                    $addToSet: { 
                        competitionInvitations: { 
                            competition: foundCompetition._id, 
                            status: 'accepted' 
                        }
                    } 
                },
                { new: true }
            );
            const updatedCompetition = await db.Competition.findByIdAndUpdate(
                competitionId,
                { 
                    $addToSet: { 
                        teams: { 
                            team: updatedTeam._id 
                        } 
                    } 
                },
                { new: true }
            )

            return updatedTeam;
        }
    });

    // Wait for updates, filter all invalidIds and refresh competitions
    await Promise.all( updates );
    const validUpdates = updates.filter( id => id !== null );
    const invalidUpdates = updates.filter( id => id === null );
    const refreshedCompetition = await db.Competition.findById( competitionId ).populate({ path: 'teams', select: 'name department level' } );

    // Return success
    return { success: true, message: 'Invitations Sent Successfully', data: { validUpdates, invalidUpdates, refreshedCompetition } };
}

exports.updateCompetitionAdmin = async ({ competitionId }, { adminId }) => {
    // Check if competition exists and update
    const updatedCompetition = await db.Competition.findByIdAndUpdate( 
        competitionId,
        { admin: adminId },
        { new: true }
    ).populate({ 
        path: 'admin',
        select: 'name'
    });
    if( !updatedCompetition ) return { success: false, message: 'Invalid Competition' };

    const updatedUserCompetitionsArray = await db.User.findByIdAndUpdate( 
        adminId,
        { $addToSet: 
            { associatedCompetitions: updatedCompetition._id }
        },
        { new: true }
    )

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedCompetition }
}

exports.addTeamToLeague = async ({ competitionId }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    
}

exports.getSingleLeagueCompetitionOverview = async ({ competitionId }) => {
    // Fetch competition data
    const competition = await db.Competition.findById( competitionId )
        .populate([
            {
                path: 'leagueTable.team'
            },
            {
                path: 'fixtures',
                populate: {
                    path: 'homeTeam awayTeam',
                    select: 'name department shorthand'
                }
            },
            {
                path: 'playerStats',
                populate: {
                    path: 'player',
                    populate: {
                        path: 'team',
                        select: 'name shorthand'
                    }
                }
            },
            {
                path: 'teams.team',
                select: 'name shorthand'
            }
        ]);
    if ( !competition ) return { success: false, message: 'Invalid Competition' };

    // Top 3 teams in the table
    const topTeams = competition.leagueTable
        .sort( ( a, b ) => b.points - a.points || b.goalDifference - a.goalDifference )
        .slice( 0, 3 )
        .map( ( entry, index ) => ({
            position: index + 1,
            team: {
                _id: entry.team._id,
                name: entry.team.name
            },
            played: entry.played,
            points: entry.points,
            goalDifference: entry.goalDifference,
        }));

    // Next 5 featured matches
    const upcomingFixtures = competition.fixtures
        .filter( ( fixture ) => fixture.status === 'upcoming' )
        .sort( ( a, b ) => new Date( a.date ) - new Date( b.date ) )
        .slice( 0, 5 )
        .map( ( fixture ) => ({
            homeTeam: {
                name: fixture.homeTeam.name,
                department: fixture.homeTeam.department,
                shorthand: fixture.homeTeam.shorthand,
            },
            awayTeam: {
                name: fixture.awayTeam.name,
                department: fixture.awayTeam.department,
                shorthand: fixture.awayTeam.shorthand,
            },
            _id: fixture._id,
            date: fixture.date,
        }));

    // Top 5 scorers
    const topScorers = competition.playerStats
        .sort( ( a, b ) => b.goals - a.goals )
        .slice( 0, 5 )
        .map( ( stat ) => ( {
            player: {
                name: stat.player.name,
                position: stat.player.position,
                _id: stat.player._id,
            },
            team: stat.player.team.name,
            goals: stat.goals,
            appearances: stat.appearances,
        } ));

    // Top 5 assisters
    const topAssists = competition.playerStats
        .sort( ( a, b ) => b.assists - a.assists )
        .slice( 0, 5 )
        .map( ( stat ) => ( {
            player: {
                name: stat.player.name,
                position: stat.player.position,
                _id: stat.player._id,
            },
            team: stat.player.team.name,
            assists: stat.assists,
            appearances: stat.appearances,
        } ));

    // League facts
    const leagueFacts = {
        totalGoals: competition.stats.totalGoals,
        homeWinsPercentage: competition.stats.homeWinsPercentage.toFixed(2),
        awayWinsPercentage: competition.stats.awayWinsPercentage.toFixed(2),
        drawsPercentage: competition.stats.drawsPercentage.toFixed(2),
        yellowCardsAvg: competition.stats.yellowCardsAvg.toFixed(2),
        redCardsAvg: competition.stats.redCardsAvg.toFixed(2),
        numberOfTeams: competition.teams.length,
        teamList: competition.teams.map( ( team ) => ({
            name: team.team.name,
            shorthand: team.team.shorthand,
            _id: team.team._id
        })),
    };

    return {
        success: true,
        message: 'Competition Overview Acquired',
        data: {
            table: topTeams,
            featuredMatches: upcomingFixtures,
            topScorers,
            topAssists,
            leagueFacts,
        }
    }
} 

exports.getFullTable = async ({ competitionId }) => {
    // Check if competition exists
    const competition = await db.Competition.findById( competitionId )
    .populate( 'leagueTable.team' );
    if (!competition) return { success: false, message: 'Competition not found' }

    const table = competition.leagueTable
        .sort( ( a, b ) => b.points - a.points || b.goalDifference - a.goalDifference )
        .map( ( entry, index ) => ({
            position: index + 1,
            team: {
                _id: entry.team._id,
                name: entry.team.name,
                shorthand: entry.team.shorthand
            },
            played: entry.played,
            wins: entry.wins,
            draws: entry.draws,
            losses: entry.losses,
            goalsFor: entry.goalsFor,
            goalsAgainst: entry.goalsAgainst,
            goalDifference: entry.goalDifference,
            points: entry.points,
            form: entry.form,
        }));

    return { success: true, message: 'League Table Acquired', data: table }
}

exports.getCompetitionFixtures = async ({ competitionId }, { filter, team }) => {
    let query = { competition: competitionId };

    if ( filter ) {
        const date = new Date(filter);
        if ( !isNaN( date ) ) {
            query.date = { $gte: date };
        }
    }

    if ( team ) {
        query.$or = [ { homeTeam: team }, { awayTeam: team } ];
    }

    const completedMatches = await db.Fixture.find({ ...query, status: 'completed' })
        .populate({ 
            path: 'homeTeam awayTeam',
            select: 'name department shorthand level'
        })
        .sort({ date: -1 })
        .select( 'homeTeam awayTeam date status result');

    const upcomingMatches = await db.Fixture.find({ ...query, status: 'upcoming' })
        .populate({ 
            path: 'homeTeam awayTeam',
            select: 'name department shorthand level'
        })
        .sort({ date: 1 })
        .select( 'homeTeam awayTeam date status stadium');

    return { success: true, message: 'Competition Fixtures Acquired', data: { completedMatches, upcomingMatches } };
}

exports.getTopPlayers = async ({ competitionId }) => {
    // Check if competition exists
    const competition = await db.Competition.findById( competitionId )
        .populate([
            {
                path: 'playerStats',
                populate: {
                    path: 'player',
                    populate: {
                        path: 'team',
                        select: 'name shorthand'
                    }
                }
            },
        ]);
    if ( !competition ) return { success: false, message: 'Competition not found' }

    const playerStats = competition.playerStats;

    const topScorers = playerStats
        .sort( ( a, b ) => b.goals - a.goals )
        .slice( 0, 5 )
        .map((stat) => ({
            player: stat.player.name,
            team: stat.player.team.name,
            goals: stat.goals,
        }));

    const topAssists = playerStats
        .sort(( a, b ) => b.assists - a.assists )
        .slice( 0, 5 )
        .map( ( stat ) => (
            {
                player: stat.player.name,
                team: stat.player.team.name,
                assists: stat.assists,
            }
        ));

    const topYellowCards = playerStats
        .sort(( a, b ) => b.yellowCards - a.yellowCards )
        .slice( 0, 5 )
        .map( ( stat ) => (
            {
                player: stat.player.name,
                team: stat.player.team.name,
                yellowCards: stat.yellowCards,
            }
        ));

    const topRedCards = playerStats
        .sort(( a, b ) => b.redCards - a.redCards )
        .slice( 0, 5 )
        .map( ( stat ) => (
            {
                player: stat.player.name,
                team: stat.player.team.name,
                redCards: stat.redCards,
            }
        ));

    return { 
        success: true, 
        message: 'Player Stats Acquired', 
        data: {
            topScorers, topAssists, topYellowCards, topRedCards
        }
    }
}

exports.getTopTeams = async ({ competitionId }, { statType = 'total' }) => {
    // Fetch the competition with teams and fixtures
    const competition = await db.Competition.findById(competitionId)
        .populate('fixtures')
        .populate('teams.team');

    if ( !competition ) return { success: false, message: 'Competition not found' };

    const teamStats = await getTeamStatsHelper( competition, statType );
    if( Object.keys( teamStats ).length === 0 ) return { success: true, message: 'Team Stats Acquired', data: teamStats };

    // Sort and get top 5 teams for each stat
    const sortedStats = {};
    const statKeys = Object.keys(teamStats[Object.keys(teamStats)[0]]).filter(
        (key) => key !== 'teamName' && key !== 'matchesPlayed'
    );

    for (const statKey of statKeys) {
        sortedStats[statKey] = Object.entries(teamStats)
            .sort(([, a], [, b]) => b[statKey] - a[statKey])
            .slice(0, 5)
            .map(([teamId, stats]) => ({
                teamId,
                teamName: stats.teamName,
                value: stats[statKey]
            }));
    }

    return { success: true, message: 'Team Stats Acquired', data: sortedStats };
}

exports.getAllTeamStats = async ({ competitionId }, { statType = 'total' }) => {
    const competition = await db.Competition.findById( competitionId )
        .populate('fixtures')
        .populate('teams.team');
    if ( !competition ) return { success: false, message: 'Competition not found' };

    const teamStats = await getTeamStatsHelper( competition, statType );

    return { success: true, message: 'Team Stats Acquired', data: teamStats };
}

exports.getPlayerStats  = async ({ competitionId }, { page = 1, limit = 20, teamId }) => {
    const query = { competition: competitionId };
    if ( teamId ) query[ 'player.team' ] = teamId;

    // const playerStats = await db.PlayerCompetitionStats.find( query )
    const playerStats = await db.PlayerCompetitionStats.find( query )
        .populate('player')
        .skip( ( page - 1 ) * limit )
        .limit( Number( limit ) )
        .sort({ goals: -1, assists: -1 }); // Default sorting by goals, then assists

    return {
        success: true,
        message: 'Player Stats Acquired',
        data: {
            stats: playerStats.map((stat) => ({
                player: stat.player.name,
                team: stat.player.team.name,
                goals: stat.goals,
                assists: stat.assists,
                appearances: stat.appearances,
                yellowCards: stat.yellowCards,
                redCards: stat.redCards,
                cleanSheets: stat.cleanSheets
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: await db.PlayerCompetitionStats.countDocuments(query)
            }
        }
    }
}

exports.addCompetitionFixture = async ({ competitionId }, { fixtures }) => {
    // Validate input
    if( !Array.isArray( fixtures ) ) return { success: false, message: 'Invalid Input Format' };

    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    const competitionTeams = foundCompetition.teams.map( ( team ) => String( team.team ) ); // Convert to string for comparison

    // Check if every homeTeam and awayTeam in fixtures exists in competition.teams
    const invalidTeams = fixtures.filter(
        ( fixture ) =>
            !competitionTeams.includes(String(fixture.homeTeam)) ||
            !competitionTeams.includes(String(fixture.awayTeam))
    );

    if ( invalidTeams.length > 0 ) {
        return {
            success: false,
            message: 'Some teams in the fixtures are not part of the competition',
        };
    }

    // Loop through fixtures and create
    const createFixtures = fixtures.map( async ( fixture ) => {
        const{ homeTeam, awayTeam, date, stadium, referee, round } = fixture;

        const createdFixture = await db.Fixture.create({
            homeTeam, awayTeam,
            date, stadium,
            type: 'competition',
            competition: foundCompetition._id,
            referee, round
        });
        const updatedHomeTeamFixtures = await db.Team.findOneAndUpdate(
            { _id: homeTeam },
            {
                $addToSet: {
                    fixtures: createdFixture._id
                }
            },
            { new: true }
        )
        const updatedAwayTeamFixtures = await db.Team.findOneAndUpdate(
            { _id: awayTeam },
            {
                $addToSet: {
                    fixtures: createdFixture._id
                }
            },
            { new: true }
        )

        foundCompetition.fixtures.push( createdFixture._id )
        return createdFixture._id
    });

    // Wait for operations to finish and push to competitionFixtures array
    const done = await Promise.all( createFixtures );
    await foundCompetition.save();

    // Refresh competition data
    const refreshedCompetition = await db.Competition.findById( competitionId )
    .populate( 'fixtures' );

    return { success: true, message: 'Fixtures Added', data: refreshedCompetition };
}

exports.getSingleCompetitionFixture = async ({ competitionId, fixtureId }) => {
    // Check if fixture exists
    const foundFixture = await db.Fixture.findOne(
        { _id: fixtureId, competition: competitionId }
    );
    if( !foundFixture ) return { success: false, message: 'Invalid Competition Fixture' };

    // Return success
    return { success: true, message: 'Fixture Acquired', data: foundFixture }
};

// Update Competition Fixture And Calculate Competition Standings/Rounds/Data
exports.updateCompetitionFixtureResult = async({ competitionId, fixtureId }, { result, statistics,  playerStats }) => {
    // Check if fixture exists
    const foundFixture = await db.Fixture.findOne(
        { _id: fixtureId, competition: competitionId },
    );
    if( !foundFixture ) return { success: false, message: 'Invalid Competition Fixture' };
    if( foundFixture.status === 'completed' ) return { success: false, message: 'Fixture Already Updated' };
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId )
        .populate([
            {
                path: 'leagueTable.team',
                select: 'name department level shorthand'
            },
            {
                path: 'knockoutRounds.teams',
                select: 'name shorthand'
            },
            {
                path: 'fixtures',
                select: 'status'
            }
        ]);
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Check if user passed in statistics
    if( statistics ) {
        // Check if statistics does not exist and create
        const { home, away } = statistics;
        if( !foundFixture.statistics ) {
            const createdStatistics = await db.MatchStatistic.create({ fixture: foundFixture._id, home, away });
            foundFixture.statistics = createdStatistics._id;
        } else {
            const foundStatistics = await db.MatchStatistic.findByIdAndUpdate( foundFixture.statistics, { home, away });
        }
    }

    // Update player stats if available
    if( playerStats ) {
        // Process stats
        if( playerStats.goals ) {
            await processStatUpdate( playerStats.goals, "goals", competitionId );
            playerStats.goals.map( scorers => {
                const { playerId, count, times } = scorers;
                
                for( let i = 0; i < count; i++ ) {
                    if( times.length > 0 ) {
                        foundFixture.goalScorers.push({ id: playerId, time: times[ i ] })
                    } else {
                        foundFixture.goalScorers.push({ id: playerId, time: 90 })
                    }
                }
            });
        }
        await processStatUpdate( playerStats.assists, "assists", competitionId );
        await processStatUpdate( playerStats.yellowCards, "yellowCards", competitionId );
        await processStatUpdate( playerStats.redCards, "redCards", competitionId );
    
        // Handle clean sheets separately
        if ( playerStats.cleanSheets ) {
            const homeConceded = result.awayScore > 0;
            const awayConceded = result.homeScore > 0;
    
            await Promise.all( playerStats.cleanSheets.map( async ({ playerId }) => {
                const player = await db.Player.findById( playerId );
                if ( !player ) return;
        
                const isHome = foundFixture.homeTeam.equals( player.team );
                const isAway = foundFixture.awayTeam.equals( player.team );

                if (( isHome && !homeConceded ) || ( isAway && !awayConceded )) {
                    await updatePlayerGeneralRecord( playerId, "cleanSheets", 1 );
                    await updatePlayerCompetitionStats( playerId, "cleanSheets", 1, competitionId );
                }
            }));
        }
    }

    // Update result and goalscorers if available and save
    if( result ) foundFixture.result = result;
    foundFixture.status = 'completed';
    await foundFixture.save();

    // Check Winner
    const homeWin = ( foundFixture.result.homeScore > foundFixture.result.awayScore ) || ( foundFixture.result.homePenalty > foundFixture.result.awayPenalty );
    const awayWin = ( foundFixture.result.homeScore < foundFixture.result.awayScore ) || ( foundFixture.result.homePenalty < foundFixture.result.awayPenalty );
    const draw = !homeWin && !awayWin;

    // Perform competition stat update
    const { homeWinsPercentage, awayWinsPercentage, totalGoals, drawsPercentage, yellowCardsAvg, redCardsAvg } = foundCompetition.stats;
    const totalGames = foundCompetition.fixtures.filter( f => f.status === 'completed' );
    if( homeWin ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames.length, 1 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames.length, 0 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames.length, 0 );
    }
    if( awayWin ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames.length, 0 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames.length, 1 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames.length, 0 );
    }
    if( draw ) {
        foundCompetition.stats.homeWinsPercentage = calculatePercentage( homeWinsPercentage, totalGames.length, 0 );
        foundCompetition.stats.awayWinsPercentage = calculatePercentage( awayWinsPercentage, totalGames.length, 0 );
        foundCompetition.stats.drawsPercentage = calculatePercentage( drawsPercentage, totalGames.length, 1 );
    }
    if( statistics ) {
        const totalYellows = statistics.home.yellowCards + statistics.away.yellowCards;
        const totalReds = statistics.home.redCards + statistics.away.redCards;

        foundCompetition.stats.yellowCardsAvg = calculatePercentage( yellowCardsAvg, totalGames.length, totalYellows );
        foundCompetition.stats.redCardsAvg = calculatePercentage( redCardsAvg, totalGames.length, totalReds );
    }
    foundCompetition.stats.totalGoals = totalGoals + ( foundFixture.result.homeScore + foundFixture.result.awayScore );

    // Save changes
    await foundCompetition.save();

    // Check competition type and perform calculation
    if( foundCompetition.type === 'league' ) {
    // Perform league calculations
        // Loop through the competition table
        const updatedTableStandings = foundCompetition.leagueTable.map( team => {
            let currentTeamStats = team;
            const currentForm = currentTeamStats.form || [];

            // Check if current team in loop is the home or away team
            if( team.team._id.equals( foundFixture.homeTeam ) ) {
                currentTeamStats.played += 1;
                if( draw ) {
                    currentTeamStats.draws += 1;
                    currentTeamStats.points += 1;
                    currentTeamStats.form = addToFront( currentForm, 'D' );
                }
                if( homeWin ) {
                    currentTeamStats.wins += 1;
                    currentTeamStats.points += 3;
                    currentTeamStats.form = addToFront( currentForm, 'W' );
                }
                if( awayWin ) {
                    currentTeamStats.losses += 1;
                    currentTeamStats.form = addToFront( currentForm, 'L' );
                }
                currentTeamStats.goalsFor += foundFixture.result.homeScore;
                currentTeamStats.goalsAgainst += foundFixture.result.awayScore;
                currentTeamStats.goalDifference += ( foundFixture.result.homeScore - foundFixture.result.awayScore );
            } else if( team.team._id.equals( foundFixture.awayTeam ) ) {
                currentTeamStats.played += 1;
                if( draw ) {
                    currentTeamStats.draws += 1;
                    currentTeamStats.points += 1;
                    currentTeamStats.form = addToFront( currentForm, 'D' );
                }
                if( awayWin ) {
                    currentTeamStats.wins += 1;
                    currentTeamStats.points += 3;
                    currentTeamStats.form = addToFront( currentForm, 'W' );
                }
                if( homeWin ) {
                    currentTeamStats.losses += 1;
                    currentTeamStats.form = addToFront( currentForm, 'L' );
                }
                currentTeamStats.goalsFor += foundFixture.result.awayScore;
                currentTeamStats.goalsAgainst += foundFixture.result.homeScore;
                currentTeamStats.goalDifference += ( foundFixture.result.awayScore - foundFixture.result.homeScore );
            }

            return currentTeamStats;
        });

        // Update league table
        foundCompetition.leagueTable = updatedTableStandings;

        // Save changes
        await foundCompetition.save();
    } else if ( foundCompetition.type === 'knockout' ) {
        // Get the current round
        const currentRoundIndex = foundCompetition.knockoutRounds.findIndex( round => round.fixtures.some( fixtureId => fixtureId.equals( foundFixture._id ) ) );

        // Refresh competitiion and fixture
        const refreshedCompetition = await db.Competition.findById( competitionId )
            .populate([
                {
                    path: 'leagueTable.team',
                    select: 'name shorthand'
                },
                {
                    path: 'knockoutRounds.teams',
                    select: 'name shorthand'
                }
            ]);
        const refreshedFixture = await db.Fixture.findOne(
            { _id: fixtureId, competition: competitionId },
        );

        // Check If Round Exists
        if( currentRoundIndex === -1 ) {
            return { 
                success: true,
                message: 'Fixture Updated And Competition Stats Updated But Index Not Found',
                data: {
                    refreshedFixture, refreshedCompetition
                }
            }
        }
        const currentRound = foundCompetition.knockoutRounds[ currentRoundIndex ];

        // Get the nextRound index and check if it exists
        const nextRoundIndex = currentRoundIndex + 1;
        if( nextRoundIndex > foundCompetition.knockoutRounds.length - 1 ) {
            return {
                success: true,
                message: 'Fixture & Competition Stats Updated, Latest Round Completed',
                data: {
                    refreshedFixture, refreshedCompetition
                }
            }
        }
        const nextRound = foundCompetition.knockoutRounds[ nextRoundIndex ];

        // Update the teams in next round based on winners
        if( homeWin ) {
            nextRound.teams.push( foundFixture.homeTeam )
        } else if( awayWin ) {
            nextRound.teams.push( foundFixture.awayTeam )            
        }
    }

    // Save competition
    await foundCompetition.save();

    // Refresh competitiion and fixture
    const refreshedCompetition = await db.Competition.findById( competitionId )
        .populate([
            {
                path: 'leagueTable.team',
                select: 'name shorthand'
            },
            {
                path: 'knockoutRounds.teams',
                select: 'name shorthand'
            }
        ]);
    const refreshedFixture = await db.Fixture.findOne(
        { _id: fixtureId, competition: competitionId },
    );

    return { 
        success: true,
        message: 'Fixture Updated And Competition Stats Updated',
        data: {
            refreshedFixture, refreshedCompetition
        }
    }
}

// Start Competition And Set Table From Array Of Teams In Competition
exports.initializeLeagueTable = async ({ competitionId }) => {
    // Check if competition exists and is league
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.type !== 'league' ) return { success: false, message: 'Invalid Competition Type' };

    if( foundCompetition.leagueTable && foundCompetition.leagueTable.length > 0 ) return { success: false, message: 'League Table Initialized' };

    // Create league table and status
    foundCompetition.leagueTable = foundCompetition.teams.map( ( team ) => ({
        team: team.team,
        played: 0,
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        form: []
    }));
    foundCompetition.status = 'ongoing';

    // Save updated table
    await foundCompetition.save();

    // Refresh Competition
    const refreshedCompetition = await db.Competition.findById( competitionId )
        .populate({
            path: 'leagueTable.team',
            select: 'name shorthand'
        })

    // Return success
    return { success: true, message: 'League Table Initialized', data: refreshedCompetition };
}

exports.getCompetitionTeams = async ({ competitionId }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId )
        .populate({
            path: 'teams.team',
            select: 'name shorthand'
        });
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    return { success: true, message: 'Teams Acquired', data: foundCompetition.teams };
}

exports.addKnockoutPhases = async ({ competitionId }, { knockoutRounds }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.type === 'league' ) return { success: false, message: 'Invalid Competition Type' };

    // Update Knockout Rounds
    foundCompetition.knockoutRounds.push( ...knockoutRounds );
    await foundCompetition.save();

    return { success: true, message: 'Knockout Rounds Added', data: foundCompetition.knockoutRounds }
}

exports.addTeamsToKncokoutPhase = async ({ competitionId }, { roundName, teams }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
    if( foundCompetition.type === 'league' ) return { success: false, message: 'Invalid Competition Type' };

    // Check if every team in teams exists in competition.teams
    const competitionTeams = foundCompetition.teams.map( ( team ) => String( team.team ) ); // Convert to string for comparison
    const invalidTeams = teams.filter(
        ( team ) =>
            !competitionTeams.includes(String( team ))
    );
    if ( invalidTeams.length > 0 ) {
        return {
            success: false,
            message: 'Some teams are not part of the competition',
        };
    }

    // Check if round names matches any existing rounds
    const competitionRounds = foundCompetition.knockoutRounds.map( ( round ) => round.name );
    const invalidRound = !competitionRounds.includes( roundName );
    if( invalidRound ) return { success: false, message: 'Round Not In Competition' };

    // Add teams to round
    const updatedRounds = foundCompetition.knockoutRounds.map( ( round ) => {
        if( round.name === roundName ) {
            return {
                ...round,
                teams: [ ...round.teams, ...teams ]
            }
        } else {
            return { ...round }
        }
    })

    // Update competition
    foundCompetition.knockoutRounds = updatedRounds;
    await foundCompetition.save();

    // Return success
    return { success: true, message: 'Team(s) Added Successfully', data: foundCompetition }
}

exports.addFixturesToKnockoutPhase = async ({ competitionId }, { roundName, fixtures }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById(competitionId);
    if (!foundCompetition) return { success: false, message: 'Invalid Competition' };
    if (foundCompetition.type === 'league') return { success: false, message: 'Invalid Competition Type' };

    // Check if every fixture in fixtures exists in competition.fixtures
    const competitionFixtures = foundCompetition.fixtures.map(fixture => String(fixture)); // Convert to string for comparison
    const invalidFixtures = fixtures.filter(fixture => !competitionFixtures.includes(String(fixture)));

    if (invalidFixtures.length > 0) {
        return { success: false, message: 'Some fixtures are not part of the competition' };
    }

    // Check if round name matches an existing round
    const roundIndex = foundCompetition.knockoutRounds.findIndex(round => round.name === roundName);
    if (roundIndex === -1) return { success: false, message: 'Round Not In Competition' };

    // Get the round object
    const round = foundCompetition.knockoutRounds[roundIndex];

    // Validate that all fixture teams exist in the current round
    const errors = [];
    for (const fixtureId of fixtures) {
        const fixture = await db.Fixture.findById(fixtureId);
        if (!fixture) {
            errors.push(`Invalid Fixture: ${fixtureId}`);
            continue;
        }

        const fixtureTeamsInRound = round.teams.some(teamId =>
            teamId.equals(fixture.homeTeam) || teamId.equals(fixture.awayTeam)
        );

        if (!fixtureTeamsInRound) {
            errors.push(`Fixture Teams Not In Current Round: ${fixtureId}`);
        }
    }

    if (errors.length > 0) return { success: false, message: `Error(s) Occurred: ${errors.join(', ')}` };

    // Add fixtures to the correct round
    foundCompetition.knockoutRounds[roundIndex].fixtures = [
        ...foundCompetition.knockoutRounds[roundIndex].fixtures,
        ...fixtures
    ];

    // Save competition
    await foundCompetition.save();

    return { success: true, message: 'Fixture(s) Added Successfully', data: foundCompetition };
};

module.exports = exports;