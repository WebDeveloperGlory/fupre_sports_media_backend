const db = require('../config/db');
const mongoose = require('mongoose');
const { getRecentPerformance, calculateRecord, shuffleArray, getTopStats, getNextFixture, getFixtures } = require('../utils/teamUtils')

exports.createTeam = async ({ name, shorthand, department, level }) => {
    // Run checks and create shorthand
    if( shorthand.length > 4 ) return { success: false, message: 'Invalid Shorthand Length' };
    const newShorthand = `${ shorthand }-${ level === 'General' ? 'G' : level }`;

    // Create team
    const createdTeam = await db.Team.create({ name, shorthand: newShorthand, department, level });

    // Return success
    return { success: true, message: 'Team Created', data: createdTeam };
}

exports.getAllTeams = async () => {
    // Get all teams
    const allTeams = await db.Team.find();

    // Return success
    return { success: true, message: 'All Teams Acquired', data: allTeams };
}

exports.getTeamOverview = async () => {
    // Fetch all teams
    const teams = await db.Team.find().populate("players");

    // Overview
    const totalTeams = teams.length;
    const departments = teams.reduce( ( acc, team ) => {
        const dept = team.department || "Unknown";
        const existingDept = acc.find( ( d ) => d.name === dept );
        if ( existingDept ) {
            existingDept.teamCount++;
        } else {
            acc.push({ name: dept, teamCount: 1 });
        }
        return acc;
    }, []);

    // Calculate team stats
    const teamsData = await Promise.all(
        teams.map( async ( team ) => {
            const playerCount = team.players.length;

            // Fetch and calculate performance
            const recentPerformance = team.fixtures.length
                ? await getRecentPerformance( team.fixtures, team._id )
                : ["N/A"];

            // Fetch record
            const record = team.fixtures.length
                ? await calculateRecord( team.fixtures, team._id )
                : { wins: 0, losses: 0, draws: 0 };

            return {
                _id: team._id,
                name: team.name,
                department: team.department || "Unknown",
                level: team.level,
                playerCount,
                recentPerformance,
                record,
            };
        })
    );

    // Featured Teams
    const sortedTeams = [ ...teamsData ].sort( ( a, b ) => {
        if ( b.record.wins !== a.record.wins ) return b.record.wins - a.record.wins;
        if ( b.record.draws !== a.record.draws ) return b.record.draws - a.record.draws;
        return a.record.losses - b.record.losses; // Lower losses are better
    });
    const featuredTeams =
        sortedTeams.length >= 3
            ? sortedTeams.slice( 0, 3 )
            : shuffleArray( teamsData ).slice( 0, 3 ); // Shuffle if not enough records

    return { 
        success: true, 
        message: 'Teams Overview Acquired', 
        data: {
            overview: {
                totalTeams,
                departments,
            },
            teams: teamsData,
            featuredTeams,
        }
    }
    
}

exports.getSingleTeam = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Team Acquired', data: foundTeam };
}

// Top 4 Goal Scorer
// Top 4 Assisters
// Next Match

exports.getSingleTeamOverview = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId )
        .populate({
            path: 'competitionInvitations.competition',
            select: 'name'
        });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    let teamOverview = {};

    // Get Team Info
    teamOverview.info = {
        coach: foundTeam.coach,
        assistantCoach: foundTeam.assistantCoach,
        playerCount: foundTeam.players.length,
        department: foundTeam.department,
        level: foundTeam.level
    }
    // Get Team Competitions
    teamOverview.competitions = foundTeam.competitionInvitations.length
        ? foundTeam.competitionInvitations.filter( comp => comp.status === 'accepted' )
        : null;
    // Get Recent Form
    teamOverview.recentPerformance = foundTeam.fixtures.length
        ? await getRecentPerformance( foundTeam.fixtures, foundTeam._id )
        : null;
    // Get Next Match
    teamOverview.nextFixture = await getNextFixture( foundTeam._id );
    // Get Top GoalScorers, Assists, Yellow and Red Cards
    const year = new Date().getFullYear();
    teamOverview.topStats = await getTopStats({ teamId: foundTeam._id, year });
    
    return { success: true, message: 'Team Overview Acquired', data: teamOverview };
}

exports.getSingleTeamFixtures = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    const fixtures = await getFixtures( foundTeam.fixtures, foundTeam._id );

    return { success: true, message: 'Team Fixtures Acquired', data: fixtures };
}

exports.getTeamPlayers = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId )
        .populate([
            { 
                path: 'players',
                select: 'name position' 
            },
            {
                path: 'captain',
                select: 'name'
            }
        ]);
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Get all positions
    const defensivePositions = [ 'CB', 'LB', 'RB' ];
    const goalkeeperPositions = [ 'GK' ];
    const midfieldPositions = [ 'CMF', 'DMF', 'AMF' ];
    const fowardPositions = [ 'LW', 'RW', 'ST' ];

    // Sort them into an object to return
    const players = [
        {
            name: 'Keepers',
            players: foundTeam.players.filter( player => goalkeeperPositions.includes( player.position ) )
        },
        {
            name: 'Defenders',
            players: foundTeam.players.filter( player => defensivePositions.includes( player.position ) )
        },
        {
            name: 'Midfielders',
            players: foundTeam.players.filter( player => midfieldPositions.includes( player.position ) )
        },
        {
            name: 'Forwards',
            players: foundTeam.players.filter( player => fowardPositions.includes( player.position ) )
        },
    ]
    const { coach, assistantCoach, captain } = foundTeam;

    // Return success
    return { success: true, message: 'Players Retrieved', data: { coach, assistantCoach, captain, players } };
}

exports.getSingleTeamStats = async ({ teamId }) => {
    // Fetch the team and its fixtures
    const team = await db.Team.findById( teamId ).populate('fixtures');
    if ( !team ) return { success: false, message: 'Team not found' };

    if ( !team.fixtures.length ) {
        return {
            success: true,
            message: 'Team Stats Acquired',
            data: [
                { title: 'Summary', data: { matches: 0, goalsScored: 0, goalsConceded: 0 } },
                { title: 'Attacking', data: { goalsPerGame: 0, cornersPerGame: 0, offsidesPerGame: 0 } },
                { title: 'Defending', data: { goalsConcededPerGame: 0, yellowCardsPerGame: 0, redCardsPerGame: 0, cleanSheets: 0, foulsPerGame: 0 } }
            ]
        };
    }

    let totalMatches = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let totalCorners = 0;
    let totalOffsides = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let totalFouls = 0;
    let cleanSheets = 0;

    for ( const fixture of team.fixtures ) {
        if ( fixture.status !== 'completed' ) continue;

        const isHome = fixture.homeTeam._id.equals( teamId );

        totalMatches++;

        goalsScored += isHome ? fixture.result.homeScore || 0 : fixture.result.awayScore || 0;
        goalsConceded += isHome ? fixture.result.awayScore || 0 : fixture.result.homeScore || 0;

        const stats = await db.MatchStatistic.findOne({ fixture: fixture._id });
        if ( !stats ) continue;

        const teamStats = isHome ? stats.home : stats.away;

        totalCorners += teamStats.corners;
        totalOffsides += teamStats.offsides;
        totalYellowCards += teamStats.yellowCards;
        totalRedCards += teamStats.redCards;
        totalFouls += teamStats.fouls;

        if ( ( isHome && fixture.result.awayScore === 0 ) || ( !isHome && fixture.result.homeScore === 0 ) ) {
            cleanSheets++;
        }
    }

    if ( totalMatches === 0 ) {
        return {
            success: true,
            message: 'Team Stats Acquired',
            data: [
                { title: 'Summary', data: { matches: 0, goalsScored: 0, goalsConceded: 0 } },
                { title: 'Attacking', data: { goalsPerGame: 0, cornersPerGame: 0, offsidesPerGame: 0 } },
                { title: 'Defending', data: { goalsConcededPerGame: 0, yellowCardsPerGame: 0, redCardsPerGame: 0, cleanSheets: 0, foulsPerGame: 0 } }
            ]
        }
    }

    const goalsPerGame = (goalsScored / totalMatches).toFixed(2);
    const cornersPerGame = (totalCorners / totalMatches).toFixed(2);
    const offsidesPerGame = (totalOffsides / totalMatches).toFixed(2);
    const goalsConcededPerGame = (goalsConceded / totalMatches).toFixed(2);
    const yellowCardsPerGame = (totalYellowCards / totalMatches).toFixed(2);
    const redCardsPerGame = (totalRedCards / totalMatches).toFixed(2);
    const foulsPerGame = (totalFouls / totalMatches).toFixed(2);

    return {
        success: true,
        message: 'Team Stats Acquired',
        data: [
            {
                title: 'Summary',
                data: {
                    matches: totalMatches,
                    goalsScored,
                    goalsConceded
                }
            },
            {
                title: 'Attacking',
                data: {
                    goalsPerGame,
                    cornersPerGame,
                    offsidesPerGame
                }
            },
            {
                title: 'Defending',
                data: {
                    goalsConcededPerGame,
                    yellowCardsPerGame,
                    redCardsPerGame,
                    cleanSheets,
                    foulsPerGame
                }
            }
        ]
    }
}

exports.getFriendlyRequests = async ({ teamId }) => {
    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return { success: false, message: 'Invalid Team ID' };
    }

    // Check if team exists
    const foundTeam = await db.Team.findById( teamId ).populate({ 
        path: 'friendlyRequests.team', 
        select: 'name department shorthand level' 
    });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Friendly Requests Retrieved', data: foundTeam.friendlyRequests };
}

exports.getCompetitionRequests = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId ).populate({ 
        path: 'competitionInvitations', 
        populate: { 
            path: 'competition', 
            select: 'name type status' 
        } 
    });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Friendly Requests Retrieved', data: foundTeam.players };
}

exports.sendMatchRequest = async ( { teamId }, { date, location, recipientTeamId } ) => {
    // Check if recipient exists
    const foundReciepientTeam = await db.Team.findById( recipientTeamId );
    if( !foundReciepientTeam ) return { success: false, message: 'Target team Not Found' };
    // Check if sender exists
    const foundSenderTeam = await db.Team.findById( teamId );
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

    // Return success
    return { success: true, message: 'Friendly Request Sent Successfully', data: { foundSenderTeam, requestRecipient } };
}

// exports.getRecievedMatchRequests = async ({  })

exports.updateMatchRequestStatus = async ({ teamId, requestId }, { status }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if request exists
    const requestExists = foundTeam.friendlyRequests.some( request => request.requestId.equals( requestId ) );
    if( !requestExists ) return { success: false, message: 'Request Not Found' };

    // Update request status for reciever
    const updatedRequests = foundTeam.friendlyRequests.map( async ( request ) => {
        if( request.requestId.equals( requestId ) ) {
            if( request.type === "recieved" ) {
                // Update the request on the sender and reciever too
                const updatedSender = await db.Team.updateOne(
                    { 
                        _id: request.team,
                        "friendlyRequests.requestId": requestId
                    },
                    {
                        $set: { "friendlyRequests.$.status": status }
                    },
                    { new: true }
                );
                const updatedReciever = await db.Team.updateOne(
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
    const refreshedTeam = await db.Team.findById( teamId ).populate({
        path: 'friendlyRequests.team',
        select: 'name department level'
    });

    // Return success
    return { success: true, message: 'Request Status Updated', data: refreshedTeam.friendlyRequests };
}

exports.updateCompetitionInvitationStatus = async ({ teamId, competitionId }, { status }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if competition invitation exists
    const competitionExists = foundTeam.competitionInvitations.some( invitation => invitation.competition.equals( competitionId ) );
    if( !competitionExists ) return { success: false, message: 'No Invitation For This Competition' };

    // Update Invitation Status
    const updatedCompetitionInvitations = foundTeam.competitionInvitations.map( async ( invitation ) => {
        if( invitation.competition.equals( competitionId ) ) {
            const updatedStatus = await db.Team.updateOne(
                { 
                    _id: teamId,
                    "competitionInvitations.competition": requestId
                },
                {
                    $set: { "competitionInvitations.$.status": status }
                },
                { new: true }
            )
        }
    });

    await Promise.all( updatedCompetitionInvitations );

    // Refresh team competition status
    const refresedTeam = await db.Team.findOneById( teamId ).populate({
        path: 'competitionInvitations.competition',
        select: 'name'
    });

    // Return success
    return { success: true, message: 'Invitation Status Changed', data: refresedTeam };
}

exports.checkSquadList = async ({ teamId }, { players, coach, assistantCoach }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if squadList belongs to team
    let invalidPlayers = false;
    players.forEach( player => {
        if( !foundTeam.players.includes( player ) ) return invalidPlayers = true;
        return null
    });
    if( invalidPlayers ) return { success: false, message: 'Invalid Players' };

    // Return success
    return { success: true, message: 'Players Valid Proceed To Submit', data: { players, coach, assistantCoach } };
}

exports.updateTeamAdmin = async ({ teamId }, { adminId }) => {
    // Check if admin exists and is a team-admin
    const foundAdmin = await db.User.findById( adminId );
    if( !foundAdmin || foundAdmin.role !== 'team-admin' ) return { success: false, message: 'Invalid Admin' };

    // Check if team exists and add admin
    const updatedTeam = await db.Team.findByIdAndUpdate(
        teamId,
        { admin: adminId },
        { new: true }
    ).populate({
        path: 'admin',
        select: 'name'
    });
    if( !updatedTeam ) return { success: false, message: 'Invalid Team' }

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedTeam };
}

module.exports = exports;