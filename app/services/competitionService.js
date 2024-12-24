const db = require('../config/db');

exports.createCompetition = async ({ name, rules, type }) => {
    // Create competition
    const competition = await db.Competition.create({ name, rules, type });

    // Return success
    return { success: true, message: 'Competition Created', data: competition };
};

exports.getAllCompetitions = async () => {
    // Get all competitions
    const allCompetitions = await db.Competition.find();

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

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedCompetition }
}

exports.addCompetitionFixture = async ({ competitionId }, { fixtureId }) => {
    // Check if competition exists and update
    const updatedCompetition = await db.Competition.findByIdAndUpdate( 
        competitionId,
        { $addToSet: { fixtures: fixtureId } },
        { new: true }
    ).populate({ 
        path: 'fixtures',
        select: 'homeTeam awayTeam date'
    });
    if( !updatedCompetition ) return { success: false, message: 'Invalid Competition' };

    // Return success
    return { success: true, message: 'Admin Updated', data: updatedCompetition }
}

exports.addTeamToLeague = async ({ competitionId }, { teamIds }) => {
    // Check if competition exists
    const foundCompetition = await db.Competition.findById( competitionId );
    if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

    // Loop through teamIds
    
}

module.exports = exports;