const db = require('../config/db');

exports.getGeneralInfo = async () => {
    const fixtureCount = await db.Fixture.countDocuments();
    const allCompetitionsCount = await db.Competition.countDocuments();
    const ongoingCompetitionsCount = await db.Competition.countDocuments({ status: 'ongoing' });
    const teamCount = await db.Team.countDocuments();

    const featuredCompetitionDoc = await db.Competition.find({ isFeatured: true })
        .select('name startDate endDate description teams fixtures');
    const featuredCompetition = {
        name: featuredCompetitionDoc.name,
        startDate: featuredCompetitionDoc.startDate,
        endDate: featuredCompetitionDoc.endDate,
        description: featuredCompetitionDoc.description,
        teams: featuredCompetitionDoc.teams.length,
        fixtures: featuredCompetitionDoc.fixtures.length,
    }

    return { success: true, message: 'General Info Acquired', data: { fixtureCount, allCompetitionsCount, ongoingCompetitionsCount, teamCount, featuredCompetition } };
}

module.exports = exports;