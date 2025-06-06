const mongoose = require('mongoose');
const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { calculateTeamStats, getTeamForm, 
    getPlayerTeamType,
    getMatchResult, getScoreString 
} = require('../../utils/football/footballTeamUtils');
const playerService = require('./footballPlayerService');

exports.getAllTeams = async ({ department, year, limit = 10, page = 1 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;
    let filter = {};

    // Check if filtering by department or year
    if( department ) { filter.department = department }
    if( year ) { filter.year = year }

    // Get all teams
    const allTeams = await db.FootballTeam.find( filter )
        .skip( skip )
        .limit( limit );

    const total = await db.FootballTeam.countDocuments(filter);

    // Return success
    return { 
        success: true, 
        message: 'All Teams Acquired', 
        data: {
            teams: allTeams,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil( total / limit )
            }
        } 
    };
}

exports.getSingleTeam = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId )
        .populate([
            {
                path: 'captain',
                select: 'name position number'
            }
        ]);
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Team Acquired', data: foundTeam };
}

exports.getTeamPlayers = async ({ teamId }) => {
    // Check if team exists
    const teamName = await db.FootballTeam.findById( teamId ).select('name');
    if( !teamName ) return { success: false, message: 'Invalid Team' };

    // Check for team players
    const players = await db.FootballPlayer.find({
        $or: [
            { baseTeam: teamId },
            { departmentTeam: teamId },
            { clubTeam: teamId },
            { schoolTeam: teamId }
        ]
    });

    return { 
        success: true, 
        message: 'Team Players Aquired', 
        data: {
            team: teamName.name,
            players
        }
    }
}

exports.getTeamCompetitions = async ({ teamId }) => {
    // Check if team exists
    const teamName = await db.FootballTeam.findById( teamId ).select('name');
    if( !teamName ) return { success: false, message: 'Invalid Team' };

    // Check for team competitions
    const competitions = await db.FootballTeam.findById( teamId )
        .select('competitionInvitations')
        .populate({
            path: 'competitionInvitations',
            select: 'competition status',
            populate: {
                path: 'competition',
                select: 'name sportType status format'
            }
        });

    return { 
        success: true, 
        message: 'Team Competitions Aquired', 
        data: {
            team: teamName.name,
            competitions: competitions.filter( comp => comp.status === 'accepted' ),
        }
    }
}

exports.getTeamStatistics = async ({ teamId }, { startDate, endDate, competitionId }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' };

    // Build query for fixtures
    const fixtureQuery = {
        $or: [
          { homeTeam: teamId },
          { awayTeam: teamId }
        ],
        status: 'completed' // Only include completed matches
    };
    // Apply date filters if provided
    if ( startDate ) {
        fixtureQuery.date = { $gte: new Date( startDate ) };
    }
    if ( endDate ) {
        fixtureQuery.date = { ...fixtureQuery.date, $lte: new Date( endDate ) };
    }
    // Apply competition filter if provided
    if ( competitionId ) {
        fixtureQuery.type = 'competition';
        fixtureQuery.competition = competitionId;
    }

    // Get all fixtures for the team with statistics populated
    const fixtures = await db.FootballFixture.find( fixtureQuery )
        .populate('statistics')
        .populate('homeTeam', 'name shorthand')
        .populate('awayTeam', 'name shorthand')
        .sort({ date: -1 }) // Sort by date descending to get most recent first
        .lean();

    // Calculate team statistics
    const stats = calculateTeamStats( fixtures, teamId );
      
    // Get team form (last 5 games)
    const form = getTeamForm( fixtures, teamId );

    // Return success
    return {
        sucess: true,
        message: 'Team Statistics Acquired',
        data: {
            team: {
                id: foundTeam._id,
                name: foundTeam.name,
                shorthand: foundTeam.shorthand
            },
            stats,
            form, // Add form to the response
            fixtures: fixtures.map(fixture => ({
                id: fixture._id,
                date: fixture.date,
                opponent: fixture.homeTeam._id.toString() === teamId.toString() 
                            ? fixture.awayTeam.name 
                            : fixture.homeTeam.name,
                isHome: fixture.homeTeam._id.toString() === teamId.toString(),
                result: getMatchResult(fixture, teamId),
                score: getScoreString(fixture, teamId)
            }))
        }
    }
}

exports.getTeamForm = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' };

    // Get the last 5 completed fixtures
    const fixtures = await db.FootballFixture.find({
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ],
        status: 'completed'
    })
        .sort({ date: -1 })
        .limit(5)
        .lean();

    return {
        success: true,
        message: 'Team Form Aquired',
        data: getTeamForm( fixtures, teamId )
    }
}

exports.getTeamPlayersStatistics = async ({ teamId }, { startDate, endDate, competitionId }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById(teamId);
    if (!foundTeam) return { success: false, message: 'Invalid Team' };

    // Get all players associated with this team through any team type
    const players = await db.FootballPlayer.find({
        $or: [
            { baseTeam: teamId },
            { departmentTeam: teamId },
            { clubTeam: teamId },
            { schoolTeam: teamId }
        ]
    }).select('_id name number position baseTeam departmentTeam clubTeam schoolTeam');

    if (!players || players.length === 0) {
        return { success: false, message: 'Team Has No Players' };
    }

    // Build query for fixtures
    const fixtureQuery = {
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ],
        status: 'completed'
    };

    // Apply filters
    if (startDate) {
        fixtureQuery.date = { $gte: new Date(startDate) };
    }
    if (endDate) {
        fixtureQuery.date = { ...fixtureQuery.date, $lte: new Date(endDate) };
    }
    if (competitionId) {
        fixtureQuery.type = 'competition';
        fixtureQuery.competition = competitionId;
    }

    // Get all completed fixtures with populated events
    const fixtures = await db.FootballFixture.find(fixtureQuery)
        .select('homeTeam awayTeam date result homeLineup awayLineup matchEvents')
        .populate('matchEvents.player', 'name position number')
        .populate('matchEvents.team', 'name')
        .lean();

    // Initialize player statistics with comprehensive metrics
    const playerStats = {};

    players.forEach(player => {
        playerStats[player._id.toString()] = {
            playerId: player._id,
            name: player.name || 'Unknown Player',
            number: player.number,
            position: player.position,
            teamType: getPlayerTeamType(player, teamId),
            appearances: 0,
            starts: 0,
            substitutions: 0,
            minutesPlayed: 0,
            goals: 0,
            ownGoals: 0,
            assists: 0,
            shotsOnTarget: 0,
            shotsOffTarget: 0,
            corners: 0,
            offsides: 0,
            foulsCommitted: 0,
            foulsSuffered: 0,
            yellowCards: 0,
            redCards: 0,
            // Goalkeeper-specific stats
            cleanSheets: 0,
            goalsConceded: 0,
            penaltySaves: 0,
            // Calculated metrics (will be populated later)
            goalsPerMatch: 0,
            assistsPerMatch: 0,
            shotAccuracy: 0
        };
    });

    // Process each fixture to gather comprehensive player statistics
    fixtures.forEach(fixture => {
        const isHomeTeam = fixture.homeTeam.toString() === teamId.toString();
        const lineup = isHomeTeam ? fixture.homeLineup?.startingXI : fixture.awayLineup?.startingXI;
        const subs = isHomeTeam ? fixture.homeLineup?.subs : fixture.awayLineup?.subs;

        // Process starting lineup
        lineup?.forEach(playerId => {
            const playerIdStr = playerId.toString();
            if (playerStats[playerIdStr]) {
                playerStats[playerIdStr].appearances += 1;
                playerStats[playerIdStr].starts += 1;
                playerStats[playerIdStr].minutesPlayed += 90; // Default full match
            }
        });

        // Process substitutions
        subs?.forEach(playerId => {
            const playerIdStr = playerId.toString();
            if (playerStats[playerIdStr]) {
                playerStats[playerIdStr].appearances += 1;
                playerStats[playerIdStr].substitutions += 1;
                // Default substitution at 60th minute if no event data
                playerStats[playerIdStr].minutesPlayed += 30;
            }
        });

        // Process match events
        fixture.matchEvents?.forEach(event => {
            const playerIdStr = event.player?._id?.toString();
            if (!playerIdStr || !playerStats[playerIdStr]) return;

            switch (event.eventType) {
                case 'goal':
                    if (event.team?.toString() === teamId.toString()) {
                        playerStats[playerIdStr].goals += 1;
                        playerStats[playerIdStr].shotsOnTarget += 1;
                    }
                    break;
                case 'ownGoal':
                    playerStats[playerIdStr].ownGoals += 1;
                    break;
                case 'assist':
                    playerStats[playerIdStr].assists += 1;
                    break;
                case 'yellowCard':
                    playerStats[playerIdStr].yellowCards += 1;
                    break;
                case 'redCard':
                    playerStats[playerIdStr].redCards += 1;
                    break;
                case 'shotOnTarget':
                    playerStats[playerIdStr].shotsOnTarget += 1;
                    break;
                case 'shotOffTarget':
                    playerStats[playerIdStr].shotsOffTarget += 1;
                    break;
                case 'corner':
                    playerStats[playerIdStr].corners += 1;
                    break;
                case 'offside':
                    playerStats[playerIdStr].offsides += 1;
                    break;
                case 'foul':
                    if (event.team?.toString() === teamId.toString()) {
                        playerStats[playerIdStr].foulsCommitted += 1;
                    } else {
                        playerStats[playerIdStr].foulsSuffered += 1;
                    }
                    break;
                case 'substitution':
                    // Update minutes for substituted player
                    const subTime = event.time || 60; // Default to 60th minute if no time
                    if (event.player?.toString() === playerIdStr) {
                        // Player was subbed off
                        playerStats[playerIdStr].minutesPlayed = 
                            (playerStats[playerIdStr].minutesPlayed || 0) - (90 - subTime) + subTime;
                    } else if (event.substitutedFor?.toString() === playerIdStr) {
                        // Player was subbed on
                        playerStats[playerIdStr].minutesPlayed += (90 - subTime);
                    }
                    break;
            }
        });

        // Calculate clean sheets for goalkeepers
        const isCleanSheet = isHomeTeam ? 
            (fixture.result?.homeScore === 0) : 
            (fixture.result?.awayScore === 0);
        
        if (isCleanSheet) {
            lineup?.forEach(playerId => {
                const playerIdStr = playerId.toString();
                if (playerStats[playerIdStr]?.position === 'GK') {
                    playerStats[playerIdStr].cleanSheets += 1;
                }
            });
        }

        // Calculate goals conceded for goalkeepers
        if (isHomeTeam && fixture.result?.awayScore > 0) {
            lineup?.forEach(playerId => {
                const playerIdStr = playerId.toString();
                if (playerStats[playerIdStr]?.position === 'GK') {
                    playerStats[playerIdStr].goalsConceded += fixture.result.awayScore;
                }
            });
        } else if (!isHomeTeam && fixture.result?.homeScore > 0) {
            lineup?.forEach(playerId => {
                const playerIdStr = playerId.toString();
                if (playerStats[playerIdStr]?.position === 'GK') {
                    playerStats[playerIdStr].goalsConceded += fixture.result.homeScore;
                }
            });
        }
    });

    // Calculate derived metrics
    Object.values(playerStats).forEach(stats => {
        const totalShots = stats.shotsOnTarget + stats.shotsOffTarget;
        
        if (stats.appearances > 0) {
            stats.goalsPerMatch = parseFloat((stats.goals / stats.appearances).toFixed(2));
            stats.assistsPerMatch = parseFloat((stats.assists / stats.appearances).toFixed(2));
            
            if (totalShots > 0) {
                stats.shotAccuracy = parseFloat(
                    ((stats.shotsOnTarget / totalShots) * 100).toFixed(1)
                );
            }
            
            if (stats.position === 'GK' && stats.minutesPlayed > 0) {
                stats.goalsConcededPer90 = parseFloat(
                    ((stats.goalsConceded * 90) / stats.minutesPlayed).toFixed(2)
                );
            }
        }
    });

    return {
        success: true,
        message: 'Team Players Statistics Acquired',
        data: Object.values(playerStats).sort((a, b) => {
            // Primary sort by goals
            if (b.goals !== a.goals) return b.goals - a.goals;
            // Secondary sort by assists
            if (b.assists !== a.assists) return b.assists - a.assists;
            // Tertiary sort by minutes played
            return b.minutesPlayed - a.minutesPlayed;
        })
    };
};

exports.createTeam = async ({ name, shorthand, department, year, type }, { userId, auditInfo }) => {
    // Check for valid type
    const validTypes = [ 'base', 'department', 'club', 'school' ];
    if( !validTypes.includes( type ) ) return { success: false, message: 'Invalid Team Type' };

    // Create team
    const createdTeam = await db.FootballTeam.create({ name, shorthand, department, year, type });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballTeam',
        entityId: createdTeam._id,
        details: {
            message: `Team Created`
        }
    });

    // Return success
    return { success: true, message: 'Team Created', data: createdTeam };
}

exports.addPlayerToTeam = async ({ teamId }, { name, department, position, number }, { userId, auditInfo }) => {
    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Create player
    playerService.addPlayers({ 
        playerArray: [{ name, department, position, number }],
        teamType: `${ team.type }Team`,
        teamId: teamId,
    }, { userId, auditInfo });

    // Return success
    return { success: true, message: 'Players Added', data: createdPlayer };
}

exports.removePlayerFromTeam = async ({ teamId, playerId }, { userId, auditInfo }) => {
    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Check if player exists
    const player = await db.FootballPlayer.findOne({ 
        _id: playerId,
        $or: [
            { baseTeam: teamId },
            { departmentTeam: teamId },
            { clubTeam: teamId },
            { schoolTeam: teamId }
        ]
    });
    if( !player ) return { success: false, message: 'Invalid Player' };

    // Remove player from team
    team.players = team.players.filter( id => id.toString() !== player._id.toString() );
    await team.save();

    // Delete player
    await db.FootballPlayer.findByIdAndDelete( playerId );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballPlayer',
        entityId: playerId,
        details: {
            message: `Player: ${ player.name } Removed From Team ${ team.name }`
        },
        previousValues: player.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Player Removed' };
}

exports.changeTeamCaptain = async ({ teamId }, { playerId }, { userId, auditInfo }) => {
    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Check if player exists
    const player = await db.FootballPlayer.findById( playerId );
    if( !player ) return { success: false, message: 'Invalid Player' };

    // Save old captain
    const oldCaptain = team.captain;

    // Update team captain
    team.captain = playerId;
    await team.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballTeam',
        entityId: teamId,
        details: {
            message: 'Team Captain Updated',
            affectedFields: [ 'captain' ]
        },
        previousValues: { captain: oldCaptain },
        newValues: { captain: playerId }
    });

    // Return success
    return { success: true, message: 'Team Captain Updated', data: team };
}

exports.getFriendlyRequests = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId ).populate({ 
        path: 'friendlyRequests.team', 
        select: 'name department shorthand year' 
    });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Friendly Requests Retrieved', data: foundTeam.friendlyRequests };
}

exports.sendFriendlyRequest = async ({ teamId }, { date, location, recipientTeamId }, { userId, auditInfo }) => {
    // Check if recipient exists
    const foundReciepientTeam = await db.FootballTeam.findById( recipientTeamId );
    if( !foundReciepientTeam ) return { success: false, message: 'Target team Not Found' };
    // Check if sender exists
    const foundSenderTeam = await db.FootballTeam.findById( teamId );
    if( !foundSenderTeam ) return { success: false, message: 'Sender team Not Found' };

    // Generate id for the request and save for both sender and recipient
    const requestId = new mongoose.Types.ObjectId();
    const requestRecipient = { date, location, requestId, team: teamId, type: 'recieved' };
    const requestSender = { date, location, requestId, team: recipientTeamId, type: 'sent' };

    // Save request on both teams
    foundReciepientTeam.friendlyRequests.push( requestRecipient );
    foundSenderTeam.friendlyRequests.push( requestSender );
    await foundReciepientTeam.save();
    await foundSenderTeam.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FriendlyRequest',
        entityId: requestId,
        details: {
            message: `Friendly Request Sent From ${ foundSenderTeam.name } To ${ foundReciepientTeam.name }`
        }
    });

    // Return success
    return { success: true, message: 'Friendly Request Sent Successfully', data: requestSender };
}

exports.updateFriendlyRequestStatus = async ({ teamId, requestId }, { status }, { userId, auditInfo }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if request exists
    const requestExists = foundTeam.friendlyRequests.some( request => request.requestId.equals( requestId ) );
    if( !requestExists ) return { success: false, message: 'Request Not Found' };

    // Update request status for reciever
    const updatedRequests = foundTeam.friendlyRequests.map( async ( request ) => {
        if( request.requestId.equals( requestId ) ) {
            if( request.type === "recieved" ) {
                // Update the request on the sender and reciever too
                const updatedSender = await db.FootballTeam.updateOne(
                    { 
                        _id: request.team,
                        "friendlyRequests.requestId": requestId
                    },
                    {
                        $set: { "friendlyRequests.$.status": status }
                    },
                    { new: true }
                );
                const updatedReciever = await db.FootballTeam.updateOne(
                    { 
                        _id: teamId,
                        "friendlyRequests.requestId": requestId
                    },
                    {
                        $set: { "friendlyRequests.$.status": status }
                    },
                    { new: true }
                );
            }
        }
    });

    await Promise.all( updatedRequests );

    // Refresh Team
    const refreshedTeam = await db.FootballTeam.findById( teamId ).populate({
        path: 'friendlyRequests.team',
        select: 'name department year'
    });

    // Log actions
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FriendlyRequest',
        entityId: requestId,
        details: {
            message: 'Friendly Request Status Updated',
            affectedFields: [ 'status' ]
        }
    });

    // Return success
    return { success: true, message: 'Request Status Updated', data: refreshedTeam.friendlyRequests };
}

exports.updateTeamAdmin = async ({ teamId }, { adminId }, { userId, auditInfo }) => {
    // Check if admin exists and is a team-admin
    const foundAdmin = await db.RefactoredUser.findById( adminId );
    if( !foundAdmin || foundAdmin.role !== 'sportAdmin' || !foundAdmin.sports.some( sport => sport.role === 'teamAdmin' ) ) return { success: false, message: 'Invalid Admin' };

    // Check if team exists and add admin
    const updatedTeam = await db.FootballTeam.findByIdAndUpdate(
        teamId,
        { admin: adminId },
        { new: true }
    ).populate({
        path: 'admin',
        select: 'name'
    });
    if( !updatedTeam ) return { success: false, message: 'Invalid Team' }

    // Log actions
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballTeam',
        entityId: teamId,
        details: {
            message: 'Team Admin Updated',
            affectedFields: [ 'admin' ]
        },
        previousValues: { admin: null },
        newValues: { admin: adminId }
    });

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedTeam };
}

exports.deleteTeam = async ({ teamId }, { userId, auditInfo }) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' };

    // Delete team
    await db.FootballTeam.findByIdAndDelete( teamId );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballTeam',
        entityId: teamId,
        details: {
            message: 'Team Deleted'
        },
        previousValues: foundTeam.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Team Deleted', data: foundTeam };
}

module.exports = exports;