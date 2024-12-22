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
        team: team._id
    }) );
    const createdPlayers = await db.Player.insertMany( playersData );

    // Update team document
    const playerIds = createdPlayers.map( player => player._id );
    team.players.push( ...playerIds );
    await team.save();

    // Return success
    return { success: true, message: 'Players Added', data: createdPlayers };
}

module.exports = exports;