import db from '../../config/db'
import { FixtureStatus } from '../../types/fixture.enums';
import { UserRole } from '../../types/user.enums';

const getSuperAdminFootballDashboardAnalytics = async () => {
    try {
        const totalTeams = await db.V2FootballTeam.countDocuments({});
        const totalCompetitions = await db.V2FootballCompetition.countDocuments({});
        const totalPlayers = await db.V2FootballPlayer.countDocuments({});
        const totalFixtures = await db.V2FootballFixture.countDocuments({});
        const totalLiveFixtures = await db.V2FootballLiveFixture.countDocuments({});
        const totalUnverifiedPlayers = await db.V2FootballPlayer.countDocuments({ verificationStatus: 'pending' });
        const totalActiveCompetitions = await db.V2FootballCompetition.countDocuments({ isActive: true });
        const totalAdminCount = await db.V2User.countDocuments({ role: { $ne: 'user' } });
        const lastAuditLogs = await db.V2AuditLog.find({}).sort({ createdAt: -1 }).limit( 10 );

        return {
            success: true,
            message: 'Dashboard Data Acquired',
            data: {
                totalTeams,
                totalCompetitions,
                totalPlayers,
                totalFixtures,
                totalLiveFixtures,
                totalUnverifiedPlayers,
                totalActiveCompetitions,
                totalAdminCount,
                auditLogs: lastAuditLogs.map( log => log.toObject() ),
            }
        }
    } catch( err ) {
        console.error('Error getting super admin dashboard analytics', err );
        throw new Error('Error Fetching Dashboard Analytics');
    }
}

const getHeadMediaAdminDashboardAnalytics = async () => {
    const prevWeek = new Date();
    prevWeek.setDate(prevWeek.getDate() - 7);

    try {
        const totalBlogs = await db.V2Blog.countDocuments({});
        const totalHeadMediaAdmins = await db.V2User.countDocuments({role: UserRole.HEAD_MEDIA_ADMIN});
        const totalMediaAdmins = await db.V2User.countDocuments({role: UserRole.MEDIA_ADMIN});
        const totalPublishedBlogs = await db.V2Blog.countDocuments({isPublished: true});
        const totalUnverifiedBlogs = await db.V2Blog.countDocuments({isVerified: false});
        const totalPendingLivePOTM = await db.V2FootballLiveFixture.countDocuments({
            $or: [
                { 'playerOfTheMatch.official': null },
                { 'playerOfTheMatch.official': {$exists: false} },
            ]
        });
        const totalPendingFixturePOTM = await db.V2FootballFixture.countDocuments({
            $and: [
                {
                    $or: [
                        { 'playerOfTheMatch.official': null },
                        { 'playerOfTheMatch.official': {$exists: false} },
                    ]
                },
                {
                    status: FixtureStatus.COMPLETED,
                    scheduledDate: { $gte: prevWeek }
                }
            ]
        });

        return {
            success: true,
            message: 'Dahboard Data Acquired',
            data: {
                totalBlogs,
                totalHeadMediaAdmins,
                totalMediaAdmins,
                totalPublishedBlogs,
                totalUnverifiedBlogs,
                totalPendingPOTM: totalPendingFixturePOTM + totalPendingLivePOTM
            }
        }
    } catch( err ) {
        console.error('Error getting media admin dashboard analytics', err );
        throw new Error('Error Fetching Dashboard Analytics');
    }
}

const getHeadMediaAdminFixturesForRating = async () => {
    const prevWeek = new Date();
    prevWeek.setDate(prevWeek.getDate() - 7);

    try {
        // Find fixtures pending POTM
        const pendingLivePOTM = await db.V2FootballLiveFixture.find({
            $or: [
                { 'playerOfTheMatch.official': null },
                { 'playerOfTheMatch.official': {$exists: false} },
            ]
        })
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
        const pendingFixturePOTM = await db.V2FootballFixture.find({
            $and: [
                {
                    $or: [
                        { 'playerOfTheMatch.official': null },
                        { 'playerOfTheMatch.official': {$exists: false} },
                    ]
                },
                {
                    status: FixtureStatus.COMPLETED,
                    scheduledDate: { $gte: prevWeek }
                }
            ]
        })
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

        // Return success
        return {
            success: true,
            message: 'Pending POTM Acquired',
            data: {
                pendingLivePOTM,
                pendingFixturePOTM
            }
        }
    } catch( err ) {
        console.error('Error getting fixtures needing rating', err );
        throw new Error('Error Fetching Fixtures Needing Ratings');
    }
}

const services = {
    getSuperAdminFootballDashboardAnalytics,
    getHeadMediaAdminDashboardAnalytics,
    getHeadMediaAdminFixturesForRating,

}

export default services;