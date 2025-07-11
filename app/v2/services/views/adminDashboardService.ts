import db from '../../config/db'

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
            message: '',
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

const services = {
    getSuperAdminFootballDashboardAnalytics,

}

export default services;