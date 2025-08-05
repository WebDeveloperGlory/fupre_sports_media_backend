import db from '../../config/db'
import { FixtureStatus } from '../../types/fixture.enums';
import { UserRole } from '../../types/user.enums';

const getHomePageStatistics = async () => {
    try {
        const totalFootballTeams = await db.V2FootballTeam.countDocuments({});
        const totalFootballCompetitions = await db.V2FootballCompetition.countDocuments({});
        const totalActiveFootballCompetitions = await db.V2FootballCompetition.countDocuments({ isActive: true });
        const totalFootballFixtures = await db.V2FootballFixture.countDocuments({});
        const totalPlayedFootballFixtures = await db.V2FootballFixture.countDocuments({ status: FixtureStatus.COMPLETED });
        const totalUpcomingFootballFixtures = await db.V2FootballFixture.countDocuments({ 
            status: { $in: [FixtureStatus.SCHEDULED, FixtureStatus.POSTPONED] },
        });
        const totalBlogArticles = await db.V2Blog.countDocuments({});

        const latestBlogs = await db.V2Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const latestFootballFixtures = await db.V2FootballFixture.find({
            $expr: {
                $gte: [
                    {
                        $ifNull: ['$rescheduledDate', '$scheduledDate']
                    },
                    new Date()
                ]
            },
            status: { $in: ['scheduled', 'postponed'] }
        })
            .sort({
                // Sort by rescheduledDate if present, else scheduledDate
                rescheduledDate: 1,
                scheduledDate: 1
            })
            .limit(5)
            .select('homeTeam awayTeam stadium scheduledDate rescheduledDate competition')
            .populate([
                {
                    path: 'homeTeam awayTeam',
                    select: 'name shorthand logo'
                },
                {
                    path: 'competition',
                    select: 'name type shorthand'
                }
            ]);


        const totalTeams = totalFootballTeams || 0;
        const totalCompetitions = totalFootballCompetitions || 0;
        const totalActiveCompetitions = totalActiveFootballCompetitions || 0;
        const totalPlayedFixtures = totalPlayedFootballFixtures || 0;
        const latestFixtures = latestFootballFixtures.map(fixture => {
            return {
                ...fixture.toObject(),
                sport: 'football'
            }
        })

        return {
            success: true,
            message: 'Homepage Data Acquired',
            data: {
                football: {
                    totalCompetitions: totalFootballCompetitions,
                    totalTeams: totalFootballTeams,
                    totalUpcomingFixtures: totalUpcomingFootballFixtures,
                },
                basketball: {

                },
                general: {
                    totalCompetitions,
                    totalTeams,
                    totalPlayedFixtures,
                    totalActiveCompetitions,
                },
                fixtures: {
                    latest: latestFixtures,
                },
                blogs: {
                    total: totalBlogArticles,
                    latest: latestBlogs || []
                }
            }
        }
    } catch( err ) {
        console.error('Error getting homepage analytics', err );
        throw new Error('Error Fetching Homepage Analytics');
    }
}

const getCompetitionPageStatistics = async () => {
    try {
        const totalFootballCompetitions = await db.V2FootballCompetition.countDocuments({});
        const totalActiveFootballCompetitions = await db.V2FootballCompetition.countDocuments({ isActive: true });
        const totalCompletedFootballCompetitions = await db.V2FootballCompetition.countDocuments({ status: FixtureStatus.COMPLETED });
        const totalUpcomingFootballFixtures = await db.V2FootballFixture.countDocuments({ 
            status: { $in: [FixtureStatus.SCHEDULED, FixtureStatus.POSTPONED] },
            matchType: 'competition'
        });

        const totalCompetitions = totalFootballCompetitions || 0;
        const totalCompletedCompetitions = totalCompletedFootballCompetitions || 0;
        const totalUpcomingFixtures = totalUpcomingFootballFixtures || 0;
        const activeCompetitions = await db.V2FootballCompetition.find({ isActive: true });

        return {
            success: true,
            message: 'Competition Page Data Acquired',
            data: {
                general: {
                    totalUpcomingFixtures,
                    totalCompetitions,
                    totalCompletedCompetitions
                },
                football: {
                    activeCompetitions: {
                        total: totalActiveFootballCompetitions,
                        list: activeCompetitions
                    },
                },
                basketball: {

                },
            }
        }
    } catch( err ) {
        console.error('Error getting competition page analytics', err );
        throw new Error('Error Fetching Competition Analytics');
    }
}

const footballCompetitionPage = async () => {
    try {
        const competitionFixturesCount = await db.V2FootballFixture.countDocuments({ matchType: 'competition' });
        const liveCompetitionFixturesCount = await db.V2FootballFixture.countDocuments({
            matchType: 'competition',
            status: FixtureStatus.LIVE,
        })
        const allCompetitions = await db.V2FootballCompetition.find({})
            .populate([
                { path: 'leagueTable.team', select: 'name logo shorthand' },
                { path: 'stats.topScorers.player', select: 'name department admissionYear' },
                { path: 'stats.topScorers.team', select: 'name logo shorthand' },
                { path: 'awards.team.winner', select: 'name logo shorthand' },
            ]);
        const allActiveCompetitions = await db.V2FootballCompetition.find({ isActive: true });
        const featuredCompetitions = await db.V2FootballCompetition.find({ isFeatured: true })
            .populate([
                { path: 'leagueTable.team', select: 'name logo shorthand' },
                { path: 'stats.topScorers.player', select: 'name department admissionYear' },
                { path: 'stats.topScorers.team', select: 'name logo shorthand' },
            ]);

        return {
            success: true,
            message: 'Competitions Acquired',
            data: {
                competitionFixturesCount,
                liveCompetitionFixturesCount,
                allCompetitions,
                allActiveCompetitions,
                featuredCompetitions,
            }
        }
    } catch( err ) {
        console.error('Error getting football competition page analytics', err );
        throw new Error('Error Fetching Football Competition Analytics');
    }
}

const services = {
    getHomePageStatistics,
    getCompetitionPageStatistics,
    footballCompetitionPage,

}

export default services;