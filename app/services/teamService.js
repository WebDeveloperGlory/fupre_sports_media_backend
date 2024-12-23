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
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId ).populate({ 
        path: 'friendlyRequests', 
        populate: { 
            path: 'team', 
            select: 'name department shorthand level' 
        } 
    });
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Return success
    return { success: true, message: 'Friendly Requests Retrieved', data: foundTeam.players };
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
    return { success: true, message: 'Friendly Request Sent Successfully', data: { foundReciepientTeam, requestRecipient } };
}

// exports.getRecievedMatchRequests = async ({  })

exports.updateMatchRequestStatus = async ({ teamId, requestId }, { status }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if request exists
    const requestExists = foundTeam.friendlyRequests.some( request => request.requestId === requestId );
    if( !requestExists ) return { success: false, message: 'Request Not Found' };

    // Update request status
    const updatedRequests = foundTeam.friendlyRequests.map( request => {
        if( request.requestId === requestId ) return { ...request, status };
        return request;
    });
    foundTeam.friendlyRequests = updatedRequests;
    await foundTeam.save();

    // Return success
    return { success: true, message: 'Request Status Updated', data: updatedRequests };
}

exports.updateCompetitionInvitationStatus = async ({ teamId, competitionId }, { status }) => {
    // Check if team exists
    const foundTeam = await db.Team.findById( teamId );
    if( !foundTeam ) return { success: false, message: 'Team Not Found' };

    // Check if competition invitation exists
    const competitionExists = foundTeam.competitionInvitations.some( invitation => invitation.competition === competitionId );
    if( !competitionExists ) return { success: false, message: 'No Invitation For This Competition' };

    // Update Invitation Status
    const updatedCompetitionInvitations = foundTeam.competitionInvitations.map( invitation => {
        if( invitation.competition === competitionId ) return { ...invitation, status };
        return invitation;
    });
    foundTeam.competitionInvitations = updatedCompetitionInvitations;
    await foundTeam.save();

    // Return success
    return { success: true, message: 'Invitation Status Changed', data: updatedCompetitionInvitations };
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

module.exports = exports;