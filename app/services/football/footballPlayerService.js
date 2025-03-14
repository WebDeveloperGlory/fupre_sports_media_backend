const db = require('../../config/db');

exports.addPlayers = async ({ playerArray }, team ) => {
    // Check if player already exists
    const existingPlayers = await db.FootballPlayer.find({ name: { $in: playerArray.map( player => player.name ) }, team: team._id }, "name" );
    if( existingPlayers.length > 0 ) {
        const existingNames = existingPlayers.map( player => player.name );
        return { success: false, message: `Players with names ${ existingNames.join(', ') } already exist in team`}
    }

    // Loop through each player and create them
    const playersData = playerArray.map( player => ({
        ...player,
        team: team._id,
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
    const playerIds = createdPlayers.map( player => player._id );
    team.players.push( ...playerIds );
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

exports.updateTeamPlayer = async ({ playerId }, { name, position, number }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    if( name ) foundPlayer.name = name;
    if( position ) foundPlayer.position = position;
    if( number ) foundPlayer.number = number;

    // Save updates
    await foundPlayer.save();

    // Return success
    return { success: true, message: 'Player Updated', data: foundPlayer };
}

exports.deleteTeamPlayer = async ({ playerId }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const updatedTeam = await db.FootballTeam.findOneAndUpdate(
        { _id: foundPlayer.team },
        { $pull: { players: foundPlayer._id }},
        { new: true }
    );
    const deletedCompetitionStat = await db.FootballPlayerCompetitionStats.findOneAndDelete({ player: foundPlayer._id });
    const deletedPlayer = await db.FootballPlayer.findByIdAndDelete( playerId );

    // Return success
    return { success: true, message: 'Player Deleted', data: deletedPlayer }    
}

exports.updatePlayerRecords = async ({ playerId }, { goals, assists, yellowCards, redCards, appearances, cleanSheets }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const currentYear = new Date().getFullYear();
    const currentRecord = foundPlayer.generalRecord.find( record => record.year === currentYear );
    if( !currentRecord ) return { success: false, message: 'Player record for current year not found' };

    if( goals ) currentRecord.goals = goals;
    if( assists ) currentRecord.assists = assists;
    if( yellowCards ) currentRecord.yellowCards = yellowCards;
    if( redCards ) currentRecord.redCards = redCards;
    if( appearances ) currentRecord.appearances = appearances;
    if( cleanSheets ) currentRecord.cleanSheets = cleanSheets;

    // Save updates
    await foundPlayer.save();

    // Return success
    return { success: true, message: 'Player Record Updated', data: foundPlayer };
}

module.exports = exports;