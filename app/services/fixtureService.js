const db = require('../config/db');
const { getTeamWins } = require('../utils/fixtureUtils');
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

exports.getAllFixtures = async ({ limit, filterBy, completed, startDate }) => {
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
    }

    // Get fixtures with limit
    const allFixtures = await db.Fixture.find( filter )
        .populate({
            path: 'homeTeam awayTeam',
            select: 'name'
        })
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
        date: { $lte: now } // Fixtures up to and including now
    })
    .sort({ date: -1 }) // Sort by date in descending order (most recent first)
    .limit(5)
    .populate({
        path: 'homeTeam awayTeam',
        select: 'name shorthand'
    });
    const awayLastFixtures = await db.Fixture.find({
        _id: { $in: awayTeam.fixtures },
        date: { $lte: now }
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
        date: { $lte: now }
    })
    .sort({ date: -1 })
    .populate({
        path: 'homeTeam awayTeam',
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

exports.updateFixtureResult = async ( { fixtureId }, { result, statistics, goalScorers } ) => {
    // Check if fixture exists
    const foundFixture = await db.Fixture.findById( fixtureId );
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

    // Update fixture scores and status
    if( result ) foundFixture.result = result;
    if( goalScorers ) foundFixture.goalScorers = goalScorers;
    foundFixture.status = 'completed';
    await foundFixture.save();

    // Return success
    return { success: true, messsage: 'Fixture Scores Updated', data: foundFixture };
}

module.exports = exports;