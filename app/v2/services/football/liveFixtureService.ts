import mongoose, { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { FixtureLineup, FixtureStat, FixtureStatus, FixtureStreamLinks, FixtureSubstitutions, FixtureTimeline, FixtureTimelineCardType, FixtureTimelineGoalType, FixtureTimelineType, LiveStatus, TeamType } from '../../types/fixture.enums';
import { getSocketService } from '../websocket/liveFixtureSocketService';
import { UserRole } from '../../types/user.enums';
import { LogAction } from '../../types/auditlog.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { PlayerRole } from '../../types/player.enums';

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
            const existingLiveFixture = await db.V2FootballLiveFixture.findById( fixtureId );
            if ( existingLiveFixture ) return { success: false, message: 'Live fixture already exists' };

            // Create live fixture
            const { homeTeam, awayTeam, status, matchType, competition, stadium, scheduledDate, rescheduledDate } = existingFixture;
            const liveFixture = new db.V2FootballLiveFixture({
                fixture: existingFixture._id,
                homeTeam, awayTeam,
                matchType, stadium,
                matchDate: status === FixtureStatus.POSTPONED ? rescheduledDate : scheduledDate,
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
const getAllLiveFixtures = async () => {
    try {
        // Get all live fixtures
        const foundFixtures = await db.V2FootballFixture.find({})
            .populate([
                {
                    path: 'competition',
                    select: 'name type'
                },
                {
                    path: 'homeTeam awayTeam',
                    select: 'name logo shorthand'
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
                    path: 'playerOfTheMatch.official playerOfTheMatch.fanVotes.player',
                    select: 'name department admissionYear'
                },
                {
                    path: 'playerRatings.player',
                    select: 'name department admissionYear'
                },
            ]);

        // Return success
        return { success: true, message: 'Live Fixtures Acquired', data: foundFixtures };
    } catch ( err ) {
        console.error('Error fetching live fixtures', err);
        throw new Error('Error Fetching Live Fixtures')
    }
}
const getLiveFixtureById = async (
    { fixtureId }: { fixtureId: string },
) => {
    try {
        // Check if fixture exists
        const foundFixture = await db.V2FootballFixture.findById( fixtureId )
            .populate([
                {
                    path: 'competition',
                    select: 'name type'
                },
                {
                    path: 'homeTeam awayTeam',
                    select: 'name logo shorthand'
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
                    path: 'playerOfTheMatch.official playerOfTheMatch.fanVotes.player',
                    select: 'name department admissionYear'
                },
                {
                    path: 'playerRatings.player',
                    select: 'name department admissionYear'
                },
            ]);
        if( !foundFixture ) return { success: false, message: 'Invaid Fixture' };

        // Return success
        return { success: true, message: 'Live Fixture Acquired', data: foundFixture };
    } catch ( err ) {
        console.error('Error fetching live fixture', err);
        throw new Error('Error Fetching Live Fixture')
    }
}
type TeamPlayerDetails = {
    _id: string;
    name: string;
    admissionYear: string;
    role: PlayerRole;
    position: string;
    jerseyNumber: number;
}
const getLiveFixtureTeamPlayers = async (
    { fixtureId }: { fixtureId: string },
) => {
    try {
        // Check if fixture exists
        const foundFixture = await db.V2FootballFixture.findById( fixtureId );
        if( !foundFixture ) return { success: false, message: 'Invaid Fixture' };

        // Check for team players
        const hPlayers = await db.V2FootballPlayer.find({ 'teams.team': foundFixture.homeTeam });
        const aPlayers = await db.V2FootballPlayer.find({ 'teams.team': foundFixture.awayTeam });

        // Map through teams
        const homePlayers = hPlayers.map( player => {
            const { _id, name, admissionYear } = player;
            const inTeamDetails = player.teams.find( t => t.team.toString() === foundFixture.homeTeam.toString() );

            const playerDetails: TeamPlayerDetails = { 
                _id: _id.toString(),
                name, admissionYear,
                role: inTeamDetails!.role,
                position: inTeamDetails!.position,
                jerseyNumber: inTeamDetails!.jerseyNumber,
            };

            return { ...playerDetails };
        });
        const awayPlayers = aPlayers.map( player => {
            const { _id, name, admissionYear } = player;
            const inTeamDetails = player.teams.find( t => t.team.toString() === foundFixture.awayTeam.toString() );

            const playerDetails: TeamPlayerDetails = {
                _id: _id.toString(),
                name, admissionYear,
                role: inTeamDetails!.role,
                position: inTeamDetails!.position,
                jerseyNumber: inTeamDetails!.jerseyNumber,
            };

            return { ...playerDetails };
        });

        // Return success
        return { success: true, message: 'Team Players Acquired', data: { homePlayers, awayPlayers } };
    } catch ( err ) {
        console.error('Error fetching live fixture team players', err);
        throw new Error('Error Fetching Live Team Players')
    }
}
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
        await socketService.emitTimelineEvent(fixtureId, event); 

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
    team?: TeamType;
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
        const foundLiveFixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if( !foundLiveFixture ) return { success: false, message: 'Invalid Live Fixture' };

        // Check if event exists
        const event = foundLiveFixture.timeline.find( event => event.id === eventId );
        if( !event ) return { success: false, message: 'Invalid/Deleted Event' };

        // Perform updates
        if( updates.cardType ) event.cardType = updates.cardType;
        if( updates.type ) event.type = updates.type;
        if( updates.team ) event.team = updates.team;
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
        const foundLiveFixture = await db.V2FootballLiveFixture.findById( fixtureId );
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
type SubstitutionPayload = {
    team: TeamType;
    playerOutId: string;
    playerInId: string;
    minute: number;
    injuryTime?: boolean;
    injury: boolean;
};
const addSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { team, playerOutId, playerInId, minute, injury, injuryTime }: SubstitutionPayload,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Create substitution
        const substitution: FixtureSubstitutions = {
            id: new mongoose.Types.ObjectId().toString(),
            team,
            playerOut: playerOutId as unknown as ObjectId,
            playerIn: playerInId as unknown as ObjectId,
            minute,
            injury
        };

        fixture.substitutions.push(substitution);

        // Add to timeline
        const timelineEvent: FixtureTimeline = {
            id: new mongoose.Types.ObjectId().toString(),
            type: FixtureTimelineType.SUBSTITUTION,
            team,
            player: playerOutId as unknown as ObjectId,
            relatedPlayer: playerInId as unknown as ObjectId,
            minute,
            injuryTime,
            description: injury ? 'Injury substitution' : 'Substitution'
        };

        fixture.timeline.push(timelineEvent);
        await fixture.save();

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitLineupUpdate(fixtureId);
        await socketService.emitTimelineEvent(fixtureId, timelineEvent);

        return {
            success: true,
            message: 'Substitution added',
            data: {
                substitution,
                timelineEvent
            }
        };
    } catch (err) {
        console.error('Error adding substitution:', err);
        throw err;
    }
};

const updateSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { substitutionId, updates }: { substitutionId: string; updates: Partial<FixtureSubstitutions> },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        const subIndex = fixture.substitutions.findIndex(
            s => s.id === substitutionId
        );

        if (subIndex === -1) {
            return { success: false, message: 'Substitution not found' };
        }

        // Update substitution
        fixture.substitutions[subIndex] = {
            ...fixture.substitutions[subIndex],
            ...updates
        };

        // Update corresponding timeline event if minute changed
        if (updates.minute !== undefined) {
            const timelineIndex = fixture.timeline.findIndex(
                event => event.type === 'substitution' &&
                         event.player.toString() === fixture.substitutions[subIndex].playerOut.toString()
            );

            if (timelineIndex >= 0) {
                fixture.timeline[timelineIndex].minute = updates.minute;
                fixture.timeline[timelineIndex].injuryTime = updates.minute % 1 !== 0;
            }
        }

        await fixture.save();

        return {
            success: true,
            message: 'Substitution updated',
            data: fixture.substitutions[subIndex]
        };
    } catch (err) {
        console.error('Error updating substitution:', err);
        throw err;
    }
};

const removeSubstitution = async (
    { fixtureId }: { fixtureId: string },
    { substitutionId }: { substitutionId: string; },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        const subIndex = fixture.substitutions.findIndex(
            s => s.id === substitutionId
        );

        if (subIndex === -1) {
            return { success: false, message: 'Substitution not found' };
        }

        const removedSub = fixture.substitutions[subIndex];
        fixture.substitutions.splice(subIndex, 1);

        // Remove corresponding timeline event
        const timelineIndex = fixture.timeline.findIndex(
            event => event.type === 'substitution' &&
                     event.player.toString() === removedSub.playerOut.toString()
        );

        if (timelineIndex >= 0) {
            fixture.timeline.splice(timelineIndex, 1);
        }

        await fixture.save();

        return {
            success: true,
            message: 'Substitution removed',
            data: fixture.substitutions
        };
    } catch (err) {
        console.error('Error removing substitution:', err);
        throw err;
    }
};
type UpdateScorePayload = {
    homeScore?: number;
    awayScore?: number;
    isHalftime?: boolean;
    homePenalty?: number, 
    awayPenalty?: number;
};
const updateFixtureScore = async (
    { fixtureId }: { fixtureId: string },
    { homeScore, awayScore, isHalftime, homePenalty, awayPenalty }: UpdateScorePayload,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        if( homeScore ) fixture.result.homeScore = homeScore;
        if( awayScore ) fixture.result.awayScore = awayScore;
        if( homePenalty ) fixture.result.homePenalty = homePenalty;
        if( awayPenalty ) fixture.result.awayPenalty = awayPenalty;
        if (isHalftime) {
            fixture.result.halftimeHomeScore = fixture.result.homeScore;
            fixture.result.halftimeAwayScore = fixture.result.awayScore;
            fixture.status = LiveStatus.HALFTIME;
        }

        await fixture.save();

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitScoreUpdate(fixtureId);

        return {
            success: true,
            message: isHalftime ? 'Halftime score updated' : 'Score updated',
            data: fixture.result
        };
    } catch (err) {
        console.error('Error updating fixture score:', err);
        throw err;
    }
};
type GoalScorerPayload = {
    playerId: string;
    teamId: string;
    time: number;
    goalType?: FixtureTimelineGoalType;
};
const addGoalScorer = async (
    { fixtureId }: { fixtureId: string },
    { playerId, teamId, time, goalType }: GoalScorerPayload,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Add to goal scorers
        fixture.goalScorers.push({
            player: playerId as unknown as ObjectId,
            team: teamId as unknown as ObjectId,
            time
        });

        // Add to timeline
        const timelineEvent: FixtureTimeline = {
            id: new mongoose.Types.ObjectId().toString(),
            type: FixtureTimelineType.GOAL,
            team: teamId === fixture.homeTeam.toString() ? TeamType.HOME : TeamType.AWAY,
            player: playerId as unknown as ObjectId,
            minute: Math.floor(time),
            injuryTime: time % 1 !== 0,
            description: 'Goal scored',
            goalType: goalType || FixtureTimelineGoalType.REGULAR
        };

        fixture.timeline.push(timelineEvent);
        await fixture.save();

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitScoreUpdate(fixtureId);
        await socketService.emitTimelineEvent(fixtureId, timelineEvent);

        return {
            success: true,
            message: 'Goal scorer added',
            data: {
                goalScorers: fixture.goalScorers,
                timelineEvent
            }
        };
    } catch (err) {
        console.error('Error adding goal scorer:', err);
        throw err;
    }
};

const removeGoalScorer = async (
    { fixtureId }: { fixtureId: string },
    { goalScorerId }: { goalScorerId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Remove from goal scorers
        const goalIndex = fixture.goalScorers.findIndex(
            g => g.player.toString() === goalScorerId
        );

        if (goalIndex === -1) {
            return { success: false, message: 'Goal scorer not found' };
        }

        const removedGoal = fixture.goalScorers[goalIndex];
        fixture.goalScorers.splice(goalIndex, 1);

        // Remove from timeline
        const timelineIndex = fixture.timeline.findIndex(
            event => event.type === 'goal' && 
                     event.player.toString() === removedGoal.player.toString() &&
                     event.minute === Math.floor(removedGoal.time)
        );

        if (timelineIndex >= 0) {
            fixture.timeline.splice(timelineIndex, 1);
        }

        await fixture.save();

        // Emit updates to websocket
        const socketService = getSocketService();
        await socketService.emitScoreUpdate(fixtureId);
        await socketService.emitCustomEvent(fixtureId, 'goal-removed', {
            goalScorerId,
            timelineIndex
        });

        return {
            success: true,
            message: 'Goal scorer removed',
            data: fixture.goalScorers
        };
    } catch (err) {
        console.error('Error removing goal scorer:', err);
        throw err;
    }
};
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
    { playerId }: { playerId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate player exists and is in the fixture
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId)
            .select('lineups playerOfTheMatch');
        
        if (!fixture) {
            return { success: false, message: 'Invalid Live Fixture' };
        }

        // Check if player is in either team's lineup
        const isPlayerInFixture = [
            ...fixture.lineups.home.startingXI,
            ...fixture.lineups.home.substitutes,
            ...fixture.lineups.away.startingXI,
            ...fixture.lineups.away.substitutes
        ].some(p => p.player.toString() === playerId);

        if (!isPlayerInFixture) {
            return { success: false, message: 'Player is not part of this fixture' };
        }

        // Update official POTM
        fixture.playerOfTheMatch.official = playerId as unknown as ObjectId;
        await fixture.save();

        // Emit update via socket
        const socketService = getSocketService();
        await socketService.emitPlayerOfTheMatchUpdate(fixtureId);

        return {
            success: true,
            message: 'Official Player of the Match updated',
            data: fixture.playerOfTheMatch
        };
    } catch (err) {
        console.error('Error updating official POTM:', err);
        throw err;
    }
};
type OfficialPlayerRating = {
    playerId: string;
    isHomePlayer: boolean;
    rating: number; // 0-10
    stats?: {
        goals?: number;
        assists?: number;
        shots?: number;
        passes?: number;
        tackles?: number;
        saves?: number;
    };
};
const updateOfficialPlayerRatings = async (
    { fixtureId }: { fixtureId: string },
    { ratings }: { ratings: OfficialPlayerRating[]; },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Update each player's official rating
        ratings.forEach(rating => {
            const existingRatingIndex = fixture.playerRatings.findIndex(
                r => r.player.toString() === rating.playerId
            );

            const ratingData = {
                rating: Math.min(10, Math.max(0, rating.rating)), // Clamp to 0-10
                ratedBy: userId,
            };

            if (existingRatingIndex >= 0) {
                // Update existing rating
                fixture.playerRatings[existingRatingIndex].official = ratingData;
            } else {
                // Add new rating
                fixture.playerRatings.push({
                    player: rating.playerId as unknown as ObjectId,
                    team: rating.isHomePlayer ? TeamType.HOME : TeamType.AWAY,
                    official: ratingData,
                    fanRatings: {
                        average: 0,
                        count: 0,
                        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 }
                    },
                    stats: rating.stats ? rating.stats : undefined
                });
            }
        });
        await fixture.save();

        // Emit update via socket
        const socketService = getSocketService();
        await socketService.emitCustomEvent(fixtureId, 'player-ratings-updated', {
            ratings: fixture.playerRatings
        });

        return {
            success: true,
            message: 'Official player ratings updated',
            data: fixture.playerRatings
        };
    } catch (err) {
        console.error('Error updating official player ratings:', err);
        throw err;
    }
};

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
    { regularTime, injuryTime }: { regularTime: number, injuryTime?: number },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for live fixture
        const livefixture = await db.V2FootballLiveFixture.findById( fixtureId );
        if( !livefixture ) return { success: false, message: 'Invalid live Fixture' };

        // Update time
        if( regularTime > livefixture.currentMinute ) {
            livefixture.currentMinute = regularTime;
        }
        if( injuryTime ) livefixture.injuryTime = injuryTime;
        await livefixture.save();

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
type UserPlayerRating = {
    playerId: string;
    isHomePlayer: boolean;
    rating: number; // 1-10
};
const submitUserPlayerRating = async (
    { fixtureId }: { fixtureId: string },
    { playerId, rating, isHomePlayer }: UserPlayerRating,
) => {
    try {
        // Validate rating
        if (rating < 1 || rating > 10) {
            return { success: false, message: 'Rating must be between 1 and 10' };
        }

        const fixture = await db.V2FootballLiveFixture.findById(fixtureId);
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Check if player is in the fixture
        const playerInFixture = [
            ...fixture.lineups.home.startingXI,
            ...fixture.lineups.home.substitutes,
            ...fixture.lineups.away.startingXI,
            ...fixture.lineups.away.substitutes
        ].some(p => p.player.toString() === playerId);

        if (!playerInFixture) {
            return { success: false, message: 'Player is not part of this fixture' };
        }

        // Find or create player rating entry
        let playerRating = fixture.playerRatings.find(
            r => r.player.toString() === playerId
        );

        if (!playerRating) {
            playerRating = {
                player: playerId as unknown as ObjectId,
                team: isHomePlayer ? TeamType.HOME : TeamType.AWAY, // You'd need to determine this
                fanRatings: {
                    average: 0,
                    count: 0,
                    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 }
                }
            };
            fixture.playerRatings.push(playerRating);
        }

        // Update fan ratings
        const prevCount = playerRating.fanRatings.count;
        const prevAverage = playerRating.fanRatings.average;
        const newCount = prevCount + 1;
        const newAverage = ((prevAverage * prevCount) + rating) / newCount;
        const key = rating.toString() as keyof typeof playerRating.fanRatings.distribution;

        playerRating.fanRatings = {
            average: parseFloat(newAverage.toFixed(1)),
            count: newCount,
            distribution: {
                ...playerRating.fanRatings.distribution,
                [key]: (playerRating.fanRatings.distribution[key] || 0) + 1
            }
        };

        await fixture.save();

        // Emit update via socket
        const socketService = getSocketService();
        await socketService.emitCustomEvent(fixtureId, 'player-rating-added', {
            playerId,
            newAverage: playerRating.fanRatings.average,
            newCount: playerRating.fanRatings.count
        });

        return {
            success: true,
            message: 'Player rating submitted',
            data: {
                playerId,
                averageRating: playerRating.fanRatings.average,
                totalRatings: playerRating.fanRatings.count
            }
        };
    } catch (err) {
        console.error('Error submitting player rating:', err);
        throw err;
    }
};
const submitUserPOTMVote = async (
    { fixtureId }: { fixtureId: string },
    { playerId }: { playerId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId)
            .select('playerOfTheMatch currentMinute status lineups');
        
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Check if match has reached 70 minutes
        if (fixture.currentMinute < 70 && fixture.status !== LiveStatus.FINISHED) {
            return { success: false, message: 'POTM voting is only available after 70 minutes' };
        }

        // Check if player is in the fixture
        const playerInFixture = [
            ...fixture.lineups.home.startingXI,
            ...fixture.lineups.home.substitutes,
            ...fixture.lineups.away.startingXI,
            ...fixture.lineups.away.substitutes
        ].some(p => p.player.toString() === playerId);

        if (!playerInFixture) {
            return { success: false, message: 'Player is not part of this fixture' };
        }

        // Check if user already voted
        const existingVoteIndex = fixture.playerOfTheMatch.userVotes.findIndex(
            v => v.userId.toString() === userId.toString()
        );

        if (existingVoteIndex >= 0) {
            // Update existing vote
            fixture.playerOfTheMatch.userVotes[existingVoteIndex].playerId = playerId as unknown as ObjectId;
            fixture.playerOfTheMatch.userVotes[existingVoteIndex].timestamp = new Date();
        } else {
            // Add new vote
            fixture.playerOfTheMatch.userVotes.push({
                userId: userId as unknown as ObjectId,
                playerId: playerId as unknown as ObjectId,
                timestamp: new Date()
            });
        }

        // Update fan votes count
        const fanVoteIndex = fixture.playerOfTheMatch.fanVotes.findIndex(
            v => v.player.toString() === playerId
        );

        if (fanVoteIndex >= 0) {
            fixture.playerOfTheMatch.fanVotes[fanVoteIndex].votes += 1;
        } else {
            fixture.playerOfTheMatch.fanVotes.push({
                player: playerId as unknown as ObjectId,
                votes: 1
            });
        }

        await fixture.save();

        // Emit update via socket
        const socketService = getSocketService();
        await socketService.emitPlayerOfTheMatchUpdate(fixtureId);

        return {
            success: true,
            message: 'POTM vote submitted',
            data: fixture.playerOfTheMatch
        };
    } catch (err) {
        console.error('Error submitting POTM vote:', err);
        throw err;
    }
};
const handleTeamCheer = async (
    { fixtureId }: { fixtureId: string },
    { team, isOfficial }: { team: TeamType, isOfficial: boolean },
    { userId, auditInfo }: { userId?: ObjectId, auditInfo?: AuditInfo }
) => {
    try {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId)
            .select('cheerMeter');
        
        if (!fixture) {
            return { success: false, message: 'Fixture not found' };
        }

        // Update cheer counts
        if (isOfficial && userId) {
            fixture.cheerMeter.userVotes.push({
                userId,
                team,
                isOfficial,
                timestamp: new Date()
            });

            fixture.cheerMeter.official[team] += 1;
        } else {
            fixture.cheerMeter.unofficial[team] += 1;
        }

        await fixture.save();

        // Emit update via socket
        const socketService = getSocketService();
        await socketService.emitCheerUpdate(fixtureId);

        return {
            success: true,
            message: 'Cheer recorded',
            data: fixture.cheerMeter
        };
    } catch (err) {
        console.error('Error handling team cheer:', err);
        throw err;
    }
};
// END OF USER UPDATES //

const liveFixtureService = {
    // Creation and End //
    initializeLiveFixture,

    // Get Requests //
    getAllLiveFixtures,
    getLiveFixtureById,
    getLiveFixtureTeamPlayers,

    // Updates //
    updateLiveFixtureStatus,
    updateLiveFixtureStatistics,
    updateLiveFixtureLineup,
    createTimeLineEvent,
    editTimelineEvent,
    deleteTimelineEvent,
    addSubstitution,
    updateSubstitution,
    removeSubstitution,

    updateFixtureScore,
    addGoalScorer,
    removeGoalScorer,

    updateOfficialPOTM,
    updateOfficialPlayerRatings,

    generalUpdates,
    updateTime,

    // User updates //
    submitUserPlayerRating,
    submitUserPOTMVote,
    handleTeamCheer,
}

export default liveFixtureService;