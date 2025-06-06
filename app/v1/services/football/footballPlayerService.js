const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');

exports.addPlayers = async ({ playerArray, teamType, teamId }, { userId, auditInfo }) => {
    // Validate team exists and type is valid
    const validTeamTypes = [ 'baseTeam', 'departmentTeam', 'clubTeam', 'schoolTeam' ];
    if (!validTeamTypes.includes(teamType)) {
        return { success: false, message: 'Invalid team type' };
    }

    const foundTeam = await db.FootballTeam.findById( teamId );
    if (!foundTeam) return { success: false, message: 'Invalid Team' };

    // Check for existing players by name
    const names = playerArray.map(player => player.name);
    const existingPlayers = await db.FootballPlayer.find({ 
        name: { $in: names },
        $or: [
            { baseTeam: teamId },
            { departmentTeam: teamId },
            { clubTeam: teamId },
            { schoolTeam: teamId }
        ]
    }, "name");

    if (existingPlayers.length > 0) {
        const existingMatrics = existingPlayers.map(p => p.matricNumber);
        return { 
            success: false, 
            message: `Players with matric numbers ${existingMatrics.join(', ')} already exist` 
        };
    }

    // Create players with proper team assignment
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}/${currentYear + 1}`;
    
    const playersData = playerArray.map(player => ({
        ...player,
        [teamType]: teamId,
        stats: {
            careerTotals: {
                goals: 0,
                ownGoals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                appearances: 0,
                cleanSheets: 0,
                minutesPlayed: 0
            },
            byTeam: {
                [teamType.replace('Team', '')]: {
                    friendly: [],
                    competitive: [],
                    totals: {
                        season: academicYear,
                        goals: 0,
                        ownGoals: 0,
                        assists: 0,
                        yellowCards: 0,
                        redCards: 0,
                        appearances: 0,
                        cleanSheets: 0,
                        minutesPlayed: 0
                    }
                }
            },
            byCompetition: []
        }
    }));

    const createdPlayers = await db.FootballPlayer.insertMany(playersData);

    // Update team document
    const playerIds = createdPlayers.map(player => {
        logActionManually({
            userId,
            auditInfo,
            action: 'CREATE',
            entity: 'FootballPlayer',
            entityId: player._id,
            details: {
                message: `New Player ${player.name} (${player.matricNumber}) added to ${foundTeam.name}`
            }
        });
        return player._id;
    });

    foundTeam.players.push(...playerIds);
    await foundTeam.save();

    return { 
        success: true, 
        message: `${createdPlayers.length} players added successfully`, 
        data: createdPlayers 
    };
};

exports.getPlayer = async ({ playerId }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId )
        .populate('baseTeam', 'name type')
        .populate('departmentTeam', 'name type')
        .populate('clubTeam', 'name type')
        .populate('schoolTeam', 'name type');

    if (!foundPlayer) return { success: false, message: 'Player not found' };

    // Calculate age if birthDate exists
    let age = null;
    if (foundPlayer.birthDate) {
        const diff = Date.now() - foundPlayer.birthDate.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    // Prepare simplified response
    const playerData = {
        ...foundPlayer.toObject(),
        age,
        currentTeams: {
            base: foundPlayer.baseTeam,
            department: foundPlayer.departmentTeam,
            club: foundPlayer.clubTeam,
            school: foundPlayer.schoolTeam
        }
    };

    return { 
        success: true, 
        message: 'Player data retrieved', 
        data: playerData 
    };
};

exports.updatePlayer = async ({ playerId }, { updateData }, { userId, auditInfo }) => {
    const allowedUpdates = [
        'name', 'position', 'number', 'birthDate', 
        'departmentTeam', 'clubTeam', 'schoolTeam', 'clubStatus'
    ];
    
    const updates = Object.keys( updateData );
    const isValidUpdate = updates.every(update => allowedUpdates.includes( update ));
    
    if (!isValidUpdate) {
        return { 
            success: false, 
            message: 'Invalid update fields attempted' 
        };
    }

    const player = await db.FootballPlayer.findById(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const oldPlayer = player.toObject();
    
    // Handle team transfers
    if ( updateData.clubTeam && updateData.clubTeam !== player.clubTeam?.toString() ) {
        player.transferDetails = {
            status: 'transferred',
            fromClub: player.clubTeam,
            toClub: updateData.clubTeam,
            transferDate: new Date()
        };
        player.clubStatus = 'transferred';
    }

    // Apply other updates
    updates.forEach(update => {
        if (update !== 'clubTeam') {
            player[update] = updateData[update];
        }
    });

    // Save changes
    await player.save();

    // Log the action
    const changedFields = updates.filter(field => 
        JSON.stringify(oldPlayer[field]) !== JSON.stringify(player[field])
    );

    if (changedFields.length > 0) {
        logActionManually({
            userId,
            auditInfo,
            action: 'UPDATE',
            entity: 'FootballPlayer',
            entityId: player._id,
            details: {
                message: 'Player profile updated',
                affectedFields: changedFields
            },
            previousValues: oldPlayer,
            newValues: player.toObject()
        });
    }

    return { 
        success: true, 
        message: 'Player updated successfully', 
        data: player 
    };
};

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

exports.updatePlayerStats = async ({ playerId }, { statsUpdate }, { userId, auditInfo }) => {
    const { teamType, matchType, competitionId, season, stats } = statsUpdate;
    
    const validTeamTypes = ['base', 'department', 'club', 'school'];
    const validMatchTypes = ['friendly', 'competitive'];
    
    if (!validTeamTypes.includes(teamType) || 
        (matchType && !validMatchTypes.includes(matchType))
    ) {
        return { 
            success: false, 
            message: 'Invalid team type or match type' 
        };
    }

    const player = await db.FootballPlayer.findById(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    // Initialize stats objects if they don't exist
    if (!player.stats.byTeam[teamType]) {
        player.stats.byTeam[teamType] = {
            friendly: [],
            competitive: [],
            totals: {
                season: season || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
                goals: 0,
                ownGoals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                appearances: 0,
                cleanSheets: 0,
                minutesPlayed: 0
            }
        };
    }

    // Update career totals
    Object.keys(stats).forEach(stat => {
        if (player.stats.careerTotals[stat] !== undefined) {
            player.stats.careerTotals[stat] += stats[stat] || 0;
        }
    });

    // Update team-specific totals
    Object.keys(stats).forEach(stat => {
        if (player.stats.byTeam[teamType].totals[stat] !== undefined) {
            player.stats.byTeam[teamType].totals[stat] += stats[stat] || 0;
        }
    });

    // Update match-type specific stats if provided
    if (matchType) {
        let seasonStats = player.stats.byTeam[teamType][matchType].find(
            s => s.season === season
        );

        if (!seasonStats) {
            seasonStats = {
                season,
                goals: 0,
                ownGoals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                appearances: 0,
                cleanSheets: 0,
                minutesPlayed: 0
            };
            player.stats.byTeam[teamType][matchType].push(seasonStats);
        }

        Object.keys(stats).forEach(stat => {
            if (seasonStats[stat] !== undefined) {
                seasonStats[stat] += stats[stat] || 0;
            }
        });
    }

    // Update competition stats if provided
    if (competitionId) {
        let compStats = player.stats.byCompetition.find(
            c => c.competition.equals(competitionId) && c.season === season
        );

        if (!compStats) {
            compStats = {
                competition: competitionId,
                season,
                stats: {
                    goals: 0,
                    ownGoals: 0,
                    assists: 0,
                    yellowCards: 0,
                    redCards: 0,
                    appearances: 0,
                    cleanSheets: 0,
                    minutesPlayed: 0
                }
            };
            player.stats.byCompetition.push(compStats);
        }

        Object.keys(stats).forEach(stat => {
            if (compStats.stats[stat] !== undefined) {
                compStats.stats[stat] += stats[stat] || 0;
            }
        });
    }

    await player.save();

    // Log the action
    logActionManually({
        userId,
        auditInfo,
        action: 'UPDATE',
        entity: 'FootballPlayer',
        entityId: player._id,
        details: {
            message: 'Player stats updated',
            teamType,
            matchType,
            competitionId,
            season,
            statChanges: stats
        }
    });

    return { 
        success: true, 
        message: 'Player stats updated successfully', 
        data: player.stats 
    };
};

exports.transferOrLoanPlayer = async (
    { playerId }, 
    { status, toClub, transferDate, returnDate }, 
    { userId, auditInfo }
) => {
    // Validate input
    if (!['loaned', 'transferred'].includes(status)) {
        return { success: false, message: 'Invalid transfer/loan status' };
    }
  
    // Check if player exists
    const player = await db.FootballPlayer.findById( playerId )
        .populate('clubTeam', 'name type');
    if ( !player ) {
        return { success: false, message: 'Player not found' };
    }
  
    // Check if target club exists (only for club transfers)
    const targetClub = await db.FootballTeam.findOne({
        _id: toClub,
        type: 'club'
    });
    if ( !targetClub ) {
        return { success: false, message: 'Invalid target club' };
    }
  
    // Save old data for audit
    const oldPlayer = player.toObject();
    const fromClub = player.clubTeam;
  
    // Validate transfer conditions
    if (status === 'loaned' && !returnDate) {
        return { success: false, message: 'Return date required for loans' };
    }
  
    if ( fromClub && fromClub._id.equals(toClub) ) {
        return { success: false, message: 'Cannot transfer/loan to same club' };
    }
  
    // Update player details
    player.clubTeam = toClub;
    player.clubStatus = status;
    player.transferDetails = {
        status,
        fromClub: fromClub?._id || null,
        toClub,
        transferDate: transferDate || new Date(),
        returnDate: status === 'loaned' ? returnDate : null
    };
  
    await player.save();
  
    // Update team rosters (remove from old club, add to new club)
    if ( fromClub ) {
        await db.FootballTeam.updateOne(
            { _id: fromClub._id },
            { 
                $pull: { 
                    players: playerId
                } 
            }
        );
    }
  
    await db.FootballTeam.updateOne(
        { _id: toClub },
        {
            $push: {
                players: playerId
            }
        }
    );
  
    // Log action
    logActionManually({
        userId,
        auditInfo,
        action: status === 'loaned' ? 'LOAN' : 'TRANSFER',
        entity: 'FootballPlayer',
        entityId: playerId,
        details: {
            message: `Player ${status} from ${fromClub?.name || 'No Club'} to ${targetClub.name}`,
            affectedFields: ['clubTeam', 'clubStatus', 'transferDetails'],
            transferDetails: player.transferDetails
        },
        previousValues: {
            clubTeam: oldPlayer.clubTeam,
            clubStatus: oldPlayer.clubStatus,
            transferDetails: oldPlayer.transferDetails
        },
        newValues: {
            clubTeam: player.clubTeam,
            clubStatus: player.clubStatus,
            transferDetails: player.transferDetails
        }
    });
  
    return { 
        success: true, 
        message: `Player ${status} successfully`,
        data: {
            player: {
                _id: player._id,
                name: player.name,
                newClub: {
                    _id: targetClub._id,
                    name: targetClub.name
                },
                oldClub: fromClub ? {
                    _id: fromClub._id,
                    name: fromClub.name
                } : null,
                transferDetails: player.transferDetails
            }
        }
    };
};

exports.updatePlayerRecords = async ({ playerId }, { goals, ownGoals, assists, yellowCards, redCards, appearances, cleanSheets }) => {
    const foundPlayer = await db.FootballPlayer.findById( playerId );
    if( !foundPlayer ) return { success: false, message: 'Invalid Player' };

    const currentYear = new Date().getFullYear();
    const currentRecord = foundPlayer.generalRecord.find( record => record.year === currentYear );
    if( !currentRecord ) return { success: false, message: 'Player record for current year not found' };

    // Clone old record before modification
    const oldRecord = JSON.parse(JSON.stringify(currentRecord));

    if( goals ) currentRecord.goals = goals;
    if( ownGoals ) currentRecord.ownGoals = ownGoals;
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
                ownGoals !== undefined ? "ownGoals" : null,
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