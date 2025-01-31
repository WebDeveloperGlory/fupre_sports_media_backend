const db = require('../config/db');

// Function to update general stats inside the array
const updatePlayerGeneralRecord = async ( playerId, statField, count = 1 ) => {
    const year = new Date().getFullYear();

    const player = await db.Player.findById(playerId);
    if ( !player ) return { error: `Player ${ playerId } not found` };

    const yearIndex = player.generalRecord.findIndex( r => r.year === year );

    if ( yearIndex === -1 ) {
        // Add new year record if not found
        player.generalRecord.push({
            year,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            appearances: 0,
            cleanSheets: 0
        });
    }

    // Save player
    await player.save();

    // Update the specific field
    await db.Player.updateOne(
        { _id: playerId, "generalRecord.year": year },
        { $inc: { [`generalRecord.$.${statField}`]: count } }
    );
};

  // Function to update competition-specific stats
  const updatePlayerCompetitionStats = async ( playerId, statField, count = 1, competitionId ) => {
    const year = new Date().getFullYear();

    if ( !competitionId ) return;

    let playerStat = await db.PlayerCompetitionStats.findOne({
        competition: competitionId,
        player: playerId,
        year
    });

    if ( !playerStat ) {
        playerStat = new db.PlayerCompetitionStats({
            competition: competitionId,
            player: playerId,
            year,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            appearances: 0,
            cleanSheets: 0
        });
    }

    playerStat[ statField ] += count;
    await playerStat.save();

    const updatedCompetition = await db.Competition.findByIdAndUpdate(
        competitionId,
        { $addToSet: { playerStats: playerStat._id } }
    )
};

// Function to process a stat update for both general & competition records
const processStatUpdate = async ( statArray, statField, competitionId ) => {
    if ( !statArray ) return;
    
    await Promise.all(
        statArray.map( async ({ playerId, count = 1 }) => {
            await updatePlayerGeneralRecord( playerId, statField, count );
            await updatePlayerCompetitionStats( playerId, statField, count, competitionId );
        })
    );
};

module.exports = { updatePlayerGeneralRecord, updatePlayerCompetitionStats, processStatUpdate }