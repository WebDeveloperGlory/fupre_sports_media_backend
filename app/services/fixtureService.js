const db = require('../config/db');

exports.createFriendlyFixture = async ({ homeTeam, awayTeam, type, date, stadium, competition }) => {
    // Create fixture
    const createdFixture = await db.Fixture.create({ homeTeam, awayTeam, type, date, stadium });

    // Return success
    return { success: true, message: 'Fixture Created', data: createdFixture };
}

exports.getAllFixtures = async () => {
    // Get all fixtures
    const allFixtures = await db.Fixture.find();
    
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