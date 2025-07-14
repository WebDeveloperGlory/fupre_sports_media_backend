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

const fixtureService = {
    getAllTodayFixtures,
    rescheduleFixture,
}

export default fixtureService;