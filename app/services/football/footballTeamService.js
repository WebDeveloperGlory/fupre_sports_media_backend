const mongoose = require('mongoose');
const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { calculateTeamStats, getTeamForm, 
    processPlayerStatsFromFixture, 
    getMatchResult, getScoreString 
} = require('../../utils/football/footballTeamUtils');

exports.getAllTeams = async ({ department, level, limit = 10, page = 1 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;
    let filter = {};

    // Check if filtering by department or level
    if( department ) { filter.department = department }
    if( level ) { filter.level = level }

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
    const players = await db.FootballPlayer.find({ team: teamId });

    return { 
        success: true, 
        message: 'Team Players Aquired', 
        data: {
            team: teamName,
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
            team: teamName,
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
    const foundTeam = await db.FootballTeam.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' };

    // Check if team has players
    const players = await db.FootballPlayer.find({ team: teamId });
    if( !players || players.length === 0 ) return { success: false, message: 'Team Has No Players' };

    // Build query for fixtures
    const fixtureQuery = {
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ],
        status: 'completed'
    };
    // Apply filters (similar to getTeamStatistics)
    if ( startDate ) {
        fixtureQuery.date = { $gte: new Date(startDate) };
    }
    if ( endDate ) {
        fixtureQuery.date = { ...fixtureQuery.date, $lte: new Date( endDate ) };
    }
    if ( competitionId ) {
        fixtureQuery.type = 'competition';
        fixtureQuery.competition = competitionId;
    }

    // Get all fixtures with match events
    const fixtures = await db.FootballFixture.find( fixtureQuery ).lean();

    // Calculate statistics for each player
    const playerStats = {};
    
    players.forEach( player => {
        playerStats[ player._id.toString() ] = {
            playerId: player._id,
            name: player.name || 'Unknown Player',
            number: player.number,
            position: player.position,
            appearances: 0,
            goals: 0,
            ownGoals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0
        };
    });

    // Process each fixture to gather player statistics
    fixtures.forEach(fixture => {
        processPlayerStatsFromFixture( fixture, teamId, playerStats );
    });

    return {
        success: true,
        message: 'Team Players Statistics Acquired',
        data: Object.values( playerStats ).sort((a, b) => b.goals - a.goals)
    };
}

exports.createTeam = async ({ name, shorthand, department, level }, { userId, auditInfo }) => {
    // Create team
    const createdTeam = await db.FootballTeam.create({ name, shorthand, department, level });

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

exports.addPlayerToTeam = async ({ teamId }, { name, position, number }, { userId, auditInfo }) => {
    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Check if player already exists
    const existingPlayers = await db.FootballPlayer.find({ name, team: teamId });
    if( existingPlayers.length > 0 ) {
        const existingNames = existingPlayers.map( player => player.name );
        return { success: false, message: `Players with names ${ existingNames.join(', ') } already exist in team`}
    }

    // Create player
    const createdPlayer = await db.FootballPlayer.create({ 
        name, position, number, 
        team: teamId, 
        generalRecord: [
            {
                year: new Date().getFullYear(),
                goals: 0,
                ownGoals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                appearances: 0,
                cleanSheets: 0
            }
        ] 
    });

    // Update team players array
    team.players.push( createdPlayer._id );
    await team.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballPlayer',
        entityId: createdPlayer._id,
        details: {
            message: `New Player: ${ player.name } Created For Team ${ team.name }`
        }
    });

    // Return success
    return { success: true, message: 'Players Added', data: createdPlayer };
}

exports.removePlayerFromTeam = async ({ teamId, playerId }, { userId, auditInfo }) => {
    // Check if team exists
    const team = await db.FootballTeam.findById( teamId );
    if( !team ) return { success: false, message: 'Invalid Team' };

    // Check if player exists
    const player = await db.FootballPlayer.findById( playerId );
    if( !player ) return { success: false, message: 'Invalid Player' };

    // Remove player from team
    team.players = team.players.filter( id => id.toString() !== player._id.toString() );
    await team.save();

    // Delete player
    await db.FootballPlayer.findByIdAndDelete( playerId );
    const deletedCompetitionStat = await db.FootballPlayerCompetitionStat.findOneAndDelete({ player: foundPlayer._id });

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
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballPlayerCompetitionStat',
        entityId: deletedCompetitionStat._id,
        details: {
            message: 'Player Competition Stat Deleted',
        },
        previousValues: deletedCompetitionStat.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Player Removed' };
}

exports.transferOrLoanPlayer = async ({ playerId }, { status, fromTeam, toTeam, transferDate, returnDate }, { userId, auditInfo }) => {
    // Check if player exists
    const player = await db.FootballPlayer.findById( playerId );
    if( !player ) return { success: false, message: 'Invalid Player' };

    // Save old data
    const oldPlayer = await db.FootballPlayer.findById( playerId );

    // Update player details
    player.status = status;
    player.transferDetails = { status, fromTeam, toTeam, transferDate, returnDate };
    player.team = toTeam;
    await player.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballPlayer',
        entityId: playerId,
        details: {
            message: 'Player Transfer/Loan Details Updated',
            affectedFields: [
                status !== undefined ? 'status' : null,
                fromTeam !== undefined ? 'fromTeam' : null,
                toTeam !== undefined ? 'toTeam' : null,
                transferDate !== undefined ? 'transferDate' : null,
                returnDate !== undefined ? 'returnDate' : null
            ].filter(Boolean)
        },
        previousValues: oldPlayer.toObject(),
        newValues: player.toObject()
    });

    // Return success
    return { success: true, message: 'Player Transfer/Loan Details Updated', data: player };
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
        select: 'name department shorthand level' 
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
        select: 'name department level'
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