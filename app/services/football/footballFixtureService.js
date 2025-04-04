const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { processStatUpdate, updatePlayerGeneralRecord, processAppearanceUpdate, updatePlayerStats, getGoalkeepers } = require('../../utils/football/footballPlayerStatUtils');


exports.getAllFixtures = async ({ limit, page, filterBy, completed, live, upcoming, postponed, startDate }) => {
    // Set pagination defaults
    const setLimit = parseInt( limit ) || 10;
    const currentPage = parseInt( page ) || 1;
    const skip = ( currentPage - 1 ) * setLimit;
    
    // Check if filter is passed
    let filter = {};
    let sort = {
        date: completed ? -1 : 1
    };
    
    // Handle date filtering
    if ( filterBy ) {
        const parseDate = new Date( filterBy );

        if ( parseDate instanceof Date && !isNaN( parseDate ) ) {
            filter.date = {
                $gte: new Date(parseDate.setHours(0, 0, 0, 0)),
                $lt: new Date(parseDate.setHours(23, 59, 59, 999)),
            };
        } else {
            return { success: false, message: 'Invalid Date Format' };
        }
    } else if ( startDate ) {
        const parseDate = new Date( startDate );

        if ( parseDate instanceof Date && !isNaN( parseDate ) ) {
            filter.date = {
                $gte: new Date( parseDate ),
            };
        } else {
            return { success: false, message: 'Invalid Date Format' };
        }
    }
    
    // Handle status filtering
    if ( completed ) {
        filter.status = "completed";
    } else if ( live ) {
        filter.status = "live";
    } else if ( upcoming ) {
        filter.status = "upcoming";
    } else if ( postponed ) {
        filter.status = "postponed";
    }

    // Get total count for pagination
    const totalFixtures = await db.FootballFixture.countDocuments(filter);
    
    // Get fixtures with pagination
    const fixtures = await db.FootballFixture.find(filter)
        .populate([
            {
                path: 'homeTeam',
                select: 'name'
            },
            {
                path: 'awayTeam',
                select: 'name'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort( sort )
        .skip( skip )
        .limit( setLimit )
        .lean();
     
    // Calculate pagination metadata
    const totalPages = Math.ceil( totalFixtures / setLimit );
    
    // Return success with pagination metadata
    return { 
        success: true, 
        message: 'Fixtures Acquired', 
        data: {
            fixtures,
            pagination: {
                total: totalFixtures,
                page: currentPage,
                limit: setLimit,
                pages: totalPages,
            }
        },
    };
}

exports.getOneFixture = async ({ fixtureId }) => {
    // Check if fixture exists
    const fixture = await db.FootballFixture.findById( fixtureId )
        .populate([
            {
                path: 'homeTeam',
                select: 'name department level shorthand'
            },
            {
                path: 'awayTeam',
                select: 'name department level shorthand'
            },
            {
                path: 'statistics'
            },
            {
                path: 'goalScorers.id',
                select: 'name team',
                // If you need to populate nested fields in goalScorers.id
                // populate: { path: 'team', select: 'name shorthand' }
            },
            {
                path: 'competition',
                select: 'name type'
            },
            {
                path: 'matchEvents',
                // Using populate option for nested fields
                populate: [
                    {
                        path: 'player',
                        select: 'name position'
                    },
                    {
                        path: 'substitutedFor',
                        select: 'name position'
                    },
                    {
                        path: 'team',
                        select: 'name shorthand'
                    }
                ]
            },
            {
                path: 'homeLineup',
                // Populating nested arrays
                populate: [
                    {
                        path: 'startingXI',
                        select: 'name position number'
                    },
                    {
                        path: 'subs',
                        select: 'name position number'
                    }
                ]
            },
            {
                path: 'awayLineup',
                populate: [
                    {
                        path: 'startingXI',
                        select: 'name position number'
                    },
                    {
                        path: 'subs',
                        select: 'name position number'
                    }
                ]
            }
        ]);
    if( !fixture ) return { success: false, message: 'Invalid Fixture' };

    // Return success
    return { success: true, message: 'Fixture Acquired', data: fixture };
}

exports.getTeamFixtures = async ({ teamId }) => {
    // Get fixtures for team
    const fixtures = await db.FootballFixture.find({ 
        $or: [
            { homeTeam: teamId },
            { awayTeam: teamId }
        ]
    })
        .populate([
            {
                path: 'homeTeam',
                select: 'name department level shorthand'
            },
            {
                path: 'awayTeam',
                select: 'name department level shorthand'
            },
            {
                path: 'statistics'
            },
            {
                path: 'goalScorers.id',
                select: 'name team',
                // If you need to populate nested fields in goalScorers.id
                // populate: { path: 'team', select: 'name shorthand' }
            },
            {
                path: 'competition',
                select: 'name type'
            },
            {
                path: 'matchEvents',
                // Using populate option for nested fields
                populate: [
                    {
                        path: 'player',
                        select: 'name position'
                    },
                    {
                        path: 'substitutedFor',
                        select: 'name position'
                    },
                    {
                        path: 'team',
                        select: 'name shorthand'
                    }
                ]
            },
            {
                path: 'homeLineup',
                // Populating nested arrays
                populate: [
                    {
                        path: 'startingXI',
                        select: 'name position number'
                    },
                    {
                        path: 'subs',
                        select: 'name position number'
                    }
                ]
            },
            {
                path: 'awayLineup',
                populate: [
                    {
                        path: 'startingXI',
                        select: 'name position number'
                    },
                    {
                        path: 'subs',
                        select: 'name position number'
                    }
                ]
            }
        ])
        .sort({ date: -1 })
        .lean();

    return { success: true, message: 'Team Fixtures Acquired', data: fixtures };
}

exports.createFriendlyFixture = async ({ 
    homeTeam, 
    awayTeam, 
    date, 
    stadium,
    isDateTBD = false,
}, { userId, auditInfo }) => {
    // Validate teams aren't the same
    if (homeTeam.toString() === awayTeam.toString()) {
        return { 
            success: false, 
            message: 'Home and away teams cannot be the same',
            code: 400
        };
    }
  
    // Validate date logic
    if ( isDateTBD && date ) {
        return {
            success: false,
            message: 'Cannot specify both date and isDateTBD',
            code: 400
        };
    }
  
    // Create fixture
    const createdFixture = await db.FootballFixture.create({ 
        homeTeam, 
        awayTeam,
        type: 'friendly',
        date: isDateTBD ? null : date,
        stadium,
        isDateTBD,
        status: isDateTBD ? 'tbd' : 'upcoming'
    });
  
    // Log action
    logActionManually({
        userId, 
        auditInfo,
        action: 'CREATE',
        entity: 'FootballFixture',
        entityId: createdFixture._id,
        details: {
            message: `Friendly fixture created ${isDateTBD ? '(TBD)' : ''}`
        }
    });
  
    return { 
        success: true, 
        message: 'Friendly fixture created',
        data: createdFixture 
    };
}

exports.updateFixtureStatus = async (
    { fixtureId }, 
    { status, postponementReason, newDate }, 
    { userId, auditInfo }
) => {
    // Get initial fixture
    const initialFixture = await db.FootballFixture.findById(fixtureId);
    if (!initialFixture) {
        return { 
            success: false, 
            message: 'Fixture not found', 
            code: 404 
        };
    }
  
    // Prepare update
    const update = { status };
    const changedFields = ['status'];
  
    // Handle postponement specifics
    if ( status === 'postponed' ) {
        if (!postponementReason) {
            return {
                success: false,
                message: 'Postponement reason required',
                code: 400
            };
        }
  
        update.isPostponed = true;
        update.postponementInfo = {
            reason: postponementReason,
            originalDate: initialFixture.date,
            ...(newDate && { newDate })
        };
        changedFields.push('isPostponed', 'postponementInfo');
    } else if (initialFixture.status === 'postponed' && status !== 'postponed') {
        // Clearing postponement status
        update.isPostponed = false;
        changedFields.push('isPostponed');
    }
  
    // Handle TBD status changes
    if (status === 'tbd') {
        update.isDateTBD = true;
        update.date = null;
        changedFields.push('isDateTBD', 'date');
    } else if (initialFixture.status === 'tbd' && status !== 'tbd') {
        update.isDateTBD = false;
        changedFields.push('isDateTBD');
    }
  
    // Update fixture
    const updatedFixture = await db.FootballFixture.findByIdAndUpdate(
        fixtureId,
        update,
        { new: true }
    );
  
    // Log action
    logActionManually({
        userId,
        auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: updatedFixture._id,
        details: {
            message: `Fixture status updated to ${status}`,
            affectedFields: changedFields
        },
        previousValues: initialFixture.toObject(),
        newValues: updatedFixture.toObject()
    });
  
    return { 
        success: true, 
        message: 'Fixture status updated',
        data: updatedFixture 
    };
}
  
exports.updateFixtureFormation = async (
    { fixtureId }, 
    { homeLineup, awayLineup }, 
    { userId, auditInfo }
) => {
    // Validate fixture exists
    const initialFixture = await db.FootballFixture.findById(fixtureId);
    if (!initialFixture) {
        return { 
            success: false, 
            message: 'Fixture not found', 
            code: 404 
        };
    }
  
    // Validate lineup structures if provided
    if (homeLineup) {
        if (homeLineup.startingXI && homeLineup.startingXI.length !== 11) {
            return {
                success: false,
                message: 'Starting XI must have exactly 11 players',
                code: 400
            };
        }
      if (homeLineup.subs && homeLineup.subs.length > 9) {
        return {
            success: false,
            message: 'Maximum 9 substitutes allowed',
            code: 400
        };
      }
    }
  
    if (awayLineup) {
        if (awayLineup.startingXI && awayLineup.startingXI.length !== 11) {
            return {
                success: false,
                message: 'Starting XI must have exactly 11 players',
                code: 400
            };
        }
        if (awayLineup.subs && awayLineup.subs.length > 9) {
            return {
                success: false,
                message: 'Maximum 9 substitutes allowed',
                code: 400
            };
        }
    }
  
    // Prepare update
    const update = {};
    const changedFields = [];
  
    if (homeLineup) {
        update.homeLineup = homeLineup;
        changedFields.push('homeLineup');
    }
    if (awayLineup) {
        update.awayLineup = awayLineup;
        changedFields.push('awayLineup');
    }
  
    // Update fixture
    const updatedFixture = await db.FootballFixture.findByIdAndUpdate(
        fixtureId,
        update,
        { new: true }
    );
  
    // Log action
    logActionManually({
        userId,
        auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: updatedFixture._id,
        details: {
            message: 'Fixture lineup updated',
            affectedFields: changedFields
        },
        previousValues: initialFixture.toObject(),
        newValues: updatedFixture.toObject()
    });
  
    return { 
        success: true, 
        message: 'Fixture lineup updated',
        data: updatedFixture 
    };
}

exports.deleteFriendlyFixture = async ({ fixtureId }, { userId, auditInfo }) => {
    // Deleted fixture
    const deletedFixture = await db.FootballFixture.findByIdAndDelete( fixtureId );
    if( !deletedFixture ) return { success: false, message: 'Invalid Fixture' };

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'DELETE',
        entity: 'FootballFixture',
        entityId: userId,
        details: {
            message: `Fixture Deleted`
        },
        previousValues: deletedFixture.toObject(),
        newValues: null
    });

    // Return success
    return { success: true, message: 'Fixture Deleted', data: deletedFixture };
}

exports.updateFixtureResult = async (
    { fixtureId }, 
    { result, statistics, matchEvents, homeSubs, awaySubs }, 
    { userId, auditInfo }
) => {
    // Validate fixture exists
    const fixture = await db.FootballFixture.findById(fixtureId)
        .populate('homeTeam awayTeam competition');
      
    if (!fixture) {
        return { 
            success: false, 
            message: 'Fixture not found', 
            code: 404 
        };
    }
  
    // Validate fixture isn't already completed
    if (fixture.status === 'completed') {
        return {
            success: false,
            message: 'Cannot update completed fixture',
            code: 400
        };
    }

    function getCurrentSeason() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        return `${currentYear}/${currentYear + 1}`;
    }
  
    const initialFixture = fixture.toObject();
    const changes = [];
    const currentSeason = getCurrentSeason(); // Implement this helper based on your logic
  
    // 1. Update Statistics
    if ( statistics ) {
        if ( !fixture.statistics ) {
            const createdStats = await db.FootballMatchStatistic.create({
                fixture: fixtureId,
                ...statistics
            });
            fixture.statistics = createdStats._id;
            changes.push('statistics');
        } else {
            await db.FootballMatchStatistic.findByIdAndUpdate(
                fixture.statistics,
                statistics
            );
            changes.push('statistics');
        }
    }
  
    // 2. Update Subs
    if ( homeSubs ) {
        fixture.homeLineup.subs = homeSubs;
        changes.push('homeLineup.subs');
    }
    if ( awaySubs ) {
        fixture.awayLineup.subs = awaySubs;
        changes.push('awayLineup.subs');
    }
  
    // 3. Process Match Events
    if (matchEvents?.length > 0) {
        fixture.matchEvents = matchEvents;
        changes.push('matchEvents');
    
        // Categorize events
        const eventTypes = {
            goals: matchEvents.filter(e => e.eventType === 'goal'),
            ownGoals: matchEvents.filter(e => e.eventType === 'ownGoal'),
            assists: matchEvents.filter(e => e.eventType === 'assist'),
            yellowCards: matchEvents.filter(e => e.eventType === 'yellowCard'),
            redCards: matchEvents.filter(e => e.eventType === 'redCard')
        };
  
        // Process each event type
        await Promise.all([
            ...eventTypes.goals.map(event => 
                updatePlayerStats({
                    playerId: event.player,
                    teamId: event.team,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { goals: 1 }
                })
            ),
            ...eventTypes.ownGoals.map(event =>
                updatePlayerStats({
                    playerId: event.player,
                    teamId: event.team,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { ownGoals: 1 }
                })
            ),
            ...eventTypes.assists.map(event =>
                updatePlayerStats({
                    playerId: event.player,
                    teamId: event.team,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { assists: 1 }
                })
            ),
            ...eventTypes.yellowCards.map(event =>
                updatePlayerStats({
                    playerId: event.player,
                    teamId: event.team,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { yellowCards: 1 }
                })
            ),
            ...eventTypes.redCards.map(event =>
                updatePlayerStats({
                    playerId: event.player,
                    teamId: event.team,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { redCards: 1 }
                })
            )
        ]);
  
        // Update goal scorers
        fixture.goalScorers = eventTypes.goals.map(goal => ({
            id: goal.player,
            team: goal.team,
            time: goal.time
        }));
        changes.push('goalScorers');
    }
  
    // 4. Update Appearances
    const allPlayers = [
        ...(fixture.homeLineup.startingXI || []),
        ...(fixture.homeLineup.subs || []),
        ...(fixture.awayLineup.startingXI || []),
        ...(fixture.awayLineup.subs || [])
    ];
  
    await Promise.all(
        allPlayers.map(playerId =>
            updatePlayerStats({
                playerId,
                teamId: fixture.homeLineup.startingXI.includes(playerId) ? 
                    fixture.homeTeam._id : fixture.awayTeam._id,
                competitionId: fixture.competition?._id,
                season: currentSeason,
                matchType: fixture.type,
                updates: { appearances: 1 }
            })
        )
    );
  
    // 5. Update Clean Sheets (for goalkeepers)
    if (result?.homeScore !== undefined && result?.awayScore !== undefined) {
        fixture.result = result;
        changes.push('result');
    
        const homeGKs = await getGoalkeepers(fixture.homeLineup);
        const awayGKs = await getGoalkeepers(fixture.awayLineup);
    
        await Promise.all([
            ...homeGKs.map(playerId =>
                updatePlayerStats({
                    playerId,
                    teamId: fixture.homeTeam._id,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { 
                        cleanSheets: result.awayScore === 0 ? 1 : 0 
                    }
                })
            ),
            ...awayGKs.map(playerId =>
                updatePlayerStats({
                    playerId,
                    teamId: fixture.awayTeam._id,
                    competitionId: fixture.competition?._id,
                    season: currentSeason,
                    matchType: fixture.type,
                    updates: { 
                        cleanSheets: result.homeScore === 0 ? 1 : 0 
                    }
                })
            )
        ]);
    }
  
    // 6. Finalize fixture
    fixture.status = 'completed';
    changes.push('status');
    await fixture.save();
  
    // Audit logging
    logActionManually({
        userId,
        auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: fixture._id,
        details: {
            message: 'Fixture result updated',
            affectedFields: changes
        },
        previousValues: initialFixture,
        newValues: fixture.toObject()
    });
  
    return { 
        success: true, 
        message: 'Fixture result updated',
        data: fixture 
    };
};

module.exports = exports;