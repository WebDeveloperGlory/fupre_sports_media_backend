import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { FixtureLineup, FixtureStat, FixtureStreamLinks, FixtureTimeline, LiveStatus } from '../../types/fixture.enums';
import { getSocketService } from '../websocket/liveFixtureSocketService';

// CREATION //
const initializeLiveFixture = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
        try {
            const existingFixture = await db.V2FootballLiveFixture.findOne({ _id: fixtureId });
        } catch ( err ) {
            console.error('', err);
            throw new Error('Error Performing Updates')
        }
}
// END OF CREATION //

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
        return { success: true, message: 'Status Updated', data: updatedFixture }
    } catch ( err ) {
        console.error('', err);
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
            return { success: true, message: 'Statistics Updated', data: updatedFixture }
        } catch ( err ) {
            console.error('', err);
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
        return { success: true, message: 'Lineup Updated', data: updatedFixture }
    } catch ( err ) {
        console.error('', err);
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
        return { success: true, message: 'Timeline event created Updated', data: updatedFixture }
    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const editTimelineEvent = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}
const deleteTimelineEvent = async (
    { fixtureId }: { fixtureId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {

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

const liveFixtureService = {

}

export default liveFixtureService;