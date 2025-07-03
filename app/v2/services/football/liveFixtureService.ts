import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { FixtureLineup, FixtureStat, FixtureStatus, FixtureStreamLinks, FixtureTimeline, FixtureTimelineCardType, FixtureTimelineGoalType, FixtureTimelineType, LiveStatus } from '../../types/fixture.enums';
import { getSocketService } from '../websocket/liveFixtureSocketService';
import { UserRole } from '../../types/user.enums';
import { LogAction } from '../../types/auditlog.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';

// CREATION AND END //
const initializeLiveFixture = async (
    { fixtureId, adminId }: { fixtureId: string; adminId: string; },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
        try {
            // Find fixture
            const existingFixture = await db.V2FootballFixture.findOne({ 
                _id: fixtureId, 
                status: { $ne: FixtureStatus.COMPLETED } 
            });
            if( !existingFixture ) return { success: false, message: 'Invalid Fixture' };

            // Find admin
            const foundAdmin = await db.V2User.findOne({ _id: adminId, role: UserRole.LIVE_FIXTURE_ADMIN });
            if( !foundAdmin ) return { success: false, message: 'Invalid Admin' };

            // Check if live fixture already exists
            const existingLiveFixture = await db.V2FootballLiveFixture.findOne({ fixture: fixtureId });
            if ( existingLiveFixture ) return { success: false, message: 'Live fixture already exists' };

            // Create live fixture
            const { homeTeam, awayTeam, matchType, competition, stadium, scheduledDate } = existingFixture;
            const liveFixture = new db.V2FootballLiveFixture({
                fixture: existingFixture._id,
                homeTeam, awayTeam,
                matchType, stadium,
                matchDate: scheduledDate,
                admin: foundAdmin._id,
            });
            if( matchType === 'competition' && existingFixture.competition ) liveFixture.competition = competition;

            // Update fixure status
            existingFixture.status = FixtureStatus.LIVE;
            await existingFixture.save();
            await liveFixture.save();

            // Log action
            await auditLogUtils.logAction({
                userId,
                action: LogAction.CREATE,
                entity: 'V2FootballCompetition',
                entityId: liveFixture._id,
                message: `New Fixture Initialized As Live`,
                ipAddress: auditInfo.ipAddress,
                userAgent: auditInfo.userAgent,
                newValues: liveFixture.toObject()
            });

            // Return success
            return { success: true, message: 'Live Fixture Initialized', data: liveFixture.toObject() };
        } catch ( err ) {
            console.error('Error Creating Live Fixture', err);
            throw new Error('Error Initializing Fixture')
        }
}
// END OF CREATION AND END //

// GET REQUESTS //

// END OF GET REQUESTS //

// UPDATES //
const updateLiveFixtureStatus = async (
    { fixtureId }: { fixtureId: string },
    { status }: { status: LiveStatus },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check value of status
        if( !Object.values( LiveStatus ).includes( status ) ) return { success: false, message: `Invalid Status Type ${ status }` };

        // Check if fixture exists and update
        const updatedFixture = await db.V2FootballLiveFixture.findByIdAndUpdate(
            fixtureId,
            { status },
            { new: true }
        );
        if( !updatedFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitStatusUpdate(fixtureId, status, updatedFixture.currentMinute); 

        // Return success
        return { success: true, message: 'Status Updated', data: updatedFixture.status }
    } catch ( err ) {
        console.error('Error updating live fixture status', err);
        throw new Error('Error Performing Updates')
    }
}
const updateLiveFixtureStatistics = async (
    { fixtureId }: { fixtureId: string },
    { stats }: { stats: { home: FixtureStat, away: FixtureStat } },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if fixture exists and update
        const updatedFixture = await db.V2FootballLiveFixture.findByIdAndUpdate(
            fixtureId,
            { statistics: stats },
            { new: true }
        );
        if( !updatedFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitStatisticsUpdate(fixtureId); 

        // Return success
        return { success: true, message: 'Statistics Updated', data: updatedFixture.statistics }
    } catch ( err ) {
        console.error('Error updating live fixture statistics', err);
        throw new Error('Error Performing Updates')
    }
}
const updateLiveFixtureLineup = async (
    { fixtureId }: { fixtureId: string },
    { lineups }: { lineups: { home: FixtureLineup, away: FixtureLineup } },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if fixture exists and update
        const updatedFixture = await db.V2FootballLiveFixture.findByIdAndUpdate(
            fixtureId,
            { lineups: lineups },
            { new: true }
        );
        if( !updatedFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitLineupUpdate(fixtureId); 

        // Return success
        return { success: true, message: 'Lineup Updated', data: updatedFixture.lineups }
    } catch ( err ) {
        console.error('Error updating live fixture lineups', err);
        throw new Error('Error Performing Updates')
    }
}
const createTimeLineEvent = async (
    { fixtureId }: { fixtureId: string },
    { event }: { event: FixtureTimeline },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if fixture exists and update
        const updatedFixture = await db.V2FootballLiveFixture.findByIdAndUpdate(
            fixtureId,
            {
                $push: {
                    timeline: event
                }
            },
            { new: true }
        );
        if( !updatedFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitStatisticsUpdate(fixtureId); 

        // Return success
        return { success: true, message: 'Timeline event created Updated', data: updatedFixture.timeline }
    } catch ( err ) {
        console.error('Error adding event to timeline', err);
        throw new Error('Error Performing Updates')
    }
}
type TimeLineEditForm = {
    eventId: string;
    type?: FixtureTimelineType;
    team?: string;
    player?: string;
    relatedPlayer?: string; // assists
    minute?: number;
    injuryTime?: boolean;
    description?: string;
    goalType?: FixtureTimelineGoalType;
    cardType?: FixtureTimelineCardType;
}
const editTimelineEvent = async (
    { fixtureId }: { fixtureId: string },
    { eventId, ...updates }: TimeLineEditForm,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if live fixture exists
        const foundLiveFixture = await db.V2FootballLiveFixture.findOne({ fixture: fixtureId });
        if( !foundLiveFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Check if event exists
        const event = foundLiveFixture.timeline.find( event => event.id === eventId );
        if( !event ) return { success: false, message: 'Invalid/Deleted Event' };

        // Perform updates
        if( updates.cardType ) event.cardType = updates.cardType;
        if( updates.type ) event.type = updates.type;
        if( updates.team ) event.team = updates.team as unknown as ObjectId;
        if( updates.player ) event.player = updates.player as unknown as ObjectId;
        if( updates.relatedPlayer ) event.relatedPlayer = updates.relatedPlayer as unknown as ObjectId;
        if( updates.injuryTime ) event.injuryTime = updates.injuryTime;
        if( updates.description ) event.description = updates.description;
        if( updates.goalType ) event.goalType = updates.goalType;

        const updatedTimeline = foundLiveFixture.timeline.map( evnt => {
            if( evnt.id === eventId ) {
                return event;
            } else {
                return evnt;
            }
        });
        foundLiveFixture.timeline = updatedTimeline;
        await foundLiveFixture.save();

        // Return success
        return { success: true, message: 'Timeline event updated', data: event }
    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const deleteTimelineEvent = async (
    { fixtureId }: { fixtureId: string },
    { eventId }: { eventId: string; },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if live fixture exists
        const foundLiveFixture = await db.V2FootballLiveFixture.findOne({ fixture: fixtureId });
        if( !foundLiveFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Check if event exists
        const event = foundLiveFixture.timeline.some( event => event.id === eventId );
        if( !event ) return { success: false, message: 'Invalid/Deleted Event' };

        // Delete event
        const updatedTimeline = foundLiveFixture.timeline.filter( event => event.id !== eventId );
        foundLiveFixture.timeline = updatedTimeline;
        await foundLiveFixture.save();

        // Return success
        return { success: true, message: 'Timeline event deleted', data: updatedTimeline };
    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const createSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { team, playerOut, playerIn, minute, injury }: { team: 'home' | 'away', playerOut: ObjectId, playerIn: ObjectId, minute: number, injury: boolean },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Confirm both players are part 
    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const editSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const deleteSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const updateLiveFixtureScore = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const updateLiveFixtureCommentary = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const updateOfficialPOTM = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const updateOfficialPlayerRatings = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const generalUpdates = async (
    { fixtureId }: { fixtureId: string }, 
    { weather, attendance, stream, referee, kickoff }:
    { 
        weather?: { condition: string, temperature: number, humidity: number },
        attendance?: number,
        referee?: string,
        kickoff?: Date,
        stream?: FixtureStreamLinks
    },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for live fixture
        const livefixture = await db.V2FootballLiveFixture.findById( fixtureId );
        if( !livefixture ) return { success: false, message: 'Invalid live Fixture' };

        // Check what was passed in body and perform updates
        if( weather ) {
            if( !weather.condition || !weather.temperature || !weather.humidity ) return { success: false, message: 'Missing required weather fields' }

            livefixture.weather = weather;
        }
        if( attendance ) livefixture.attendance = attendance;
        if( referee ) livefixture.referee = referee;
        if( kickoff ) livefixture.kickoffTime = kickoff;
        if( stream ) {
            if( !stream.platform || !stream.url || !stream.requiresSubscription || !stream.isOfficial ) return { success: false, message: 'Missing required stream fields' };

            livefixture.streamLinks.push( stream );
        }
        await livefixture.save();

        // Get the pre-initialized socket service
        const socketService = getSocketService();

        // Emit updates
        if (weather || attendance || referee || kickoff) {
            await socketService.emitCustomEvent(
                fixtureId,
                'general-update',
                {
                    weather: livefixture.weather,
                    attendance: livefixture.attendance,
                    referee: livefixture.referee,
                    kickoffTime: livefixture.kickoffTime,
                    updatedAt: new Date()
                }
            );
        }

        if (stream) {
            await socketService.emitCustomEvent(
                fixtureId,
                'stream-update',
                { 
                    streams: livefixture.streamLinks,
                    updatedAt: new Date()
                }
            );
        }

        // Return success
        return { success: true, message: 'Updates Performed', data: livefixture }
    } catch( err ) {
        console.error('Error during live fixture update', err );
        throw new Error('Error With Live General Updates');
    }
}
const updateTime = async (
    { fixtureId }: { fixtureId: string },
    { time }: { time: number },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for live fixture
        const livefixture = await db.V2FootballLiveFixture.findById( fixtureId );
        if( !livefixture ) return { success: false, message: 'Invalid live Fixture' };

        // Update time
        if( time > livefixture.currentMinute ) {
            livefixture.currentMinute = time;
            await livefixture.save();
        }

        // In your service files when time changes:
        const socketService = getSocketService();
        await socketService.emitCustomEvent(fixtureId, 'minute-update', {
            currentMinute: livefixture.currentMinute,
            injuryTime: livefixture.injuryTime,
            status: livefixture.status,
            timestamp: new Date()
        }); 

        // Return success
        return { success: true, message: 'Time Updated', data: livefixture }
    } catch( err ) {
        console.error('Error during live fixture update', err );
        throw new Error('Error With Live Time Updates');
    }
}
// END OF ADMIN UPDATES //

// USER UPDATES //

// END OF USER UPDATES //

const liveFixtureService = {
    // Creation and End //
    initializeLiveFixture,

    // Updates //
    updateLiveFixtureStatus,
    updateLiveFixtureStatistics,
    updateLiveFixtureLineup,
    createTimeLineEvent,
    editTimelineEvent,
    deleteTimelineEvent,

    generalUpdates,
    updateTime,
}

export default liveFixtureService;