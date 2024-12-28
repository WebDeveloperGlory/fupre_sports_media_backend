const db = require('../config/db');
const mongoose = require('mongoose');

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

exports.getSingleTeam = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Team Acquired', data: foundTeam };
}

exports.getTeamPlayers = async ({ teamId }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId ).populate({ path: 'players' });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Players Retrieved', data: foundTeam.players };
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