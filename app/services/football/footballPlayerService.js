const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');

exports.addPlayers = async ({ playerArray }, team, { userId, auditInfo } ) => {
    // Check if team exists
    const foundTeam = await db.FootballTeam.findById( team );
    if( !foundTeam ) return { success: false, message: 'Invalid Team' }

    // Check if player already exists
    const existingPlayers = await db.FootballPlayer.find({ name: { $in: playerArray.map( player => player.name ) }, team: foundTeam._id }, "name" );
    if( existingPlayers.length > 0 ) {
        const existingNames = existingPlayers.map( player => player.name );
        return { success: false, message: `Players with names ${ existingNames.join(', ') } already exist in team`}
    }

    // Loop through each player and create them
    const playersData = playerArray.map( player => ({
        ...player,
        team: foundTeam._id,
        generalRecord: [
            {
                year: new Date().getFullYear(),
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                appearances: 0,
                cleanSheets: 0
            }
        ]
    }) );
    const createdPlayers = await db.FootballPlayer.insertMany( playersData );

    // Update team document
    const playerIds = createdPlayers.map( player => {
        // Log action
        logActionManually({
            userId, auditInfo,
            action: 'CREATE',
            entity: 'FootballPlayer',
            entityId: player._id,
            details: {
                message: `New Player: ${ player.name } Created For Team ${ foundTeam.name }`
            }
        });

        return player._id 
    });
    foundTeam.players.push( ...playerIds );
    await team.save();    

    // Return success
    return { success: true, message: 'Players Added', data: createdPlayers };
}

exports.getPlayer = async ({ playerId }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    // Return success
    return { success: true, message: 'Player Acquired', data: foundPlayer };
}

exports.updateTeamPlayer = async ({ playerId }, { name, position, number }, { userId, auditInfo }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    // Save to a const as old data
    const oldPlayer = await db.FootballPlayer.findById( playerId );

    if( name ) foundPlayer.name = name;
    if( position ) foundPlayer.position = position;
    if( number ) foundPlayer.number = number;

    // Save updates
    await foundPlayer.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballPlayer',
        entityId: foundPlayer._id,
        details: {
            message: 'Player Updated',
            affectedFields: [
                name !== undefined ? "name" : null,
                position !== undefined ? "position" : null,
                number !== undefined ? "number" : null,
            ].filter(Boolean), // Remove null values
        },
        previousValues: oldPlayer.toObject(),
        newValues: foundPlayer.toObject()
    });

    // Return success
    return { success: true, message: 'Player Updated', data: foundPlayer };
}

exports.deleteTeamPlayer = async ({ playerId }, { userId, auditInfo }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const updatedTeam = await db.FootballTeam.findOneAndUpdate(
        { _id: foundPlayer.team },
        { $pull: { players: foundPlayer._id }},
        { new: true }
    );
    const deletedCompetitionStat = await db.FootballPlayerCompetitionStat.findOneAndDelete({ player: foundPlayer._id });
    const deletedPlayer = await db.FootballPlayer.findByIdAndDelete( playerId );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballPlayer',
        entityId: foundPlayer._id,
        details: {
            message: 'Player Deleted, Team Player List Updated',
        },
        previousValues: foundPlayer.toObject(),
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
    return { success: true, message: 'Player Deleted', data: deletedPlayer }    
}

exports.updatePlayerRecords = async ({ playerId }, { goals, assists, yellowCards, redCards, appearances, cleanSheets }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const currentYear = new Date().getFullYear();
    const currentRecord = foundPlayer.generalRecord.find( record => record.year === currentYear );
    if( !currentRecord ) return { success: false, message: 'Player record for current year not found' };

    // Clone old record before modification
    const oldRecord = JSON.parse(JSON.stringify(currentRecord));

    if( goals ) currentRecord.goals = goals;
    if( assists ) currentRecord.assists = assists;
    if( yellowCards ) currentRecord.yellowCards = yellowCards;
    if( redCards ) currentRecord.redCards = redCards;
    if( appearances ) currentRecord.appearances = appearances;
    if( cleanSheets ) currentRecord.cleanSheets = cleanSheets;

    // Save updates
    await foundPlayer.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballPlayer',
        entityId: foundPlayer._id,
        details: {
            message: 'Player Updated',
            affectedFields: [
                goals !== undefined ? "goals" : null,
                assists !== undefined ? "assists" : null,
                yellowCards !== undefined ? "yellowCards" : null,
                redCards !== undefined ? "redCards" : null,
                appearances !== undefined ? "appearances" : null,
                cleanSheets !== undefined ? "cleanSheets" : null,
            ].filter(Boolean), // Remove null values
        },
        previousValues: oldRecord.toObject(),
        newValues: currentRecord.toObject()
    });

    // Return success
    return { success: true, message: 'Player Record Updated', data: foundPlayer };
}

module.exports = exports;