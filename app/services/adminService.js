const db = require('../config/db');

exports.getCompetitionAdminFixturePageData = async({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );
    const competitions = foundUser.associatedCompetitions;
    let teams = {
        'all competitions': [],
    };
    let allCompetitions = [];

    // Get each team and save by the competition name
    const teamsInCompetitions = competitions.map( async ( comp ) => {
        // Find Competition
        const competition = await db.Competition.findById( comp )
            .populate({
                path: 'teams.team',
                select: 'name shorthand'
            });

        competition.teams.forEach( team => teams['all competitions'].push( team.team ) );
        teams[ competition.name ] = competition.teams.map( team => team.team );
        allCompetitions.push({ name: competition.name, _id: competition._id });
    })
    await Promise.all( teamsInCompetitions );

    let completedFixtures, upcomingFixtures, allFixtures;
    completedFixtures = await db.Fixture.find({
        competition: { $in: competitions },
        status: 'completed'
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: -1 })
        .select( 'homeTeam awayTeam date status result');
    upcomingFixtures = await db.Fixture.find({
        competition: { $in: competitions },
        status: 'upcoming'
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: 1 })
        .select( 'homeTeam awayTeam date status stadium');
    allFixtures = await db.Fixture.find({
        competition: { $in: competitions }
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: 1 })
        .select( 'homeTeam awayTeam date status stadium');

    return {
        success: true,
        message: 'Fixture Page Data Acquired',
        data: { teams, upcomingFixtures, completedFixtures, allCompetitions, allFixtures }
    }
}

exports.getAdminProfile = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId )
        .populate([
            {
                path: 'associatedTeam',
                select: 'name department shorthand level coach players assistantCoach captain'
            },
            {
                path: 'associatedCompetitions',
                select: 'name description teams status fixtures'
            }
        ])
        .select( '-password' );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    let nextFixtures = [];
    let today = new Date();
    today.setHours( 0, 0, 0, 0 );
    let tomorrow = new Date( today );
    tomorrow.setDate( today.getDate() + 1 );
    // Check if user is competition-admin or team-admin
    if ( foundUser.role === 'competition-admin' ) {
        const competitions = foundUser.associatedCompetitions;
        nextFixtures = await db.Fixture.find({
            competition: { $in: competitions },
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .sort({ date: 1 })
            .limit(5)
            .populate([
                { 
                    path: 'homeTeam awayTeam',
                    select: 'name shorthand'
                },
                {
                    path: 'competition',
                    select: 'name'
                }
            ]);
    } else if (foundUser.role === 'team-admin') {
        const teamId = foundUser.associatedTeam;

        if ( teamId ) {
            nextFixtures = await db.Fixture.find({
                $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
                status: 'upcoming',
                date: { $gte: new Date() },
            })
                .sort({ date: 1 })
                .limit(5)
                .populate([
                    { 
                        path: 'homeTeam awayTeam',
                        select: 'name shorthand'
                    },
                    {
                        path: 'competition',
                        select: 'name'
                    }
                ]);
        }
    } else if ( foundUser.role === 'super-admin' ) {
        nextFixtures = await db.Fixture.find({
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .sort({ date: 1 })
            .limit(5)
            .populate([
                { 
                    path: 'homeTeam awayTeam',
                    select: 'name shorthand'
                },
                {
                    path: 'competition',
                    select: 'name'
                }
            ]);
    } else if ( foundUser.role === 'live-match-admin' ) {
        nextFixtures = await db.Fixture.find({
            $or: [
                { status: 'live' },
                { status: 'upcoming' }
            ],
            date: { $gte: today, $lt: tomorrow },
        })
            .sort({ date: 1 })
            .limit(5)
            .populate([
                { 
                    path: 'homeTeam awayTeam',
                    select: 'name shorthand'
                },
                {
                    path: 'competition',
                    select: 'name'
                }
            ]);
    }

    // Destructure properties
    const { name, email, status, associatedTeam, associatedCompetitions } = foundUser;

    // Return success
    return { 
        success: true, 
        message: 'User Aquired', 
        data: {
            name, email, status,
            competitions: associatedCompetitions.map( comp => {
                const { _id, name, description, fixtures, status, teams } = comp;

                return {
                    _id, name, description, status,
                    fixtures: fixtures.length,
                    teams: teams.length
                }
            } ),
            team: associatedTeam,
            nextFixtures
        }
    };
}

exports.getCompetitionAdminFixtureRecords = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId )
        .populate({
            path: 'associatedCompetitions',
            select: 'name'
        });
    const competitions = foundUser.associatedCompetitions;

    const completed_overdue = await db.Fixture.find({
        competition: { $in: competitions },
        $or: [
            { status: 'completed' },
            {
                $and: [
                    { status: 'upcoming' },
                    { date: { $lt: new Date() } }
                ]
            }
        ]
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: -1 })
        .select( 'homeTeam awayTeam date status result');

    const completedFixtures = await db.Fixture.find({
        competition: { $in: competitions },
        status: 'completed'
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: -1 })
        .select( 'homeTeam awayTeam date status result');
    
    const overdueFixtures = await db.Fixture.find({
        competition: { $in: competitions },
        status: 'upcoming',
        date: { $lt: new Date() }
    })
        .populate([
            { 
                path: 'homeTeam awayTeam',
                select: 'name department shorthand level'
            },
            {
                path: 'competition',
                select: 'name'
            }
        ])
        .sort({ date: -1 })
        .select( 'homeTeam awayTeam date status result');

    const allCompetitions = foundUser.associatedCompetitions.map( comp => ({ name: comp.name, _id: comp._id }) );
    
    return { success: true, message: 'Fixture Records Acquired', data: { completed_overdue, completedFixtures, overdueFixtures, allCompetitions } };
}

module.exports = exports;