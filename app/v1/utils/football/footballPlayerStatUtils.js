const db = require('../../config/db');

// Function to update general stats inside the array
const updatePlayerGeneralRecord = async ( playerId, statField, count = 1 ) => {
    const year = new Date().getFullYear();

    const player = await db.FootballPlayer.findById( playerId );
    if ( !player ) return;

    const yearIndex = player.generalRecord.findIndex( r => r.year === year );

    if ( yearIndex === -1 ) {
        // Add new year record if not found
        player.generalRecord.push({
            year,
            goals: 0,
            ownGoals: 0,
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
    await db.FootballPlayer.updateOne(
        { _id: playerId, "generalRecord.year": year },
        { $inc: { [`generalRecord.$.${statField}`]: count } }
    );
};
const updatePlayerGeneralAppearances = async ( playerId, count = 1 ) => {
    const year = new Date().getFullYear();

    const player = await db.FootballPlayer.findById( playerId );
    if ( !player ) return;

    const yearIndex = player.generalRecord.findIndex(r => r.year === year);

    if (yearIndex === -1) {
        // Add new year record if not found
        player.generalRecord.push({
            year,
            goals: 0,
            ownGoals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            appearances: 0,
            cleanSheets: 0
        });
    }

    // Save player
    await player.save();

    // Update appearances field
    await db.FootballPlayer.updateOne(
        { _id: playerId, "generalRecord.year": year },
        { $inc: { "generalRecord.$.appearances": count } }
    );
};

// Function to update competition-specific stats
const updatePlayerCompetitionStats = async ( playerId, statField, count = 1, competitionId ) => {
    const year = new Date().getFullYear();

    if ( !competitionId ) return;
    if( !playerId ) return;

    let playerStat = await db.FootballPlayerCompetitionStat.findOne({
        competition: competitionId,
        player: playerId,
        year
    });

    if ( !playerStat ) {
        playerStat = new db.FootballPlayerCompetitionStat({
            competition: competitionId,
            player: playerId,
            year,
            goals: 0,
            ownGoals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            appearances: 0,
            cleanSheets: 0
        });
    }

    playerStat[ statField ] += count;
    await playerStat.save();
};
const updatePlayerCompetitionAppearances = async ( playerId, count = 1, competitionId ) => {
    const year = new Date().getFullYear();

    if ( !competitionId ) return;

    let playerStat = await db.FootballPlayerCompetitionStat.findOne({
        competition: competitionId,
        player: playerId,
        year
    });

    if ( !playerStat ) {
        playerStat = new db.FootballPlayerCompetitionStat({
            competition: competitionId,
            player: playerId,
            year,
            goals: 0,
            ownGoals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            appearances: 0,
            cleanSheets: 0
        });
    }

    playerStat.appearances += count;
    await playerStat.save();
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
const processAppearanceUpdate = async ( players, competitionId ) => {
    if ( !players || players.length === 0 ) return;

    await Promise.all(players.map(async ( playerId ) => {
        await updatePlayerGeneralAppearances( playerId, 1 );
        await updatePlayerCompetitionAppearances( playerId, 1, competitionId );
    }));
};

// Helper function to update player stats
async function updatePlayerStats({
    playerId,
    teamId,
    competitionId,
    season,
    matchType,
    updates
}) {
    if (!playerId) return;

    async function determineTeamType(teamId) {
        if (!teamId) return 'unknown';
        
        const team = await db.FootballTeam.findById(teamId).select('type').lean();
        
        if (!team) return 'unknown';
        
        // Map team.type to the corresponding player field prefix
        const typeMap = {
            base: 'base',
            department: 'department',
            club: 'club',
            school: 'school'
        };
        
        return typeMap[team.type] || 'unknown';
    }
  
    const $inc = {};
    const teamType = await determineTeamType(teamId); // Implement based on your team model
  
    // Update career totals
    Object.keys(updates).forEach(stat => {
        $inc[`stats.careerTotals.${stat}`] = updates[stat];
    });
  
    // Update team-specific stats
    if (teamType) {
        Object.keys(updates).forEach(stat => {
            $inc[`stats.byTeam.${teamType}.totals.${stat}`] = updates[stat];
            $inc[`stats.byTeam.${teamType}.${matchType}.$[elem].${stat}`] = updates[stat];
        });
    }
  
    // Update competition stats if applicable
    if (competitionId) {
        Object.keys(updates).forEach(stat => {
            $inc[`stats.byCompetition.$[comp].stats.${stat}`] = updates[stat];
        });
    }
  
    const updateOps = {
        $inc,
        $setOnInsert: {
            // Initialize fields if needed
        }
    };
  
    const arrayFilters = [];
    
    if (teamType) {
        arrayFilters.push({
            'elem.season': season
        });
    }
  
    if (competitionId) {
        arrayFilters.push({
            'comp.competition': competitionId,
            'comp.season': season
        });
    }
  
    await db.FootballPlayer.findByIdAndUpdate(
        playerId,
        updateOps,
        {
            arrayFilters: arrayFilters.length ? arrayFilters : undefined,
            upsert: true
        }
    );
}
  
// Helper to get goalkeepers from lineup
async function getGoalkeepers(lineup) {
    if (!lineup?.startingXI) return [];
    
    const players = await db.FootballPlayer.find({
        _id: { $in: lineup.startingXI },
        position: 'GK'
    }).select('_id');
    
    return players.map(p => p._id);
}

module.exports = { 
    updatePlayerGeneralRecord, updatePlayerGeneralAppearances,
    updatePlayerCompetitionStats, updatePlayerCompetitionAppearances,
    processStatUpdate, processAppearanceUpdate,

    updatePlayerStats,
    getGoalkeepers
}