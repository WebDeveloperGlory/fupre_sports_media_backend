const db = require('../../config/db');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { processStatUpdate, updatePlayerGeneralRecord, processAppearanceUpdate } = require('../../utils/football/footballPlayerStatUtils');


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

exports.createFriendlyFixture = async ({ homeTeam, awayTeam, date, stadium }, { userId, auditInfo }) => {
    // Create fixture
    const createdFixture = await db.FootballFixture.create({ 
        homeTeam, awayTeam, 
        type: 'friendly',
        date, stadium
    });

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'FootballFixture',
        entityId: createdFixture._id,
        details: {
            message: `Fixture Created`
        }
    });

    // Return success
    return { success: true, message: 'Fixture Created', data: createdFixture };
}

exports.updateFixtureStatus = async ({ fixtureId }, { status }, { userId, auditInfo }) => {
    // Get initial fixture
    const initialFixture = await db.FootballFixture.findById( fixtureId );
    if( !initialFixture ) return { success: false, message: 'Invalid Fixture' };

    // Update fixture status
    const updatedFixture = await db.FootballFixture.findByIdAndUpdate(
        fixtureId,
        { status },
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: updatedFixture._id,
        details: {
            message: 'Fixture Updated',
            affectedFields: ['status']
        },
        previousValues: initialFixture.toObject(),
        newValues: updatedFixture.toObject()
    });

    // Return success
    return { success: true, message: 'Fixture Status Updated', data: updatedFixture };
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

exports.updateFixtureResult = async ({ fixtureId }, { result, statistics, matchEvents, homeSubs, awaySubs }, { userId, auditInfo }) => {
    // Check if fixture exists
    const foundFixture = await db.FootballFixture.findById( fixtureId );
    if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };

    // Initialize initial fixture
    const initialFixture = await db.FootballFixture.findById( fixtureId );

    // Check if user passed in statistics
    if( statistics ) {
        // Check if statistics does not exist and create
        const { home, away } = statistics;
        if( !foundFixture.statistics ) {
            const createdStatistics = await db.FootballMatchStatistic.create({ 
                fixture: foundFixture._id, 
                home, away 
            });
            foundFixture.statistics = createdStatistics._id;
        } else {
            const foundStatistics = await db.FootballMatchStatistic.findByIdAndUpdate( 
                foundFixture.statistics, 
                { home, away }
            );
        }
    }

    // Check if homeSubs
    if( homeSubs ) {
        foundFixture.homeLineup = {
            ...foundFixture.homeLineup,
            subs: homeSubs
        }
    }
    if( awaySubs ) {
        foundFixture.awayLineup = {
            ...foundFixture.awayLineup,
            subs: awaySubs
        }
    }

    // Save changes
    await foundFixture.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: foundFixture._id,
        details: {
            message: 'Fixture Updated',
            affectedFields: [
                homeSubs !== undefined ? "homeLineup.subs" : null,
                awaySubs !== undefined ? "awayLineup.subs" : null,
                statistics !== undefined ? "statistics" : null,
            ].filter(Boolean), // Remove null values
        },
        previousValues: initialFixture.toObject(),
        newValues: foundFixture.toObject()
    });

    // Update player appearances
    const alsoFixture = await db.FootballFixture.findById( fixtureId );
    if( alsoFixture.homeLineup.startingXI && alsoFixture.homeLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.homeLineup.startingXI, ...alsoFixture.homeLineup.subs ]
        await processAppearanceUpdate( playersArr )
    }
    if( alsoFixture.awayLineup.startingXI && alsoFixture.awayLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.awayLineup.startingXI, ...alsoFixture.awayLineup.subs ]
        await processAppearanceUpdate( playersArr )
    }

    // Update player stats if available
    if( matchEvents && matchEvents.length > 0 ) {
        // Save matchEvents
        foundFixture.matchEvents = matchEvents;

        // Extract events
        const goals = matchEvents.filter( event => event.eventType === "goal" );
        const ownGoals = matchEvents.filter( event => event.eventType === "ownGoal" );
        const assists = matchEvents.filter( event => event.eventType === "assist" );
        const yellowCards = matchEvents.filter( event => event.eventType === "yellowCard" );
        const redCards = matchEvents.filter( event => event.eventType === "redCard" );

        // ✅ 1️⃣ Update Goal Stats
        if ( goals.length > 0 ) {
            await processStatUpdate(
                goals.map( goal => ({ playerId: goal.player, count: 1 })), 
                "goals"
            );

            goals.forEach( goal => {
                foundFixture.goalScorers.push({
                    id: goal.player,
                    team: goal.team,
                    time: goal.time || 90
                });
            });
        }

        // ✅ 2️⃣ Update ownGoal Stats
        await processStatUpdate(
            ownGoals.map( ownGoal => ({ playerId: ownGoal.player, count: 1 })), 
            "ownGoals", 
        );
        
        // ✅ 2️⃣ Update Assist Stats
        await processStatUpdate(
            assists.map( assist => ({ playerId: assist.player, count: 1 })), 
            "assists", 
        );

        // ✅ 3️⃣ Update Yellow & Red Card Stats
        await processStatUpdate(
            yellowCards.map(card => ({ playerId: card.player, count: 1 })), 
            "yellowCards", 
        );

        await processStatUpdate(
            redCards.map(card => ({ playerId: card.player, count: 1 })), 
            "redCards",
        );

        if( foundFixture.homeLineup.startingXI && foundFixture.homeLineup.startingXI.length > 0 ) {
            // ✅ 4️⃣ Handle Clean Sheets
            const homeConceded = result.awayScore > 0;
            // Get all goalkeepers from lineup
            const homeGoalkeepers = foundFixture.homeLineup.startingXI.filter( player => player.position === 'GK' );

            await Promise.all(
                homeGoalkeepers.map( async ( player ) => {
                    const playerDoc = await db.Player.findById( player._id );
                    if ( !playerDoc ) return;
    
                    if ( !homeConceded ) {
                        await updatePlayerGeneralRecord( player._id, "cleanSheets", 1 );
                    }
                })
            );
        }
        if( foundFixture.awayLineup.startingXI && foundFixture.awayLineup.startingXI.length > 0 ) {
            // ✅ 4️⃣ Handle Clean Sheets
            const awayConceded = result.homeScore > 0;
            // Get all goalkeepers from lineup
            const awayGoalkeepers = foundFixture.awayLineup.startingXI.filter( player => player.position === 'GK' );

            await Promise.all(
                awayGoalkeepers.map( async ( player ) => {
                    const playerDoc = await db.Player.findById( player._id );
                    if ( !playerDoc ) return;

                    if ( !awayConceded ) {
                        await updatePlayerGeneralRecord( player._id, "cleanSheets", 1 );
                    }
                })
            );
        }
    }

    // Update fixture scores and status
    if( result ) foundFixture.result = result;
    foundFixture.status = 'completed';
    await foundFixture.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: foundFixture._id,
        details: {
            message: 'Fixture Updated',
            affectedFields: [
                result !== undefined ? "result" : null,
                matchEvents !== undefined ? "matchEvents" : null,
                "status",
            ].filter(Boolean), // Remove null values
        },
        previousValues: initialFixture.toObject(),
        newValues: foundFixture.toObject()
    });

    // Return success
    return { success: true, messsage: 'Fixture Result Updated', data: foundFixture };
}

exports.updateFixtureFormation = async ({ fixtureId }, { homeLineup, awayLineup }, { userId, auditInfo }) => {
    // Check if fixture exists
    const initialFixture = await db.FootballFixture.findById( fixtureId );
    if( !initialFixture ) return { success: false, message: 'Invalid Fixture' };

    // Update fixture
    const updatedFixture = await db.FootballFixture.findByIdAndUpdate( 
        fixtureId,
        {
            homeLineup,
            awayLineup
        }, 
        { new: true }
    );

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'FootballFixture',
        entityId: updatedFixture._id,
        details: {
            message: 'Fixture Updated',
            affectedFields: [
                homeLineup !== undefined ? "homeLineup" : null,
                awayLineup !== undefined ? "awayLineup" : null,
            ].filter(Boolean), // Remove null values
        },
        previousValues: initialFixture.toObject(),
        newValues: updatedFixture.toObject()
    });

    return { success: true, message: 'Fixture Lineup Updated', data: updatedFixture }
}

module.exports = exports;