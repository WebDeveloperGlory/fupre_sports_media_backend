import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { FixtureStatus } from '../../types/fixture.enums';
import { AuditInfo } from '../../types/express';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';

const getAllTodayFixtures = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const fixtures = await db.V2FootballFixture.find({
            $or: [
                {
                    status: { $in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE] },
                    scheduledDate: { $gte: today, $lt: tomorrow }
                },
                {
                    status: FixtureStatus.POSTPONED,
                    rescheduledDate: { $gte: today, $lt: tomorrow }
                },
                {
                    status: FixtureStatus.LIVE,
                },
                {
                    status: FixtureStatus.SCHEDULED,
                    scheduledDate: { $lte: tomorrow }
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

        // Get necessary data only
        const fixtureData = fixtures.map( fixture => {
            const { _id, homeTeam, awayTeam, competition, scheduledDate, rescheduledDate, status, stadium } = fixture;
            return { _id, homeTeam, awayTeam, competition, scheduledDate, rescheduledDate, status, stadium };
        })

        // Return success
        return { success: true, message: 'Fixtures Acquired', data: fixtureData };
    } catch ( err ) {
        console.error('Error fetching live fixture', err);
        throw new Error('Error Fetching Live Fixture')
    }
}

const rescheduleFixture = async (
    { fixtureId }: { fixtureId: string },
    { postponedReason, rescheduledDate }: { postponedReason: string, rescheduledDate: Date }, 
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if the fixture exists
        const fixture = await db.V2FootballFixture.findById( fixtureId )
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
        if( !fixture ) return { success:false, message: 'Invalid Fixture' };

        const oldFixture = await db.V2FootballFixture.findById( fixtureId );
        
        // Update fixture
        fixture.status = FixtureStatus.POSTPONED;
        fixture.rescheduledDate = rescheduledDate;
        fixture.postponedReason = postponedReason;
        await fixture.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballFixture',
            entityId: fixture._id,
            message: `Fixture ${ fixture._id } Postponed By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldFixture!.toObject(),
            newValues: fixture.toObject()
        });

        // Return success
        return { success: true, message: 'Fixtures Acquired', data: fixture.toObject() };
    } catch ( err ) {
        console.error('Error fetching live fixture', err);
        throw new Error('Error Fetching Live Fixture')
    }
}

const getRecentFixtures = async (
    {limit = 5}: { limit: number }
) => {
    try {
        const fixtures = await db.V2FootballFixture.find({
            status: FixtureStatus.COMPLETED,
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
            ])
            .sort({ scheduledDate: -1 })
            .limit(limit);

        // Return success
        return { success: true, message: 'Recent Fixtures Acquired', data: fixtures };
    } catch ( err ) {
        console.error('Error fetching recent fixtures', err);
        throw new Error('Error Fetching Recent Fixtures')
    }
}

const getFixtureById = async (
    {fixtureId}: {fixtureId: string}
) => {
    const fixture = await db.V2FootballFixture.findById( fixtureId )
        .populate([
            {
                path: 'homeTeam awayTeam',
                select: 'name shorthand logo'
            },
            {
                path: 'competition',
                select: 'name type shorthand'
            },
            {
                path: 'goalScorers.player',
                select: 'name department admissionYear'
            },
            {
                path: 'goalScorers.team',
                select: 'name logo shorthand'
            },
            {
                path: 'lineups.home.startingXI.player lineups.home.substitutes.player lineups.away.startingXI.player lineups.away.substitutes.player',
                select: 'name department admissionYear'
            },
            {
                path: 'substitutions.playerOut substitutions.playerIn',
                select: 'name department admissionYear'
            },
            {
                path: 'timeline.player timeline.relatedPlayer',
                select: 'name department admissionYear'
            },
            {
                path: 'playerOfTheMatch.official playerOfTheMatch.userVotes.playerId playerOfTheMatch.fanVotes.player',
                select: 'name department admissionYear'
            },
            {
                path: 'playerRatings.player',
                select: 'name department admissionYear'
            },
        ]);
    if(!fixture) return {success: false, message: 'Invalid Fixture'};

    // Return success
    return { success: true, message: 'Fixture Acquired', data: fixture.toObject() };
}

const getFixtures = async (
    {status, limit=5}: {status: FixtureStatus, limit?: number}
) => {
    const filters: {status?: FixtureStatus} = {};
    if(status) filters.status = status;

    const fixtures = await db.V2FootballFixture.find(filters)
        .populate([
            {
                path: 'homeTeam awayTeam',
                select: 'name shorthand logo'
            },
            {
                path: 'competition',
                select: 'name type shorthand'
            }
        ])
        .sort({ scheduledDate: -1 })
        .limit(limit);

    // Return success
    return { success: true, message: 'Fixture Acquired', data: fixtures };
}

const fixtureService = {
    getAllTodayFixtures,
    rescheduleFixture,
    getRecentFixtures,
    getFixtures,
    getFixtureById,

}

export default fixtureService;