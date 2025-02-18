const db = require('../config/db');
const { getTeamWins } = require('../utils/fixtureUtils');
const { processStatUpdate, updatePlayerGeneralRecord, updatePlayerCompetitionStats, processAppearanceUpdate } = require('../utils/playerStatUtils');
const { getRecentPerformance } = require('../utils/teamUtils');

exports.createFixture = async ({ homeTeam, awayTeam, type, date, stadium, competition }) => {
    // Create fixture
    const createdFixture = await db.Fixture.create({ homeTeam, awayTeam, type, date, stadium, competition });
    // Add fixtures to team
    const updatedHomeTeam = await db.Team.findByIdAndUpdate( 
        homeTeam, 
        { $addToSet: 
            { fixtures: createdFixture._id } 
        }, 
        { new: true } 
    );
    const updatedAwayTeam = await db.Team.findByIdAndUpdate( 
        awayTeam, 
        { $addToSet: 
            { fixtures: createdFixture._id } 
        }, 
        { new: true } 
    ); 

    // Return success
    return { success: true, message: 'Fixture Created', data: createdFixture };
}

exports.getAllFixtures = async ({ limit, filterBy, completed, live, upcoming, startDate }) => {
    // Check for limit if not set a limit
    const setLimit = parseInt( limit ) || 10;
    // Check if filer is passed
    let filter = {};
    let sort = {
        date: completed ? -1 : 1
    }
    if( filterBy ) {
        const parseDate = new Date( filterBy );

        if ( parseDate instanceof Date && !isNaN( parseDate ) ) {
            filter.date = {
                $gte: new Date( parseDate.setHours( 0, 0, 0, 0 ) ),
                $lt: new Date( parseDate.setHours( 23, 59, 59, 999 ) ),
            }
        } else {
            return { success: false, message: 'Invalid Date Format' }
        }
    } else if( startDate ) {
        const parseDate = new Date( startDate );

        if ( parseDate instanceof Date && !isNaN( parseDate ) ) {
            filter.date = {
                $gte: new Date( parseDate ),
            }
        } else {
            return { success: false, message: 'Invalid Date Format' }
        }
    }
    if( completed ) {
        filter.status = "completed"
    } else if ( live ) {
        filter.status = "live"
    } else if ( upcoming ) {
        filter.status = "upcoming"
    }

    // Get fixtures with limit
    const allFixtures = await db.Fixture.find( filter )
        .populate([
            {
                path: 'homeTeam awayTeam',
                select: 'name'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort( sort )
        .limit( setLimit );
    
    // Return success
    return { success: true, message: 'Fixtures Acquired', data: allFixtures };
}

exports.getOneFixture = async ({ fixtureId }) => {
    // Check if fixture exists
    const fixture = await db.Fixture.findById( fixtureId )
        .populate([
            {
                path: 'homeTeam awayTeam',
                select: 'name department level shorthand'
            },
            {
                path: 'statistics'
            },
            {
                path: 'goalScorers.id',
                select: 'name team'
            },
            {
                path: 'competition',
                select: 'name type'
            },
            {
                path: 'matchEvents.player matchEvents.substitutedFor',
                select: 'name position'
            },
            {
                path: 'matchEvents.team',
                select: 'name shorthand'
            },
            {
                path: 'homeLineup.startingXI homeLineup.subs awayLineup.startingXI awayLineup.subs',
                select: 'name shorthand'
            }
        ]);
    if( !fixture ) return { success: false, message: 'Invalid Fixture' };

    // Return success
    return { success: true, message: 'Fixture Acquired', data: fixture };
}

exports.getTeamFixtureTeamFormAndMatchData = async ({ fixtureId }) => {
    const foundFixture = await db.Fixture.findById( fixtureId );
    if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };
    
    const homeTeam = await db.Team.findById( foundFixture.homeTeam );
    const awayTeam = await db.Team.findById( foundFixture.awayTeam );

    let homeTeamForm = [];
    let awayTeamForm = [];

    homeTeamForm = await getRecentPerformance( homeTeam.fixtures, homeTeam._id );
    awayTeamForm = await getRecentPerformance( awayTeam.fixtures, awayTeam._id );

    // Fetch the most recent 5 fixtures (played before or at this moment)
    const now = new Date();
    const homeLastFixtures = await db.Fixture.find({ 
        _id: { $in: homeTeam.fixtures }, 
        date: { $lte: now }, // Fixtures up to and including now
        status: 'completed'
    })
    .sort({ date: -1 }) // Sort by date in descending order (most recent first)
    .limit(5)
    .populate({
        path: 'homeTeam awayTeam',
        select: 'name shorthand'
    });
    const awayLastFixtures = await db.Fixture.find({
        _id: { $in: awayTeam.fixtures },
        date: { $lte: now },
        status: 'completed'
    })
    .sort({ date: -1 })
    .limit(5)
    .populate({
        path: 'homeTeam awayTeam',
        select: 'name shorthand'
    });
    const headToHeadFixtures = await db.Fixture.find({
        $or: [
            {
                $and: [
                    { homeTeam: homeTeam._id },
                    { awayTeam: awayTeam._id }
                ],        
            },
            {
                $and: [
                    { homeTeam: awayTeam._id },
                    { awayTeam: homeTeam._id }
                ],
            }
        ],
        date: { $lte: now },
        status: 'completed'
    })
    .sort({ date: -1 })
    .populate({
        path: 'homeTeam awayTeam competition',
        select: 'name shorthand'
    });

    const homeH2H = await getTeamWins( headToHeadFixtures, homeTeam._id );

    const homeWins = homeH2H.wins;
    const draws = homeH2H.draws;
    const awayWins = homeH2H.losses;

    // Return success
    return { success: true, message: 'Fixture Teams Form Acquired', data: { 
        homeTeam: homeTeam.name, 
        awayTeam: awayTeam.name,
        homeTeamForm, awayTeamForm, 
        homeLastFixtures, awayLastFixtures,
        head2head: {
            homeTeam: homeTeam.name,
            homeWins,
            draws,
            awayTeam: awayTeam.name,
            awayWins,
            fixtures: headToHeadFixtures.splice( 0, 5 )
        }
    } };
}

exports.updateFixtureResult = async ( { fixtureId }, { result, statistics, matchEvents } ) => {
    // Check if fixture exists
    const foundFixture = await db.Fixture.findById( fixtureId )
    .populate({
        path: 'homeLineup.startingXI homeLineup.subs awayLineup.startingXI awayLineup.subs',
        select: 'position'
    });
    if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };

    // Check if user passed in statistics
    if( statistics ) {
        // Check if statistics does not exist and create
        const { home, away } = statistics;
        if( !foundFixture.statistics ) {
            const createdStatistics = await db.MatchStatistic.create({ fixture: foundFixture._id, home, away });
            foundFixture.statistics = createdStatistics._id;
        } else {
            const foundStatistics = await db.MatchStatistic.findByIdAndUpdate( foundFixture.statistics, { home, away });
        }
    }

    // Update player appearances
    const alsoFixture = await db.Fixture.findById( fixtureId );
    if( alsoFixture.homeLineup.startingXI && alsoFixture.homeLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.homeLineup.startingXI, ...alsoFixture.homeLineup.subs ]
        await processAppearanceUpdate( playersArr )
    } else if( alsoFixture.awayLineup.startingXI && alsoFixture.awayLineup.startingXI.length > 0 ) {
        const playersArr = [ ...alsoFixture.awayLineup.startingXI, ...alsoFixture.awayLineup.subs ]
        await processAppearanceUpdate( playersArr )
    }

    // Update player stats if available
    if( matchEvents && matchEvents.length > 0 ) {
        // Extract events
        const goals = matchEvents.filter( event => event.eventType === "goal" );
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
        } else if( foundFixture.awayLineup.startingXI && foundFixture.awayLineup.startingXI.length > 0 ) {
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

    // Return success
    return { success: true, messsage: 'Fixture Scores Updated', data: foundFixture };
}

exports.updateFixtureFormation = async ({ fixtureId }, { homeLineup, awayLineup }) => {
    // Check if fixture exists
    const updatedFixture = await db.Fixture.findByIdAndUpdate( 
        fixtureId,
        {
            homeLineup,
            awayLineup
        }, 
        { new: true }
    );
    if( !updatedFixture ) return { success: false, message: 'Invalid Fixture' };

    return { success: true, message: 'Fixture Lineup Updated', data: updatedFixture }
}

exports.getTeamPlayerData = async ({ fixtureId }) => {
    // Check if fixture exists
    const foundFixture = await db.Fixture.findById( fixtureId )
        .populate({
            path: 'homeTeam awayTeam',
            select: 'name players',
            populate: {
                path: 'players',
                select: 'name position'
            }
        });
    if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };

    const { homeTeam, awayTeam } = foundFixture;

    return { success: true, message: 'Fixture Teams Player Data Acquired', data: { homeTeam, awayTeam } }
}

module.exports = exports;