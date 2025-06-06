const db = require('../config/db');

exports.addPlayers = async ({ playerArray }, team ) => {
    // Check if player already exists
    const existingPlayers = await db.Player.find({ name: { $in: playerArray.map( player => player.name ) }, team: team._id }, "name" );
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
    const createdPlayers = await db.Player.insertMany( playersData );

    // Update team document
    const playerIds = createdPlayers.map( player => player._id );
    team.players.push( ...playerIds );
    await team.save();

    // Return success
    return { success: true, message: 'Players Added', data: createdPlayers };
}

exports.getPlayer = async ({ playerId }) => {
    const foundPlayer = await db.Player.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    // Return success
    return { success: true, message: 'Player Acquired', data: foundPlayer };
}

exports.updateTeamPlayer = async ({ playerId }, { name, position, number }) => {
    const foundPlayer = await db.Player.findById( playerId );
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
    const foundPlayer = await db.Player.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const updatedTeam = await db.Team.findOneAndUpdate(
        { _id: foundPlayer.team },
        { $pull: { players: foundPlayer._id }},
        { new: true }
    );
    const deletedCompetitionStat = await db.PlayerCompetitionStats.findOneAndDelete({ player: foundPlayer._id });
    const deletedPlayer = await db.Player.findByIdAndDelete( playerId );

    // Return success
    return { success: true, message: 'Player Deleted', data: deletedPlayer }    
}

module.exports = exports;