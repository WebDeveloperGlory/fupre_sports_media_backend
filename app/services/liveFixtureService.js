const db = require('../config/db');

exports.initializeLiveFixture = async ({ fixtureId }) => {
    // Ensure fixture exists
    const fixture = await db.Fixture.findById( fixtureId )
        .populate('homeTeam awayTeam');
    if ( !fixture ) return { success: false, message: 'Fixture not found' };

    // Check if live fixture already exists
    const existingLiveFixture = await db.LiveFixture.findOne({ fixtureId });
    if ( existingLiveFixture ) return { success: false, message: 'Live fixture already exists' };

    // Create new live fixture
    const liveFixture = new db.LiveFixture({
        fixtureId,
        homeTeam: fixture.homeTeam._id,
        awayTeam: fixture.awayTeam._id,
        type: fixture.type,
        competition: fixture.competition,
        round: fixture.round,
        referee: fixture.referee,
        date: fixture.date,
        stadium: fixture.stadium,
        status: 'live',
        result: {
            homeScore: 0,
            awayScore: 0,
            homePenalty: null,
            awayPenalty: null
        },
        statistics: {
            home: {},
            away: {}
        },
        homeLineup: {
            formation: null,
            startingXI: [],
            subs: []
        },
        awayLineup: {
            formation: null,
            startingXI: [],
            subs: []
        },
        time: 0,
        matchEvents: [],
    });

    // Update fixture status
    fixture.status = 'live';

    // Save live fixture and update fixture status
    await liveFixture.save();
    await fixture.save();

    // Return success message
    return { success: true, message: 'Live fixture initialized', data: liveFixture };
}

exports.updateLiveFixture = async ({ fixtureId }, { result, statistics, matchEvents, homeLineup, awayLineup }) => {
    // Check if live fixture already exists
    let existingLiveFixture = await db.LiveFixture.findOne({ fixtureId });
    if ( !existingLiveFixture ) return { success: false, message: 'Live fixture not found' };

    // Update only fields that are provided
    if ( result ) liveFixture.result = result;
    if ( statistics ) liveFixture.statistics = statistics;
    if ( matchEvents ) liveFixture.matchEvents = matchEvents;
    if ( homeLineup ) liveFixture.homeLineup = homeLineup;
    if ( awayLineup ) liveFixture.awayLineup = awayLineup;

    await existingLiveFixture.save();

    // Return success message
    return { success: true, message: 'Live fixture updated', data: existingLiveFixture };
}

exports.getLiveFixture = async ({ fixtureId }) => {
    // Ensure live fixture exists
    const liveFixture = await db.LiveFixture.findOne({ fixtureId })
        .populate([
            {
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level coach assistantCoach captain players',
                populate: {
                    path: 'players captain',
                    select: 'name position'
                }
            },
            {
                path: 'competition',
                select: 'name'
            },
            {
                path: 'matchEvents.player',
                select: 'name position'
            },
            {
                path: 'matchEvents.team',
                select: 'name shorthand'
            },
            {
                path: 'homeLineup.startingXI awayLineup.startingXI homeLineup.subs awayLineup.subs',
                select: 'name position'
            }
        ]);
        // .populate('homeTeam awayTeam competition matchEvents.player matchEvents.team');
    if ( !liveFixture ) return { success: false, message: 'Live fixture not found' };

    // Return live fixture
    return { success: true, message: 'Live Fixture Acquired', data: liveFixture };
}

exports.getAllAdminTodayFixtures = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );
    const competitions = foundUser.associatedCompetitions;
    const teamId = foundUser.associatedTeam;
    let fixtures = [];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    if( foundUser.role === 'super-admin' ) {
        fixtures = await db.Fixture.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        })
            .sort({ date: 1 })
            .populate([
                {
                    path: 'homeTeam awayTeam competition',
                    select: 'name'
                },
            ]);
    } else if( foundUser.role === 'competition-admin' ) {
        fixtures = await db.Fixture.find({
            competition: { $in: competitions },
            date: { $gte: startOfDay, $lte: endOfDay }
        })
            .sort({ date: 1 })
            .populate([
                {
                    path: 'homeTeam awayTeam competition',
                    select: 'name'
                },
            ]);
    } else if( foundUser.role === 'team-admin' ) {
        if( teamId ) {
            fixtures = await db.Fixture.find({
                $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
                date: { $gte: startOfDay, $lte: endOfDay }
            })
                .sort({ date: 1 })
                .populate([
                    {
                        path: 'homeTeam awayTeam competition',
                        select: 'name'
                    },
                ]);
        }
    }

    // Return Success
    return { success: true, message: 'Today Fixtures Acquired', data: fixtures }
}

module.exports = exports;