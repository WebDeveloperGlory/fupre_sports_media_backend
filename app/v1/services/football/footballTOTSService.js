const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');

exports.getAllSessions = async ({ isActive, year,  limit = 10, page = 1 }) => {
    // Calculate the number of documents to skip
    const skip = ( page - 1 ) * limit;
    let filter = {};

    // Check if filtering by isActive or year
    if( isActive ) filter.isActive = isActive;
    if( year ) filter.year = year;

    // Find all sessions
    const allSessions = await db.FootballTOTSSession.find( filter )
        .populate({
            path: 'competition',
            select: 'name'
        })
        .select('year competition isActive startDate endDate')
        .skip( skip )
        .limit( limit );

    const total = await db.FootballTOTSSession.countDocuments(filter);
    
    // Return success
    return { 
        success: true, 
        message: 'All Sessions Acquired', 
        data: {
            sessions: allSessions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil( total / limit )
            }
        } 
    };
}

exports.getSingleSession = async ({ sessionId }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId )
        .populate([
            {
                path: 'competition',
                select: 'name'
            },
            {
                path: 'elegiblePlayers.GK',
                select: 'name position number'
            },
            {
                path: 'elegiblePlayers.DEF',
                select: 'name position number'
            },
            {
                path: 'elegiblePlayers.MID',
                select: 'name position number'
            },
            {
                path: 'elegiblePlayers.FWD',
                select: 'name position number'
            },
        ])
        .select('-adminVoteWeight');
    if( !session ) return { success: false, message: 'Invalid Session' };

    // Count total votes
    const totalVotes = await db.FootballVotes.countDocuments({ session: sessionId });

    // Return success
    return { success: true, message: 'Session Acquired', data: { session, totalVotes } };
}

exports.getPlayersPerSession = async ({ sessionId }, { team, position }) => {
    if( position ) {
        // Validate position
        if( !['GK', 'DEF', 'MID', 'FWD' ].includes( position ) ) return { success: false, message: 'Invalid Position' };
        
        // Check if session exists
        const session = await db.FootballTOTSSession.findById( sessionId )
            .populate({
                path: `elegiblePlayers.${position}`,
                model: 'FootballPlayer'
            })
            .select('-adminVoteWeight');
        if( !session ) return { success: false, message: 'Invalid Session' };

        // Initialize filteredPlayers
        let filteredPlayers = session.elegiblePlayers[ position ];
        if( team ) {
            filteredPlayers = filteredPlayers.filter( player => player.team.toLowerCase().includes( team.toLowerCase() ) );
        }

        // Return success
        return { success: true, message: 'Players Acquired', data: filteredPlayers }
    } else {
        // Check if session exists
        const session = await db.FootballTOTSSession.findById( sessionId )
            .populate([
                {
                    path: `elegiblePlayers.GK`,
                    select: 'name position number'
                },
                {
                    path: `elegiblePlayers.DEF`,
                    select: 'name position number'
                },
                {
                    path: `elegiblePlayers.MID`,
                    select: 'name position number'
                },
                {
                    path: `elegiblePlayers.FWD`,
                    select: 'name position number'
                },
            ])
            .select('-adminVoteWeight');
        if( !session ) return { success: false, message: 'Invalid Session' };

        // Return success
        return { success: true, message: 'Players Acquired', data: session.elegiblePlayers }
    }
}

exports.getUserVote = async ({ userId }, { sessionId }) => {
    // Check if user vote exists
    const userSubmittion = await db.FootballVotes.findOne({ user: userId, session: sessionId })
        .populate([
            {
                path: 'session',
                select: 'year competition isActive'
            },
            {
                path: 'selectedPlayers.GK',
                select: 'name position number'
            },
            {
                path: 'selectedPlayers.DEF',
                select: 'name position number'
            },
            {
                path: 'selectedPlayers.MID',
                select: 'name position number'
            },
            {
                path: 'selectedPlayers.FWD',
                select: 'name position number'
            },
        ])
        .select('-weight');
    if( !userSubmittion ) return { success: false, message: "No User Vote" };

    // Return success
    return { success: true, message: 'User Vote Acquired', data: userSubmittion }
}

exports.getVoteCount = async ({ sessionId }) => {
    // Count total votes
    const totalSessionVotes = await db.FootballVotes.countDocuments({ session: sessionId });

}

exports.getFinalVoteResult = async ({ sessionId }) => {
    // Check if result exists
    const result = await db.FootballTOTSResult.findOne({ session: sessionId })
        .populate([
            {
                path: 'session',
                select: 'year competition isActive'
            },
            {
                path: 'adminChoice.GK votersChoice.GK finalWinner.GK',
                select: 'name position number'
            },
            {
                path: 'adminChoice.DEF votersChoice.DEF finalWinner.DEF',
                select: 'name position number'
            },
            {
                path: 'adminChoice.MID votersChoice.MID finalWinner.MID',
                select: 'name position number'
            },
            {
                path: 'adminChoice.FWD votersChoice.FWD finalWinner.FWD',
                select: 'name position number'
            },
        ]);
    if( !result ) return { success: false, message: 'No Results' }

    // Return success
    return { success: true, message: 'Results Acquired', data: result }
}

exports.createSession = async ({ year, competition, isActive, showVoteCount, startDate, endDate, adminVoteWeight }, { userId, auditInfo }) => {
    // Create session
    const createdSession = await db.FootballTOTSSession.create({ year, competition, isActive, showVoteCount, startDate, endDate, adminVoteWeight });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballTOTSSession',
        entityId: createdSession._id,
        details: {
            message: `TOTS Poll Created`
        }
    });

    // Return success
    return { success: true, message: 'TOTS Poll Created', message: 'CreatedTOTS' }
}

exports.addPlayersToSession = async ({ sessionId }, { playerArray }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId );
    if( !session ) return { success: false, message: 'Invalid Session' };

    // Check list of teams in session competition
    const competition = await db.FootballCompetition.findById( session.competition );
    const competitionTeams = competition.teams.map( team => team.team.toString() );

    // Check if players are in competition
    const players = await db.FootballPlayer.find({ _id: { $in: playerArray } });
    const playersInCompetition = players.filter( player => competitionTeams.includes( player.team.toString() ) );
    if( playersInCompetition.length !== playerArray.length ) return { success: false, message: 'Invalid Players' };
    if( playersInCompetition.length === 0 ) return { success: false, message: 'No Players Found' };

    // Add players to session
    const updatedSession = await db.FootballTOTSSession.findByIdAndUpdate(
        sessionId,
        {
            $addToSet: {
                [`elegiblePlayers.${playersInCompetition[0].position}`]: { $each: playersInCompetition }
            }
        },
        { new: true }
    );
    if( !updatedSession ) return { success: false, message: 'Failed to Update Session' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballTOTSSession',
        entityId: session._id,
        details: {
            message: 'Players Added to Session',
            affectedFields: [ `elegiblePlayers.${playersInCompetition[0].position}` ]
        },
        previousValues: session.toObject(),
        newValues: updatedSession.toObject()
    });

    // Return success
    return { success: true, message: 'Players Added to Session', data: updatedSession };
}

exports.deletePlayersFromSession = async ({ sessionId }, { playerArray }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId );
    if( !session ) return { success: false, message: 'Invalid Session' };

    // Check if players are in session
    const players = await db.FootballPlayer.find({ _id: { $in: playerArray } });
    const playersInSession = players.filter( player => {
        return session.elegiblePlayers[ player.position ].some( p => p.toString() === player._id.toString() );
    });
    if( playersInSession.length !== playerArray.length ) return { success: false, message: 'Invalid Players' };
    if( playersInSession.length === 0 ) return { success: false, message: 'No Players Found' };

    if( playersInSession.length > 0 ) {
        // Remove players from session
        const updatedSession = await db.FootballTOTSSession.findByIdAndUpdate(
            sessionId,
            {
                $pull: {
                    [`elegiblePlayers.${playersInSession[0].position}`]: { $in: playersInSession }
                }
            },
            { new: true }
        );
        if( !updatedSession ) return { success: false, message: 'Failed to Update Session' };

        // Log action
        logActionManually({
            userId, auditInfo,
            action: 'UPDATE',
            entity: 'FootballTOTSSession',
            entityId: session._id,
            details: {
                message: 'Players Removed from Session',
                affectedFields: [ `elegiblePlayers.${playersInSession[0].position}` ]
            },
            previousValues: session.toObject(),
            newValues: updatedSession.toObject()
        });

        // Return success
        return { success: true, message: 'Players Removed from Session', data: updatedSession };
    }

    // If no players found in session
    return { success: false, message: 'No Players Found in Session' };
}

exports.toggleVote = async ({ sessionId }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId );
    if( !session ) return { success: false, message: 'Invalid Session' };

    const udatedSession = await db.FootballTOTSSession.findByIdAndUpdate(
        sessionId,
        { isActive: !session.isActive },
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballTOTSSession',
        entityId: session._id,
        details: {
            message: 'Session Updated',
            affectedFields: [ 'isActive' ]
        },
        previousValues: session.toObject(),
        newValues: udatedSession.toObject()
    });

    // Return success
    return { success: true, message: 'Session Status Updated', data: updatedSession };
}

exports.submitAdminVote = async ({ sessionId }, { selectedFormation, selectedPlayers }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId );
    if( !session ) return { success: false, message: 'Invalid Session' };

    // Check if admin vote exists
    const adminVote = await db.FootballVotes.findOne({ user: userId, session: sessionId });
    if( adminVote ) return { success: false, message: 'Admin Vote Already Exists' };

    if( !selectedPlayers.GK || !selectedPlayers.DEF || !selectedPlayers.MID || !selectedPlayers.FWD ) return { success: false, message: 'Invalid Players' };
    if( selectedPlayers.GK.length !== 1 ) return { success: false, message: 'Invalid Goalkeeper' };
    if( selectedPlayers.DEF.length < 3 || selectedPlayers.DEF.length > 5 ) return { success: false, message: 'Invalid Defenders' };
    if( selectedPlayers.MID.length < 2 || selectedPlayers.MID.length > 5 ) return { success: false, message: 'Invalid Midfielders' };
    if( selectedPlayers.FWD.length < 1 || selectedPlayers.FWD.length > 3 ) return { success: false, message: 'Invalid Forwards' };
    if( selectedPlayers.DEF.length + selectedPlayers.MID.length + selectedPlayers.FWD.length !== 10 ) return { success: false, message: 'Invalid Players' };
    if( !session.selectedFormation ) return { success: false, message: 'Invalid Formation' };
    if( selectedFormation !== session.selectedFormation ) return { success: false, message: 'Invalid Formation' };

    // Check if selected players are in session elegible players
    const elegiblePlayers = session.elegiblePlayers;
    const selectedPlayersArray = [ selectedPlayers.GK, ...selectedPlayers.DEF, ...selectedPlayers.MID, ...selectedPlayers.FWD ];
    const elegiblePlayersArray = [ elegiblePlayers.GK, ...elegiblePlayers.DEF, ...elegiblePlayers.MID, ...elegiblePlayers.FWD ];
    const elegiblePlayersIds = elegiblePlayersArray.map( player => player.toString() );
    const selectedPlayersIds = selectedPlayersArray.map( player => player.toString() );
    const invalidPlayers = selectedPlayersIds.filter( player => !elegiblePlayersIds.includes( player ) );
    if( invalidPlayers.length > 0 ) return { success: false, message: 'Invalid Players' };

    if( selectedPlayersIds.length !== new Set( selectedPlayersIds ).size ) return { success: false, message: 'Duplicate Players' };

    // Create admin vote
    const createdAdminVote = await db.FootballVotes.create({
        user: userId,
        session: sessionId,
        selectedFormation,
        selectedPlayers,
        weight: session.adminVoteWeight
    });
    if( !createdAdminVote ) return { success: false, message: 'Failed to Create Admin Vote' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballVotes',
        entityId: createdAdminVote._id,
        details: {
            message: 'Admin Vote Created',
            affectedFields: [ 'selectedFormation', 'selectedPlayers' ]
        },
        previousValues: null,
        newValues: createdAdminVote.toObject()
    });

    // Return success
    return { success: true, message: 'Admin Vote Created', data: createdAdminVote };
}

exports.submitUserVote = async ({ sessionId }, { selectedFormation, selectedPlayers }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById( sessionId );
    if( !session ) return { success: false, message: 'Invalid Session' };

    // Check if user vote exists
    const userVote = await db.FootballVotes.findOne({ user: userId, session: sessionId });
    if( userVote ) return { success: false, message: 'User Vote Already Exists' };

    if( !selectedPlayers.GK || !selectedPlayers.DEF || !selectedPlayers.MID || !selectedPlayers.FWD ) return { success: false, message: 'Invalid Players' };
    if( selectedPlayers.GK.length !== 1 ) return { success: false, message: 'Invalid Goalkeeper' };
    if( selectedPlayers.DEF.length < 3 || selectedPlayers.DEF.length > 5 ) return { success: false, message: 'Invalid Defenders' };
    if( selectedPlayers.MID.length < 2 || selectedPlayers.MID.length > 5 ) return { success: false, message: 'Invalid Midfielders' };
    if( selectedPlayers.FWD.length < 1 || selectedPlayers.FWD.length > 3 ) return { success: false, message: 'Invalid Forwards' };
    if( selectedPlayers.DEF.length + selectedPlayers.MID.length + selectedPlayers.FWD.length !== 10 ) return { success: false, message: 'Invalid Players' };

    if( !session.selectedFormation ) return { success: false, message: 'Invalid Formation' };
    if( selectedFormation !== session.selectedFormation ) return { success: false, message: 'Invalid Formation' };

    // Check if selected players are in session elegible players
    const elegiblePlayers = session.elegiblePlayers;
    const selectedPlayersArray = [ selectedPlayers.GK, ...selectedPlayers.DEF, ...selectedPlayers.MID, ...selectedPlayers.FWD ];
    const elegiblePlayersArray = [ elegiblePlayers.GK, ...elegiblePlayers.DEF, ...elegiblePlayers.MID, ...elegiblePlayers.FWD ];
    const elegiblePlayersIds = elegiblePlayersArray.map( player => player.toString() );
    const selectedPlayersIds = selectedPlayersArray.map( player => player.toString() );
    const invalidPlayers = selectedPlayersIds.filter( player => !elegiblePlayersIds.includes( player ) );
    if( invalidPlayers.length > 0 ) return { success: false, message: 'Invalid Players' };

    if( selectedPlayersIds.length !== new Set( selectedPlayersIds ).size ) return { success: false, message: 'Duplicate Players' };

    // Create user vote
    const createdUserVote = await db.FootballVotes.create({
        user: userId,
        session: sessionId,
        selectedFormation,
        selectedPlayers
    });
    if( !createdUserVote ) return { success: false, message: 'Failed to Create User Vote' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballVotes',
        entityId: createdUserVote._id,
        details: {
            message: 'User Vote Created',
            affectedFields: [ 'selectedFormation', 'selectedPlayers' ]
        },
        previousValues: null,
        newValues: createdUserVote.toObject()
    });

    // Return success
    return { success: true, message: 'User Vote Created', data: createdUserVote };
}

exports.calculateFinalResult = async ({ sessionId }, { userId, auditInfo }) => {
    // Check if session exists
    const session = await db.FootballTOTSSession.findById(sessionId);
    if (!session) return { success: false, message: 'Invalid Session' };

    // Check if result exists
    const foundResult = await db.FootballTOTSResult.findOne({ session: sessionId });
    if (foundResult) return { success: false, message: 'Result Already Exists' };

    // Check if votes exist
    const votes = await db.FootballVotes.find({ session: sessionId });
    if (votes.length === 0) return { success: false, message: 'No Votes' };
    if (votes.length < 10) return { success: false, message: 'Not Enough Votes' };

    // Calculate votes per player
    const votesPerPlayer = {
        GK: {},
        DEF: {},
        MID: {},
        FWD: {}
    };
    votes.forEach(vote => {
        const { selectedPlayers, weight } = vote;
        Object.keys(selectedPlayers).forEach(position => {
            selectedPlayers[position].forEach(player => {
                if (!votesPerPlayer[position][player]) {
                    votesPerPlayer[position][player] = weight;
                } else {
                    votesPerPlayer[position][player] += weight;
                }
            });
        });
    });

    // Calculate winning formation
    const formations = votes.map(vote => vote.selectedFormation);
    const winningFormation = formations.reduce((a, b) =>
        (formations.filter(v => v === a).length >= formations.filter(v => v === b).length) ? a : b
    );

    const winningFormationVotes = formations.filter(formation => formation === winningFormation).length;
    const totalVotes = votes.length;
    const winningFormationPercentage = (winningFormationVotes / totalVotes) * 100;

    // Calculate winning players
    const winningPlayers = {
        GK: [],
        DEF: [],
        MID: [],
        FWD: []
    };
    Object.keys(votesPerPlayer).forEach(position => {
        const players = Object.keys(votesPerPlayer[position]);
        players.sort((a, b) => votesPerPlayer[position][b] - votesPerPlayer[position][a]);
        winningPlayers[position] = players.slice(0, 5);
    });

    // Calculate winning players votes
    const winningPlayersVotes = {
        GK: 0,
        DEF: 0,
        MID: 0,
        FWD: 0
    };
    Object.keys(winningPlayers).forEach(position => {
        winningPlayers[position].forEach(player => {
            winningPlayersVotes[position] += votesPerPlayer[position][player];
        });
    });

    // Calculate winning players percentage
    const winningPlayersPercentage = {
        GK: (winningPlayersVotes.GK / totalVotes) * 100,
        DEF: (winningPlayersVotes.DEF / totalVotes) * 100,
        MID: (winningPlayersVotes.MID / totalVotes) * 100,
        FWD: (winningPlayersVotes.FWD / totalVotes) * 100
    };

    // Calculate admin choice
    const adminVote = await db.FootballVotes.findOne({ user: session.adminVote, session: sessionId });
    if (!adminVote) return { success: false, message: 'No Admin Vote' };
    const adminChoice = adminVote.selectedPlayers;
    const adminChoiceVotes = {
        GK: 0,
        DEF: 0,
        MID: 0,
        FWD: 0
    };
    Object.keys(adminChoice).forEach(position => {
        adminChoice[position].forEach(player => {
            if (votesPerPlayer[position][player]) {
                adminChoiceVotes[position] += votesPerPlayer[position][player];
            }
        });
    });

    // Calculate admin choice percentage
    const adminChoicePercentage = {
        GK: (adminChoiceVotes.GK / totalVotes) * 100,
        DEF: (adminChoiceVotes.DEF / totalVotes) * 100,
        MID: (adminChoiceVotes.MID / totalVotes) * 100,
        FWD: (adminChoiceVotes.FWD / totalVotes) * 100
    };

    // Calculate final winners (selecting the top player from each position)
    const finalWinners = {
        GK: winningPlayers.GK[0],
        DEF: winningPlayers.DEF[0],
        MID: winningPlayers.MID[0],
        FWD: winningPlayers.FWD[0]
    };

    // Prepare compatibility data for the original schema structure
    const votersChoice = {
        formation: winningFormation,
        GK: winningPlayers.GK[0],
        DEF: winningPlayers.DEF.slice(0, getDefendersCount(winningFormation)),
        MID: winningPlayers.MID.slice(0, getMidfieldersCount(winningFormation)),
        FWD: winningPlayers.FWD.slice(0, getForwardsCount(winningFormation))
    };

    const adminChoice_legacy = {
        formation: adminVote.selectedFormation,
        GK: adminChoice.GK[0],
        DEF: adminChoice.DEF,
        MID: adminChoice.MID,
        FWD: adminChoice.FWD
    };

    const finalWinner = {
        formation: winningFormation,
        GK: finalWinners.GK,
        DEF: [finalWinners.DEF],
        MID: [finalWinners.MID],
        FWD: [finalWinners.FWD]
    };

    // Create result with both new and legacy fields
    const createdResult = await db.FootballTOTSResult.create({
        session: sessionId,
        
        // New detailed fields
        winningFormation,
        winningFormationPercentage,
        winningPlayers,
        winningPlayersVotes,
        winningPlayersPercentage,
        adminChoice,
        adminChoiceVotes,
        adminChoicePercentage,
        finalWinners,
        
        // Legacy compatibility fields
        votersChoice,
        adminChoice_legacy,
        finalWinner
    });

    if (!createdResult) return { success: false, message: 'Failed to Create Result' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballTOTSResult',
        entityId: createdResult._id,
        details: {
            message: 'Result Created',
            affectedFields: ['winningFormation', 'winningPlayers', 'adminChoice', 'finalWinners']
        },
        previousValues: null,
        newValues: createdResult.toObject()
    });

    // Return success
    return { success: true, message: 'Result Created', data: createdResult };
};

// Helper functions to determine the number of players based on formation
function getDefendersCount(formation) {
    return parseInt(formation.split('-')[0], 10);
}

function getMidfieldersCount(formation) {
    return parseInt(formation.split('-')[1], 10);
}

function getForwardsCount(formation) {
    return parseInt(formation.split('-')[2], 10);
}

module.exports = exports;