import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { CompetitionSponsors, CompetitionStatus, CompetitionTeamForm, CompetitionTypes } from '../../types/competition.enums';
import { AuditInfo } from '../../types/express';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';
import { UserRole } from '../../types/user.enums';
import { FixtureResult, FixtureStat, FixtureStatus } from '../../types/fixture.enums';
import { IGroupTable, ILeagueStandings } from '../../models/football/Competition';

type RegisterCometition = {
    name: string;
    shorthand: string;
    type: CompetitionTypes; 
    season: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline?: Date;
    description: string;
}
const createCompetition = async (
    { name, shorthand, type, season, startDate, endDate, registrationDeadline, description }:
    RegisterCometition,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate type
        if( !type || !Object.values( CompetitionTypes ).includes( type ) ) return { success: false, message: 'Invalid Type' };

        // Create Competition
        const createdCompetition = new db.V2FootballCompetition({
            name, shorthand, type, season, startDate, endDate, registrationDeadline, description
        });
        createdCompetition.currentStage = 'registration-phase';
        await createdCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballCompetition',
            entityId: createdCompetition._id,
            message: `${ createdCompetition.name } Created By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: createdCompetition.toObject()
        });

        // Return success
        return { success: true, message: 'Competition Created', data: createdCompetition };
    } catch ( err ) {
        console.error('Error Creating Competition', err);
        throw new Error('Error Creating Competiton')
    }
}

const cloneCompetitionForNewSeason = async (
    { competitionId }: { competitionId: string },
    { name, season, startDate, endDate }: { name: string, season: string, startDate: Date, endDate: Date },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Create new competition
        const newCompetition = new db.V2FootballCompetition({ name, season, startDate, endDate });
        newCompetition.shorthand = foundCompetition.shorthand;
        newCompetition.type = foundCompetition.type;
        newCompetition.description = foundCompetition.description;
        newCompetition.format = foundCompetition.format;
        newCompetition.rules = foundCompetition.rules;
        newCompetition.extraRules = foundCompetition.extraRules;
        await newCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballCompetition',
            entityId: newCompetition._id,
            message: `${ newCompetition.name } Created By ${ userId }(cloned from ${ foundCompetition._id })`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: newCompetition.toObject()
        });

        // Return success
        return { success: true, message: 'Competition Cloned', data: newCompetition.toObject() }
    } catch ( err ) {
        console.error('Error Cloning Competition', err);
        throw new Error('Error Cloning Competition');
    }
}

const deleteCompetition = async (
    { competitionId }: { competitionId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Delete competition
        await db.V2FootballCompetition.findByIdAndDelete( competitionId );

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } Deleted By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.toObject()
        });

        // Return success
        return { success: true, message: 'Competition Deleted', data: null };
    } catch ( err ) {
        console.error('An Error Occured Deleting a Competition', err);
        throw new Error('Error Performing Deletion')
    }
}
type CompetitionsFilter = {
    status?: CompetitionStatus,
    type?: CompetitionTypes,
    isFeatured?: boolean
}
const getAllCompetitions = async (
    { status, limit = 10, page = 1, type, isFeatured }:
    { status: CompetitionStatus, limit: number, page: number, type: CompetitionTypes, isFeatured: boolean }
) => {
    try {
        // Define filters
        const skip = (page - 1) * limit;
        const filter: CompetitionsFilter = {};
        
        if (status) filter.status = status;
        if (type) filter.type = type;
        if ( isFeatured ) filter.isFeatured = isFeatured;
        
        // Get data
        const [totalCompetitions, competitions] = await Promise.all([
            db.V2FootballCompetition.countDocuments(filter),
            db.V2FootballCompetition.find(filter)
                .select('-admin')
                .skip(skip)
                .limit(limit)
                .lean()
        ]);
        
        // Return success
        return { 
            success: true, 
            message: 'All Competitions Acquired', 
            data: {
                competitions,
                pagination: {
                    total: totalCompetitions,
                    page,
                    limit,
                    pages: Math.ceil(totalCompetitions / limit),
                }
            }
        };
    } catch ( err ) {
        console.error('Competition Fetch Error', err);
        throw new Error('Error Fetching Competition')
    }
}

const getCompetitionById = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'teams.team',
                    select: 'name shorthand'
                },
                {
                    path: 'teams.squad.player',
                    select: 'name'
                },
                {
                    path: 'awards.player.winner.player',
                    select: 'name'
                },
                {
                    path: 'awards.player.winner.team awards.team.winner',
                    select: 'name shorthand logo'
                },
            ]);
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'Competition Acquired', data: foundCompetition.toObject() }
    } catch ( err ) {
        console.error('Error Fetching Single Competition', err);
        throw new Error('Error Fetching Competition')
    }
}

const getCompetitiionLeagueTable = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'leagueTable.team',
                    select: 'name shorthand academicYear type logo'
                }
            ]);
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'League Table Acquired', data: foundCompetition.leagueTable }
    } catch ( err ) {
        console.error('Error Fetching League Table Data', err);
        throw new Error('Error Fetching League Table Data')
    }
}

const getCompetitiionKnockoutRounds = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'knockoutRounds.fixtures',
                    select: 'homeTeam awayTeam stadium scheduledDate status result rescheduledDate postponedReason',
                    populate: {
                        path: 'homeTeam awayTeam',
                        select: 'name shorthand logo'
                    }
                }
            ]);
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'Knockout Rounds Acquired', data: foundCompetition.knockoutRounds }
    } catch ( err ) {
        console.error('Error Fetching Competition Knockout Rounds', err);
        throw new Error('Error Fetching Knockout Rounds')
    }
}

const getCompetitiionGroups = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'groupStage.standings.team',
                    select: 'name shorthand academicYear type logo'
                },
                {
                    path: 'groupStage.fixtures',
                    select: 'homeTeam awayTeam stadium scheduledDate status result rescheduledDate postponedReason',
                    populate: {
                        path: 'homeTeam awayTeam',
                        select: 'name shorthand'
                    }
                },
            ])
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'Group Stage Acquired', data: foundCompetition.groupStage };
    } catch ( err ) {
        console.error('Error Fetching Competition Groups', err);
        throw new Error('Error Fetching Competition Groups')
    }
}

const getCompetitiionTeamsAndSquadList = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'teams.team',
                    select: 'name shorthand logo'
                },
                {
                    path: 'teams.squad.player',
                    select: 'name'
                },
            ])
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'Competition Teams Acquired', data: foundCompetition.teams }
    } catch ( err ) {
        console.error('Error Fetching Competition Teams', err);
        throw new Error('Error Fetching Competition Teams')
    }
}

type CompetitionFixtureFilter = {
    competition: string;
    date?: {
        $gte?: Date,
        $lte?: Date
    }
}
const getCompetitiionFixtures = async (
    { competitionId }: { competitionId: string },
    { limit = 10, page = 1, fromDate, toDate }: { limit: number, page: number, fromDate: Date, toDate: Date }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Define filters
        const skip = (page - 1) * limit;
        const filter: CompetitionFixtureFilter = { competition: competitionId };
        
        if (fromDate || toDate) {
            filter.date = {};
            if (fromDate) filter.date.$gte = new Date(fromDate);
            if (toDate) filter.date.$lte = new Date(toDate);
        }
    
        // Get Data
        const [totalFixtures, fixtures] = await Promise.all([
            db.V2FootballFixture.countDocuments(filter),
            db.V2FootballFixture.find(filter)
                .populate('homeTeam awayTeam', 'name shorthand logo')
                .sort({ date: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);
        
        return {
            success: true,
            message: 'Competition Fixtures Acquired',
            data: {
                fixtures,
                pagination: {
                    total: totalFixtures,
                    page,
                    limit,
                    pages: Math.ceil(totalFixtures / limit),
                }
            }
        };
    } catch ( err ) {
        console.error('Error Fetching Competition Fixtures', err);
        throw new Error('Error Fetching Competition Fixtures')
    }
}

const getCompetitiionStats = async (
    { competitionId }: { competitionId: string }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId )
            .populate([
                {
                    path: 'stats.topScorers.player',
                    select: 'name department admissionYear'
                },
                {
                    path: 'stats.topScorers.team',
                    select: 'name shorthand logo'
                },
                {
                    path: 'stats.topAssists.player',
                    select: 'name department admissionYear'
                },
                {
                    path: 'stats.topAssists.team',
                    select: 'name shorthand logo'
                },
                {
                    path: 'stats.bestDefenses.team',
                    select: 'name shorthand logo'
                },
            ]);
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Return success
        return { success: true, message: 'Competition Stats Acquired', data: foundCompetition.stats }
    } catch ( err ) {
        console.error('Error Fetching Competition Stats', err);
        throw new Error('Error Fetching Competition Stats')
    }
}

const updateCompetitionStatus = async (
    { competitionId }: { competitionId: string },
    { status }: { status: CompetitionStatus },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate Status
        if( !status || !Object.values( CompetitionStatus ).includes( status ) ) return { success: false, message: 'Invalid Status' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Update status 
        foundCompetition.status = status;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } Status Set As ${ status }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.toObject()
        });

        // Return success
        return { success: true, message: 'Competition Status Updated', data: foundCompetition.status };
    } catch ( err ) {
        console.error('Error Updating competition Status: ', err);
        throw new Error('Error Performing Updates')
    }
}

type CompetitionInfo = {
    name?: string;
    shorthand?: string;
    season?: string;
    startDate?: Date;
    endDate?: Date;
    prizeMoney?: {
        champion: number,
        runnerUp: number,
    };
    substitutions?: {
        allowed: boolean;
        maximum: number;
    },
    extraTime?: boolean;
    penalties?: boolean;
    matchDuration?: {
        normal: number;
        extraTime: number;
    },
    squadSize?: {
        min: number;
        max: number;
    },
}
const updateCompetitionInfo = async (
    { competitionId }: { competitionId: string },
    { name, shorthand, season, startDate, endDate, prizeMoney, substitutions, extraTime, penalties, matchDuration, squadSize }: CompetitionInfo,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
        if( foundCompetition.status !== CompetitionStatus.UPCOMING ) return { success: false, message: 'Can Only Edit Upcoming Competitions' };

        // Get old values
        const oldCompetition = await db.V2FootballCompetition.findById( competitionId );

        // Perform Edits
        if( name ) foundCompetition.name = name;
        if( shorthand ) foundCompetition.shorthand = shorthand;
        if( season ) foundCompetition.season = season;
        if( startDate ) foundCompetition.startDate = startDate;
        if( endDate ) foundCompetition.endDate = endDate;
        if( prizeMoney ) foundCompetition.prizeMoney = prizeMoney;
        if( substitutions ) foundCompetition.rules.substitutions = substitutions;
        if( extraTime ) foundCompetition.rules.extraTime = extraTime;
        if( penalties ) foundCompetition.rules.penalties = penalties;
        if( matchDuration ) foundCompetition.rules.matchDuration = matchDuration;
        if( squadSize ) foundCompetition.rules.squadSize = squadSize;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } Info Updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldCompetition!.toObject(),
            newValues: foundCompetition.toObject(),
        });

        // Return success
        return { success: true, message: 'Competition Info Updated', data: foundCompetition.toObject() };
    } catch ( err ) {
        console.error('Error Updating Competition Info', err);
        throw new Error('Error Performing Updates')
    }
}

const registerCompetitionTeam = async (
    { competitionId }: { competitionId: string },
    { teamId }: { teamId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
        if( foundCompetition.status !== CompetitionStatus.UPCOMING ) return { success: false, message: 'Can Only Edit Upcoming Competitions' };

        // Get old values
        const oldCompetition = await db.V2FootballCompetition.findById( competitionId );

        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Ensure team aint in competition yet
        const teamInComp = foundCompetition.teams.some( team => team.team.toString() === teamId.toString() );
        if( teamInComp ) return { success: false, message: 'Team Already Registered' };

        // Add team to comp
        foundCompetition.teams.push({
            team: teamId as unknown as ObjectId,
            squad: []
        });
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundTeam.name } Added To ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldCompetition!.teams,
            newValues: foundCompetition.teams,
        });

        // Return success
        return { success: true, message: 'Team Added', data: foundCompetition.teams };
    } catch ( err ) {
        console.error('Error Adding Team To Competition', err);
        throw new Error('Error Performing Updates')
    }
}

const unregisterCompetitionTeam = async (
    { competitionId }: { competitionId: string },
    { teamId }: { teamId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
        if( foundCompetition.status !== CompetitionStatus.UPCOMING ) return { success: false, message: 'Can Only Edit Upcoming Competitions' };

        // Get old values
        const oldCompetition = await db.V2FootballCompetition.findById( competitionId );

        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Ensure team is in competition
        const teamInComp = foundCompetition.teams.some( team => team.team.toString() === teamId.toString() );
        if( !teamInComp ) return { success: false, message: 'Team Not Registered' };

        // Remove team
        const newTeams = foundCompetition.teams.filter( team => team.team.toString() !== teamId.toString() );
        foundCompetition.teams = newTeams;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundTeam.name } Removed From ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldCompetition!.teams,
            newValues: foundCompetition.teams,
        });

        // Return success
        return { success: true, message: 'Team Removed', data: foundCompetition.teams };
    } catch ( err ) {
        console.error('Error Removing Team From Competition', err);
        throw new Error('Error Performing Updates')
    }
}

type SquadList = {
    player: ObjectId,
    jerseyNumber: number,
    isCaptain: boolean,
    position: string
}[];
const registerCompetitionTeamSquad = async (
    { competitionId }: { competitionId: string },
    { teamId, squadList }: { teamId: string, squadList: SquadList },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
        if( foundCompetition.status !== CompetitionStatus.UPCOMING ) return { success: false, message: 'Can Only Edit Upcoming Competitions' };

        // Get old values
        const oldCompetition = await db.V2FootballCompetition.findById( competitionId );

        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Ensure team is in competition
        const teamInComp = foundCompetition.teams.some( team => team.team.toString() === teamId.toString() );
        if( !teamInComp ) return { success: false, message: 'Team Not Registered' };

        // Validate size of squad
        if( !squadList ) return { success: false, message: 'SquadList Required' };
        if( squadList.length < foundCompetition.rules.squadSize.min || squadList.length > foundCompetition.rules.squadSize.max ) return { success: false, message: 'Invalid Squad Size' };
        
        // Update team squad list
        const updatedList = foundCompetition.teams.map( team => {
            if( team.team.toString() === teamId.toString() ) {
                return {
                    ...team,
                    sqaud: squadList
                }
            } else {
                return { ...team }
            }
        });
        foundCompetition.teams = updatedList;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundTeam.name } Squad List Added To ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldCompetition!.teams,
            newValues: foundCompetition.teams,
        });

        // Return success
        return { success: true, message: 'Team Squad List Added', data: foundCompetition.teams };
    } catch ( err ) {
        console.error('Error Registering Squad List For Competition', err);
        throw new Error('Error Performing Updates')
    }
}

type FixtureData = {
    homeTeam: string;
    awayTeam: string;
    stadium: string;
    scheduledDate: Date;
    referee: string;
    isDerby?: boolean;
    isKnockoutRound?: boolean;
    isGroupFixture?: boolean;
    knockoutId?: string;
    groupId?: string;
}
const createCompetitionFixture = async (
    { competitionId }: { competitionId: string },
    { homeTeam, awayTeam, stadium, scheduledDate, referee, knockoutId, groupId, isDerby, isKnockoutRound, isGroupFixture }: FixtureData,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Ensure required fields are passed
        if( !homeTeam || !awayTeam || !stadium || !scheduledDate || !referee ) return { success: false, message: 'Missing Required Fields' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Validate both teams and check if both teams are in competition
        const foundHomeTeam = await db.V2FootballTeam.findById( homeTeam );
        const foundAwayTeam = await db.V2FootballTeam.findById( awayTeam );
        const homeTeamInComp = foundCompetition.teams.some( team => team.team.toString() === homeTeam.toString() );
        const awayTeamInComp = foundCompetition.teams.some( team => team.team.toString() === awayTeam.toString() );
        if( !foundHomeTeam || !foundAwayTeam ) return { success: false, message: 'Invalid Home/Away Team' };
        if( !homeTeamInComp || !awayTeamInComp ) return { success: false, message: 'Home/Away Team Not In Competition' };

        // Create fixture
        const createdFixture = new db.V2FootballFixture({ 
            homeTeam, awayTeam, stadium, scheduledDate, referee,
            competition: foundCompetition._id,
            matchType: 'competition',

        })
        if( isDerby ) createdFixture.isDerby = isDerby;
        await createdFixture.save();

        // Check if group or knockout and add respectively
        if( isKnockoutRound && knockoutId ) {
            const updatedRounds = foundCompetition.knockoutRounds.map( round => {
                if( round._id!.toString() === knockoutId.toString() ) {
                    round.fixtures.push( createdFixture._id );
                    return round;
                } else {
                    return round;
                }
            });
            foundCompetition.knockoutRounds = updatedRounds;
        } else if( isGroupFixture && groupId ) {
            const updatedGroups = foundCompetition.groupStage.map( group => {
                if( group._id!.toString() === groupId.toString() ) {
                    group.fixtures.push( createdFixture._id );
                    return group;
                } else {
                    return group;
                }
            });
            foundCompetition.groupStage = updatedGroups;
        };
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballFixture',
            entityId: createdFixture._id,
            message: `${ homeTeam } vs ${ awayTeam } Created In ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: createdFixture.toObject()
        });

        // Return success
        return { success: true, message: 'Competition Status Updated', data: createdFixture.toObject() };
    } catch ( err ) {
        console.error('Error Creating Competition Fixture', err);
        throw new Error('Error Creating Fixture')
    }
}

type UpdateFixtureData = {
    fixtureId: string;
    scheduledDate?: Date;
    status?: FixtureStatus;
    postponedReason?: string;
    rescheduledDate?: Date;
}
const updateCompetitionFixture = async (
    { competitionId }: { competitionId: string },
    { fixtureId, scheduledDate, status, postponedReason, rescheduledDate }: UpdateFixtureData,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check if fixture exists
        const foundFixture = await db.V2FootballFixture.findOne({ _id: fixtureId, competition: competitionId });
        if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };
        if( foundFixture.status === FixtureStatus.COMPLETED ) return { success: false, message: 'Fixture Already Completed' };

        // Update fixture
        if( scheduledDate ) foundFixture.scheduledDate = scheduledDate;
        if( postponedReason ) foundFixture.postponedReason = postponedReason;
        if( status ) foundFixture.status = status;
        if( rescheduledDate ) foundFixture.rescheduledDate = rescheduledDate;
        await foundFixture.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballFixture',
            entityId: foundFixture._id,
            message: `${ foundCompetition.name } Fixture Updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: foundFixture.toObject()
        });

        // Return success
        return { success: true, message: 'Fixture Updated', data: foundFixture.toObject() };
    } catch ( err ) {
        console.error('Error Updating Fixture', err);
        throw new Error('Error Performing Updates')
    }
}

type FixtureResultUpdate = {
    fixtureId: string;
    result: FixtureResult;
    statistics?: {
        home: FixtureStat,
        away: FixtureStat
    };
    
}
const updateCompetitionFixtureResult = async (
    { competitionId }: { competitionId: string },
    { fixtureId, result, statistics }: FixtureResultUpdate,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check if fixture exists
        const foundFixture = await db.V2FootballFixture.findOne({ _id: fixtureId, competition: competitionId });
        if( !foundFixture ) return { success: false, message: 'Invalid Fixture' };
        if( foundFixture.status === FixtureStatus.COMPLETED ) return { success: false, message: 'Fixture Already Completed' };

        // Update fixture
        foundFixture.status = FixtureStatus.COMPLETED;
        foundFixture.result = result;
        if( statistics ) foundFixture.statistics = statistics;
        await foundFixture.save();

        // Update competition stats


        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballFixture',
            entityId: foundFixture._id,
            message: `${ foundCompetition.name } fixture result updates`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: foundFixture.toObject()
        });

        // Return success
        return { success: true, message: 'Fixture Result Updated', data: foundFixture.toObject() };
    } catch ( err ) {
        console.error('Error Updating Fixture', err);
        throw new Error('Error Performing Updates')
    }
}

const createCompetitionLeagueTable = async (
    { competitionId }: { competitionId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists and is upcoming
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }
        
        if (foundCompetition.status !== CompetitionStatus.UPCOMING) {
            return { 
                success: false, 
                message: 'League table can only be created for upcoming competitions' 
            };
        }

        // Validate all teams are registered in the competition
        const competitionTeams = foundCompetition.teams.map(t => t.team);

        // Check if league table already exists
        if (foundCompetition.leagueTable && foundCompetition.leagueTable.length > 0) {
            return { 
                success: false, 
                message: 'League table already exists for this competition' 
            };
        }

        // Create league standings
        const standings: ILeagueStandings[] = competitionTeams.map((teamId, index) => ({
            team: teamId,
            played: 0,
            points: 0,
            disciplinaryPoints: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            form: [],
            position: index + 1
        }));

        // Set league table
        foundCompetition.leagueTable = standings;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Created league table for ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: { standings }
        });

        return { 
            success: true, 
            message: 'League table created successfully', 
            data: standings 
        };
    } catch (err) {
        console.error('Error Creating League Table', err);
        throw new Error('Error Creating League Table');
    }
}

type CreateGroupInput = {
    name: string;
    teamIds: string[];
    qualificationRules?: {
        position: number;
        destination: 'knockout' | 'playoffs' | 'eliminated';
        knockoutRound?: string;
        isBestLoserCandidate?: boolean;
    }[];
};
const createCompetitionGroup = async (
    { competitionId }: { competitionId: string },
    { name, teamIds, qualificationRules }: CreateGroupInput,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists and is upcoming
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }
        
        if (foundCompetition.status !== CompetitionStatus.UPCOMING) {
            return { 
                success: false, 
                message: 'Groups can only be created for upcoming competitions' 
            };
        }

        // Validate all teams are registered in the competition
        const competitionTeams = foundCompetition.teams.map(t => t.team.toString());
        const invalidTeams = teamIds.filter(teamId => !competitionTeams.includes(teamId));
        
        if (invalidTeams.length > 0) {
            return { 
                success: false, 
                message: `The following teams are not registered in the competition: ${invalidTeams.join(', ')}` 
            };
        }

        // Check if group name is unique
        const existingGroup = foundCompetition.groupStage?.find(g => g.name === name);
        if (existingGroup) {
            return { 
                success: false, 
                message: `Group with name "${name}" already exists` 
            };
        }

        // Create group standings
        const standings: ILeagueStandings[] = teamIds.map((teamId, index) => ({
            team: teamId as unknown as  ObjectId,
            played: 0,
            points: 0,
            disciplinaryPoints: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            form: [],
            position: index + 1
        }));

        // Create new group
        const newGroup: IGroupTable = {
            name,
            standings,
            fixtures: [],
            qualificationRules: qualificationRules || [],
            qualifiedTeams: []
        };

        // Add group to competition
        if (!foundCompetition.groupStage) {
            foundCompetition.groupStage = [];
        }
        
        foundCompetition.groupStage.push(newGroup);
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Created group "${name}" in ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: { group: newGroup }
        });

        return { 
            success: true, 
            message: 'Group created successfully', 
            data: newGroup 
        };
    } catch (err) {
        console.error('Error Creating Group', err);
        throw new Error('Error Creating Group');
    }
}

const createCompetitionKnockoutRound = async (
    { competitionId }: { competitionId: string; },
    { name }: { name: string; },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists and is upcoming
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }
        const previousValues = [...foundCompetition.knockoutRounds];

        // Validate competition type
        if (foundCompetition.type === CompetitionTypes.LEAGUE) {
            return { success: false, message: 'Cannot add knockout phases to league competition' };
        }

        // Check if round name already exists
        if (foundCompetition.knockoutRounds.some(r => r.name === name)) {
            throw new Error('Round with this name already exists');
        }

        // Add new round
        const newRound = {
            name,
            fixtures: [],
            completed: false
        };

        foundCompetition.knockoutRounds.push(newRound);
        await foundCompetition.save();
                
        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Created league table for ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues,
            newValues: foundCompetition.knockoutRounds
        });

    } catch (err) {
        console.error('Error Creating Knockout Bracket', err);
        throw new Error('Error Creating Knockout Bracket');
    }
}

const deleteCompetitionGroup = async (
    { competitionId, groupName }: { competitionId: string; groupName: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists and is upcoming
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }
        
        if (foundCompetition.status !== CompetitionStatus.UPCOMING) {
            return { 
                success: false, 
                message: 'Groups can only be deleted from upcoming competitions' 
            };
        }

        // Find group index
        const groupIndex = foundCompetition.groupStage?.findIndex(g => g.name === groupName) ?? -1;
        if (groupIndex === -1) {
            return { 
                success: false, 
                message: `Group "${groupName}" not found` 
            };
        }

        // Get fixtures in this group
        const groupFixtures = foundCompetition.groupStage[groupIndex].fixtures || [];
        
        // Delete all fixtures in this group that haven't been played
        await db.V2FootballFixture.deleteMany({
            _id: { $in: groupFixtures },
            status: { $ne: FixtureStatus.COMPLETED }
        });

        // Remove group from competition
        foundCompetition.groupStage?.splice(groupIndex, 1);
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Deleted group "${groupName}" from ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: { groupName }
        });

        return { 
            success: true, 
            message: 'Group deleted successfully' 
        };
    } catch (err) {
        console.error('Error Deleting Group', err);
        throw new Error('Error Deleting Group');
    }
}

const deleteCompetitionKnockoutRound = async (
    { competitionId, roundName }: { competitionId: string; roundName: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists and is upcoming
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }
        
        if (foundCompetition.status !== CompetitionStatus.UPCOMING) {
            return { 
                success: false, 
                message: 'Knockout rounds can only be deleted from upcoming competitions' 
            };
        }

        // Find round index
        const roundIndex = foundCompetition.knockoutRounds?.findIndex(r => r.name === roundName) ?? -1;
        if (roundIndex === -1) {
            return { 
                success: false, 
                message: `Knockout round "${roundName}" not found` 
            };
        }

        // Get fixtures in this round
        const roundFixtures = foundCompetition.knockoutRounds[roundIndex].fixtures || [];
        
        // Delete all fixtures in this round that haven't been played
        await db.V2FootballFixture.deleteMany({
            _id: { $in: roundFixtures },
            status: { $ne: FixtureStatus.COMPLETED }
        });

        // Remove round from competition
        foundCompetition.knockoutRounds?.splice(roundIndex, 1);
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Deleted knockout round "${roundName}" from ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: { roundName }
        });
        
        return { 
            success: true, 
            message: 'Knockout round deleted successfully' 
        };
    } catch (err) {
        console.error('Error Deleting Knockout Round', err);
        throw new Error('Error Deleting Knockout Round');
    }
}

type UpdateTeamStandingsInput = {
    teamId: string;
    isGroup?: boolean; // Flag to indicate if updating group standings
    groupId?: string;  // Required if isGroup is true
    played?: number;
    points?: number;
    disciplinaryPoints?: number;
    wins?: number;
    losses?: number;
    draws?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    form?: CompetitionTeamForm[];
}

const updateCompetitionTeamStandings = async (
    { competitionId }: { competitionId: string },
    { teamId, isGroup = false, groupId, ...updates }: UpdateTeamStandingsInput,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }

        // Check if team is registered in competition
        const teamInCompetition = foundCompetition.teams.some(t => t.team.toString() === teamId);
        if (!teamInCompetition) {
            return { 
                success: false, 
                message: 'Team is not registered in this competition' 
            };
        }

        let teamStanding: ILeagueStandings | undefined;
        let standingsArray: ILeagueStandings[] | undefined;
        let groupName = '';

        if (isGroup) {
            // Validate groupId is provided for group updates
            if (!groupId) {
                return {
                    success: false,
                    message: 'groupId is required when updating group standings'
                };
            }

            // Find the group
            const group = foundCompetition.groupStage?.find(g => g._id!.toString() === groupId);
            if (!group) {
                return {
                    success: false,
                    message: 'Group not found in competition'
                };
            }

            groupName = group.name;
            standingsArray = group.standings;
            teamStanding = group.standings.find(t => t.team.toString() === teamId);
        } else {
            // League table update
            standingsArray = foundCompetition.leagueTable;
            teamStanding = foundCompetition.leagueTable?.find(t => t.team.toString() === teamId);
        }

        if (!teamStanding || !standingsArray) {
            return { 
                success: false, 
                message: `Team not found in ${isGroup ? 'group standings' : 'league table'}` 
            };
        }

        // Save old values for audit log
        const oldValues = { ...teamStanding };

        // Update standings
        if (updates.played !== undefined) teamStanding.played = updates.played;
        if (updates.points !== undefined) teamStanding.points = updates.points;
        if (updates.disciplinaryPoints !== undefined) teamStanding.disciplinaryPoints = updates.disciplinaryPoints;
        if (updates.wins !== undefined) teamStanding.wins = updates.wins;
        if (updates.losses !== undefined) teamStanding.losses = updates.losses;
        if (updates.draws !== undefined) teamStanding.draws = updates.draws;
        if (updates.goalsFor !== undefined) teamStanding.goalsFor = updates.goalsFor;
        if (updates.goalsAgainst !== undefined) teamStanding.goalsAgainst = updates.goalsAgainst;
        
        // Calculate goal difference
        if (updates.goalsFor !== undefined || updates.goalsAgainst !== undefined) {
            teamStanding.goalDifference = teamStanding.goalsFor - teamStanding.goalsAgainst;
        }
        
        // Update form
        if (updates.form !== undefined) {
            teamStanding.form = updates.form;
        }

        // Sort the standings after updates
        standingsArray.sort((a, b) => {
            // Sort by points descending
            if (b.points !== a.points) return b.points - a.points;
            
            // If points are equal, sort by goal difference descending
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            
            // If goal difference is equal, sort by goals for descending
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            
            // If all else is equal, sort by disciplinary points ascending
            return a.disciplinaryPoints - b.disciplinaryPoints;
        });

        // Update positions
        standingsArray.forEach((standing, index) => {
            standing.position = index + 1;
        });

        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: isGroup ? 'V2FootballCompetitionGroupStandings' : 'V2FootballCompetitionLeagueStandings',
            entityId: foundCompetition._id,
            message: `Updated ${isGroup ? 'group' : 'league'} standings for team ${teamId} in ${isGroup ? groupName + ' group of ' : ''}${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldValues,
            newValues: teamStanding
        });

        return { 
            success: true, 
            message: `Team standings updated successfully in ${isGroup ? 'group' : 'league'}`,
            data: {
                ...teamStanding,
                context: isGroup ? { 
                    isGroup: true,
                    groupId,
                    groupName 
                } : { 
                    isGroup: false 
                }
            }
        };
    } catch (err) {
        console.error('Error Updating Team Standings', err);
        throw new Error('Error Updating Team Standings');
    }
}

type UpdateCompetitionRulesInput = {
    substitutions?: {
        allowed?: boolean;
        maximum?: number;
    };
    extraTime?: boolean;
    penalties?: boolean;
    matchDuration?: {
        normal?: number;
        extraTime?: number;
    };
    squadSize?: {
        min?: number;
        max?: number;
    };
}
const updateCompetitionRules = async (
    { competitionId }: { competitionId: string },
    { substitutions, squadSize, matchDuration, penalties, extraTime }: UpdateCompetitionRulesInput,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById(competitionId);
        if (!foundCompetition) {
            return { success: false, message: 'Invalid Competition' };
        }

        // Save old values for audit log
        const oldValues = { rules: foundCompetition.rules };

        // Update rules
        if (substitutions) {
            if (substitutions.allowed !== undefined) {
                foundCompetition.rules.substitutions.allowed = substitutions.allowed;
            }
            if (substitutions.maximum !== undefined) {
                foundCompetition.rules.substitutions.maximum = substitutions.maximum;
            }
        }

        if (extraTime !== undefined) {
            foundCompetition.rules.extraTime = extraTime;
        }

        if (penalties !== undefined) {
            foundCompetition.rules.penalties = penalties;
        }

        if (matchDuration) {
            if (matchDuration.normal !== undefined) {
                foundCompetition.rules.matchDuration.normal = matchDuration.normal;
            }
            if (matchDuration.extraTime !== undefined) {
                foundCompetition.rules.matchDuration.extraTime = matchDuration.extraTime;
            }
        }

        if (squadSize) {
            if (squadSize.min !== undefined) {
                foundCompetition.rules.squadSize.min = squadSize.min;
            }
            if (squadSize.max !== undefined) {
                foundCompetition.rules.squadSize.max = squadSize.max;
            }
        }

        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetitionRules',
            entityId: foundCompetition._id,
            message: `Updated rules for ${foundCompetition.name}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldValues,
            newValues: { rules: foundCompetition.rules }
        });

        return { 
            success: true, 
            message: 'Competition rules updated successfully', 
            data: foundCompetition.rules, 
        };
    } catch (err) {
        console.error('Error Updating Competition Rules', err);
        throw new Error('Error Updating Competition Rules');
    }
}

type CompetitionFormatInput = {
    groupStage?: {
        numberOfGroups: number,
        teamsPerGroup: number,
        advancingPerGroup: number
    },
    knockoutStage?: {
        hasTwoLegs: boolean,
        awayGoalsRule: boolean,
    },
    leagueStage?: {
        matchesPerTeam: number,
        pointsSystem: {
            win: number
            draw: number
            loss: number
        }
    }
}
const updateCompetitionFormat = async (
    { competitionId }: { competitionId: string },
    { groupStage, knockoutStage, leagueStage }: CompetitionFormatInput,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };
        const oldCompetition = await db.V2FootballCompetition.findById( competitionId );

        // Update format
        if( foundCompetition.type === CompetitionTypes.LEAGUE && leagueStage ) {
            foundCompetition.format.leagueStage = leagueStage;
        } else if ( foundCompetition.type === CompetitionTypes.KNOCKOUT && knockoutStage ) {
            foundCompetition.format.knockoutStage = knockoutStage;
        } else if( foundCompetition.type === CompetitionTypes.HYBRID ) {
            if( knockoutStage ) foundCompetition.format.knockoutStage = knockoutStage;
            if( groupStage ) foundCompetition.format.groupStage = groupStage;
        }
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } format updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldCompetition!.format,
            newValues: foundCompetition.format,
        });

        // Return success
        return { success: true, message: 'Competition Format Updated', data: foundCompetition.format };
    } catch ( err ) {
        console.error('Error Updating Competition Format', err);
        throw new Error('Error Performing Updates')
    }
}

const addCompetitionAdditionalRule = async (
    { competitionId }: { competitionId: string },
    { title, description }: { title: string, description: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Create new rule
        foundCompetition.extraRules.push({
            title, description,
            lastUpdated: new Date()
        });
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Rule Added To ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.extraRules.pop(),
            newValues: foundCompetition.extraRules,
        });

        // Return success
        return { success: true, message: 'Rule Added', data: foundCompetition.extraRules };
    } catch ( err ) {
        console.error('Error Adding Extra Rule To Competition', err);
        throw new Error('Error Performing Updates')
    }
}

const removeCompetitionAdditionalRule = async (
    { competitionId }: { competitionId: string },
    { title, lastUpdated }: { title: string, lastUpdated: Date },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check if rule in competition
        const ruleInComp = foundCompetition.extraRules.some( rule => (rule.title === title) && (rule.lastUpdated === lastUpdated) );
        if( !ruleInComp ) return { success: false, message: 'Invalid Rule' };

        // Remove rule from competition
        const updatedRules = foundCompetition.extraRules.filter( rule => (rule.title === title) && (rule.lastUpdated === lastUpdated) );
        foundCompetition.extraRules = updatedRules;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Rule removed from ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: foundCompetition.extraRules,
        });

        // Return success
        return { success: true, message: 'Rule Removed', data: foundCompetition.extraRules };
    } catch ( err ) {
        console.error('Error Removing Rule From Competition', err);
        throw new Error('Error Performing Updates')
    }
}

const addCompetitionSponsor = async (
    { competitionId }: { competitionId: string },
    { name, logo, tier }: { name: string, logo?: string, tier: CompetitionSponsors },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate fields
        if( !name || !tier || !Object.values( CompetitionSponsors ).includes( tier ) ) return { success: false, message: 'Missing/invalid Required Field' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Add to sponsor list
        foundCompetition.sponsors.push({ 
            name, tier,
            logo: logo ? logo : null
        });
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } sponsor added`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.sponsors.pop(),
            newValues: foundCompetition.sponsors,
        });

        // Return success
        return { success: true, message: 'Sponsor Added', data: foundCompetition.sponsors };
    } catch ( err ) {
        console.error('Error Adding Competition Sponsor', err);
        throw new Error('Error Performing Updates')
    }
}

const removeCompetitionSponsor = async (
    { competitionId }: { competitionId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Remove sponsor
        const newSponsors = foundCompetition.sponsors.filter( sponsor => sponsor.name !== name );
        foundCompetition.sponsors = newSponsors;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `Sponsor Removed From ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            newValues: foundCompetition.sponsors
        });

        // Return success
        return { success: true, message: 'Sponsor Removed', data: foundCompetition.sponsors };
    } catch ( err ) {
        console.error('Error Removing Competition Sponsor', err);
        throw new Error('Error Performing Updates')
    }
}

const setCompetitionAdmin = async (
    { competitionId }: { competitionId: string },
    { admin }: { admin: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check if admin exists
        const foundAdmin = await db.V2User.findById( admin );
        if( !foundAdmin ) return { success: false, message: 'Invalid Admin' };
        if( foundAdmin.role !== UserRole.COMPETITION_ADMIN ) return { success: false, message: 'Invalid Admin Permissions' };

        // Set Admin
        const newCompetition = await db.V2FootballCompetition.findByIdAndUpdate(
            competitionId,
            { admin: foundAdmin._id },
            { new: true }
        );
        if( !newCompetition ) return { success: false, message: 'Error Updating Admin' };

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundAdmin.name } Set As ${ foundCompetition.name } Admin`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.admin,
            newValues: newCompetition.admin,
        });

        // Return success
        return { success: true, message: 'Competition Admin Updated', data: newCompetition.admin };
    } catch ( err ) {
        console.error('Error Updating Competition Admin', err);
        throw new Error('Error Performing Updates')
    }
}

const addPlayerAwards = async (
    { competitionId }: { competitionId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if( !name ) return { success: false, message: 'Name Required' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Create award
        const award = { name, winner: null };
        foundCompetition.awards.player.push( award );
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `New Player Award Added To ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.awards.player.pop(),
            newValues: foundCompetition.awards.player,
        });

        // Return success
        return { success: true, message: 'Competition Awards Updated', data: foundCompetition.awards };
    } catch ( err ) {
        console.error('Error Adding Player Awards', err);
        throw new Error('Error Performing Updates')
    }
}

const removePlayerAwards = async (
    { competitionId }: { competitionId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if( !name ) return { success: false, message: 'Missing Required Fields' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check award
        const awardExists = foundCompetition.awards.player.some( award => award.name === name );
        if( !awardExists ) return { success: false, message: 'Invalid Award' };

        // Remove award
        const newPlayerAwards = foundCompetition.awards.player.filter( award => award.name !== name );
        foundCompetition.awards.player = newPlayerAwards;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ name } Award Removed From ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
        });

        // Return success
        return { success: true, message: 'Player Award Deleted', data: foundCompetition.awards };
    } catch ( err ) {
        console.error('Error Removing Player Awards', err);
        throw new Error('Error Performing Updates')
    }
}

const addTeamAwards = async (
    { competitionId }: { competitionId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if( !name ) return { success: false, message: 'Name Required' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Create award
        const award = { name, winner: null };
        foundCompetition.awards.team.push( award );
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `New Team Award Added To ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.awards.team.pop(),
            newValues: foundCompetition.awards.team,
        });

        // Return success
        return { success: true, message: 'Competition Awards Updated', data: foundCompetition.awards };
    } catch ( err ) {
        console.error('Error Adding Team Awards', err);
        throw new Error('Error Performing Updates')
    }
}

const removeTeamAwards = async (
    { competitionId }: { competitionId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if( !name ) return { success: false, message: 'Missing Required Fields' };

        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Check award
        const awardExists = foundCompetition.awards.team.some( award => award.name === name );
        if( !awardExists ) return { success: false, message: 'Invalid Award' };

        // Remove award
        const newTeamAwards = foundCompetition.awards.team.filter( award => award.name !== name );
        foundCompetition.awards.team = newTeamAwards;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ name } Award Removed From ${ foundCompetition.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
        });

        // Return success
        return { success: true, message: 'Team Award Deleted', data: foundCompetition.awards };
    } catch ( err ) {
        console.error('Error Removing Team Awards', err);
        throw new Error('Error Performing Updates')
    }
}

const setCompetitionActiveStatus = async (
    { competitionId }: { competitionId: string },
    { isActive }: { isActive: boolean },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Update active status
        const updatedCompetition = await db.V2FootballCompetition.findByIdAndUpdate(
            competitionId,
            { isActive: isActive },
            { new: true }
        );
        if( !updatedCompetition ) return { success: false, message: 'Error Updating' };

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } Active Status Set As ${ isActive }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundCompetition.isActive,
            newValues: updatedCompetition.isActive,
        });

        // Return success
        return { success: true, message: 'Competition Status Updated', data: updatedCompetition.isActive };
    } catch ( err ) {
        console.error('', err);
        throw new Error('Error Performing Updates')
    }
}

const makeCompetitionFeatured = async (
    { competitionId }: { competitionId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if competition exists
        const foundCompetition = await db.V2FootballCompetition.findById( competitionId );
        if( !foundCompetition ) return { success: false, message: 'Invalid Competition' };

        // Update previous featured status
        const updatedCompetition = await db.V2FootballCompetition.findOneAndUpdate(
            { isFeatured: true },
            { isFeatured: false },
            { new: true }
        );

        // Update feaured status
        foundCompetition.isFeatured = true;
        await foundCompetition.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballCompetition',
            entityId: foundCompetition._id,
            message: `${ foundCompetition.name } Featured`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: updatedCompetition!.isFeatured,
            newValues: foundCompetition.isFeatured,
        });

        // Return success
        return { success: true, message: 'Competition Featured Status Updated', data: foundCompetition.isFeatured };
    } catch ( err ) {
        console.error('Error Featuring Competition', err);
        throw new Error('Error Performing Updates')
    }
}

const competitionService = {
    createCompetition,
    cloneCompetitionForNewSeason,

    getAllCompetitions,
    getCompetitionById,
    getCompetitiionLeagueTable,
    getCompetitiionKnockoutRounds,
    getCompetitiionGroups,
    getCompetitiionTeamsAndSquadList,
    getCompetitiionFixtures,
    getCompetitiionStats,

    // Status and info updates
    updateCompetitionStatus,
    updateCompetitionInfo,

    // Team and squad registration
    registerCompetitionTeam,
    unregisterCompetitionTeam,
    registerCompetitionTeamSquad,

    // Group, league and knockout
    createCompetitionLeagueTable,
    createCompetitionGroup,
    createCompetitionKnockoutRound,
    deleteCompetitionGroup,
    deleteCompetitionKnockoutRound,
    updateCompetitionTeamStandings,

    // Fixture
    createCompetitionFixture,
    updateCompetitionFixture,
    updateCompetitionFixtureResult,
    
    // General updates
    updateCompetitionRules,
    updateCompetitionFormat,
    addCompetitionAdditionalRule,
    removeCompetitionAdditionalRule,
    addCompetitionSponsor,
    removeCompetitionSponsor,
    addPlayerAwards,
    removePlayerAwards,
    addTeamAwards,
    removeTeamAwards,

    // Admin and status updates
    setCompetitionAdmin,
    setCompetitionActiveStatus,
    makeCompetitionFeatured,

    // Deletion
    deleteCompetition,
}

export default competitionService;