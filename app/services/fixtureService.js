const db = require('../config/db');

exports.createFixture = async ({ homeTeam, awayTeam, type, date, stadium, competition }) => {
    // Create fixture
    const createdFixture = await db.Fixture.create({ homeTeam, awayTeam, type, date, stadium, competition });

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
    const fixture = await db.Fixture.findById( fixtureId );
    if( !fixture ) return { success: false, message: 'Invalid Fixture' };

    // Return success
    return { success: true, message: 'Fixture Acquired', data: fixture };
}

exports.updateFixtureResult = async ( { fixtureId }, { result, statistics } ) => {
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
    foundFixture.result = result;
    foundFixture.status = 'completed';
    await foundFixture.save();

    // Return success
    return { success: true, messsage: 'Fixture Scores Updated', data: foundFixture };
}

module.exports = exports;