import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { CoachRoles, FriendlyRequestStatus, TeamTypes } from '../../types/team.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';
import { UserRole } from '../../types/user.enums';
import { getTeamFixtureStats } from '../../utils/sport/football/teamUtils';

type TeamCreateDetails = {
    name: string;
    shorthand: string;
    type: TeamTypes;
    academicYear: string;
    department: ObjectId;
    faculty: ObjectId;
}
type TeamFilters = {
    department?: string,
    faculty?: string,
    academicYear?: string,
    type?: TeamTypes
}
export type StatQuery = {
    startDate?: Date,
    endDate?: Date,
    competitionId?: string,
}
type TeamBasicInfo = {
    name: string;
    shorthand: string;
    academicYear: string;
    color: {
        primary: string;
        secondary: string;
    }
}
type TeamStats = {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
}

const createTeam = async (
    { name, shorthand, type, academicYear, department, faculty }: TeamCreateDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for reuired fields
        if( !name || !shorthand || !type || !academicYear ) return { success: false, message: 'Missing Required Field' };
        if( !Object.values( TeamTypes ).includes( type ) ) return { success: false, message: 'Invalid Team Type' };
        if( type.includes('department') && !department ) return { success: false, message: `Department Required for ${ type } Teams` }
        if( type === TeamTypes.FACULTY_GENERAL && !faculty ) return { success: false, message: 'Faculty Required for Faculty General Teams' };

        // Check uniqueness of name
        const sameNameTeam = await db.V2FootballTeam.findOne({ name });
        if( sameNameTeam ) return { success: false, message: `Team With ${ name } Already Exists` };

        // Validate department
        if( department ) {
            const isValidDepartment = await db.V2Department.findById( department );
            if( !isValidDepartment ) return { success: false, message: 'Invalid Department' }
        }
        if( faculty ) {
            const isValidFaculty = await db.V2Faculty.findById( faculty );
            if( !isValidFaculty ) return { success: false, message: 'Invalid Faculty' }
        }

        // Create team
        const createdTeam = new db.V2FootballTeam({
            name, shorthand, type, academicYear
        });
        if( department ) createdTeam.department = department;
        if( faculty ) createdTeam.faculty = faculty;
        await createdTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballTeam',
            entityId: createdTeam._id,
            message: `New Team ${ createdTeam.name } Created By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: createdTeam.toObject()
        });

        // Return success
        return { success: true, message: 'Team Created', data: createdTeam };
    } catch( err ) {
        console.error('Error during team coach update', err );
        throw new Error('Error With Team Coach Updates');
    }
}

const getAllTeams = async ({ facultyId, departmentId, type, academicYear, limit=10, page=1 }: { facultyId: string, departmentId: string, type: TeamTypes, academicYear: string, limit: number, page: number }) => {
    try {
        // Define filters
        const skip = ( page - 1 ) * limit;
        const filters: TeamFilters = {};
        if( facultyId ) filters.faculty = facultyId;
        if( departmentId ) filters.department = departmentId;
        if( type ) filters.type = type;
        if( academicYear ) filters.academicYear = academicYear;

        // Get all teams
        const allTeams = await db.V2FootballTeam.find( filters )
            .populate([
                { path: 'department', select: 'name' },
                { path: 'faculty', select: 'name' },
            ])
            .skip( skip )
            .limit( limit );

        // Return success
        return { success: true, message: 'All Teams Acquired', data: allTeams }
    } catch( err ) {
        console.error('Error during all teams fetch', err );
        throw new Error('Error With Teams Fetching');
    }
}

const getSingleTeam = async ({ teamId }: { teamId: ObjectId }) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId )
            .populate([
                { path: 'department', select: 'name' },
                { path: 'faculty', select: 'name' },
            ]);
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Return success
        return { success: true, message: 'Team Acquired', data: foundTeam };
    } catch( err ) {
        console.error('Error during single team fetch', err );
        throw new Error('Error With Team Fetch');
    }
}

const getTeamStats = async (
    { teamId }: { teamId: string },
    { startDate, endDate, competitionId }: StatQuery
) => {
    try {
        // Define filters
        const filters: any = {
            status: 'completed',
            $or: [
                { homeTeam: teamId },
                { awayTeam: teamId }
            ]
        };
        if (startDate || endDate) {
            filters.scheduledDate = {};
            if (startDate) filters.scheduledDate.$gte = startDate;
            if (endDate) filters.scheduledDate.$lte = endDate;
        }

        if (competitionId) {
            filters.competition = competitionId;
        }

        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Get team fixtures
        const fixtures = await db.V2FootballFixture
            .find( filters )
            .sort({ scheduledDate: -1 })
            .lean();

        const stats = await getTeamFixtureStats({ fixtures, teamId });

        return { 
            success: true,
            message: 'Team Stats Acquired', 
            data: {
                team: { _id: foundTeam._id, name: foundTeam.name, shorthand: foundTeam.shorthand },
                stats
            }
        }
    } catch( err ) {
        console.error('Error during team stats fetch', err );
        throw new Error('Error With Team Stats Fetch');
    }
}

const getTeamPlayers = async (
    { teamId }: { teamId: string }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId ).populate('players');
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Get all players in the team
        const players = await db.V2FootballPlayer.find({ 'teams.team': teamId })
            .populate([
                { path: 'department', select: 'name' },
                { path: 'competitionStats.competition', select: 'name type' }
            ])

        // Grab necesssary fields
        const playerDetails = players.map( player => {
            const { _id, name, admissionYear, department, clubStatus, loanDetails, marketValue, preferredFoot, height, weight, verificationStatus } = player;

            const inTeamDetails = player.teams.find( team => team.team.toString() === teamId.toString() );
            const teamSeasonalStats = player.seasonalStats.find( season => season.team.toString() === teamId.toString() );
            const teamCompetitionStats = player.competitionStats.find( competition => competition.team.toString() === teamId.toString() );

            return {
                _id,
                name, admissionYear, department, 
                clubStatus, loanDetails, marketValue, 
                preferredFoot, height, weight, 
                verificationStatus,
                role: inTeamDetails!.role,
                position: inTeamDetails!.position,
                jerseyNumber: inTeamDetails!.jerseyNumber,
                joinedAt: inTeamDetails!.joinedAt,
                seasonalStats: teamSeasonalStats,
                competitionStats: teamCompetitionStats
            }
        });

        // Return success
        return { 
            success: true,
            message: 'Team Players Acquired', 
            data: {
                team: { _id: foundTeam._id, name: foundTeam.name, shorthand: foundTeam.shorthand },
                players: playerDetails
            }
        }
    } catch( err ) {
        console.error('Error during team player fetch', err );
        throw new Error('Error With Team Player Fetch');
    }
}

const getTeamCompetitionAndCompetitionPerformance = async (
    { teamId }: { teamId: string },
    { season }: { season: string }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId )
            .populate([
                { path: 'competitionPerformance.competition', select: 'name shorthand type' }
            ]);
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Check if season was specified
        const competitionPerformanceArray = foundTeam.competitionPerformance.filter( comp => {
            if( season ) {
                return comp.season === season;
            } else {
                return true
            }
        });

        // Return success
        return { success: true, message: 'Competition Performance acquired', data: competitionPerformanceArray };
    } catch( err ) {
        console.error('Error during team competitions fetch', err );
        throw new Error('Error With Team Competition Fetch');
    }
}

const updateTeamBasicInfo = async (
    { teamId }: { teamId: string },
    { name, shorthand, academicYear, color }: TeamBasicInfo,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Team not found' };

        // Get legacy paths
        const oldTeam = await db.V2FootballTeam.findById( teamId );

        // Update team
        if( name ) foundTeam.name = name;
        if( shorthand ) foundTeam.shorthand = shorthand;
        if( academicYear ) foundTeam.academicYear = academicYear;
        if( color ) foundTeam.colors = color;
        await foundTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballTeam',
            entityId: foundTeam._id,
            message: 'Updated Various team stuff',
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldTeam!.toObject(),
            newValues: foundTeam.toObject()
        });

        // Return success
        return { success: true, message: 'Team Details Updated', data: foundTeam }
    } catch( err ) {
        console.error('Error during updating team info', err );
        throw new Error('Error With Team Basic Info Update');
    }
}

const updateTeamCoaches = async (
    { teamId }: { teamId: ObjectId },
    { name, role }: { name: string, role: CoachRoles },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if name and role where passed in
        if( !name || !role ) return { success: false, message: 'Name and Role Are Required' };
        // Validate role
        if( !Object.values(CoachRoles).includes(role) ) return { success: false, message: 'Invalid Role' };

        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Team not found' };

        // Add coach
        const updatedTeam = await db.V2FootballTeam.findByIdAndUpdate(
            teamId,
            { $addToSet: { coaches: { name, role } } }, // Use $addToSet to avoid duplicates
            { new: true }
        );
        if( !updatedTeam ) return { success: false, message: 'Failed to add coach' };

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballTeam',
            entityId: teamId,
            details: { teamId, name, role },
            message: `${ updatedTeam.name } Added A New Coach`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: { coaches: foundTeam.coaches },
            newValues: { coaches: updatedTeam.coaches }
        });

        // Return success
        return { success: true, message: 'Coach added successfully', data: updatedTeam };
    } catch( err ) {
        console.error('Error during team coach update', err );
        throw new Error('Error With Team Coach Updates');
    }
}

const updateTeamLogo = async () => {
    try {

    } catch( err ) {
        console.error('Error during updating team logo', err );
        throw new Error('Error With Team Logo Update');
    }
}

const updateTeamLifetimeStats = async (
    { teamId }: { teamId: ObjectId },
    { matchesPlayed, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets }: TeamStats,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Team not found' };

        // Update team stats
        const updatedTeam = await db.V2FootballTeam.findByIdAndUpdate(
            teamId,
            { stats: { matchesPlayed, wins, draws, losses, goalsFor, goalsAgainst, cleanSheets } },
            { new: true }
        );
        if( !updatedTeam ) return { success: false, message: 'Failed To Add Stats' };

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballTeam',
            entityId: teamId,
            message: `${ updatedTeam.name } Stats Updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: { stats: foundTeam.stats },
            newValues: { stats: updatedTeam.stats }
        });

        // Return success
        return { success: true, message: 'Team Stats Updated', data: updatedTeam };
    } catch( err ) {
        console.error('Error during updating team info', err );
        throw new Error('Error With Team Basic Info Update');
    }
}

const setTeamAdmin = async (
    { teamId }: { teamId: ObjectId },
    { adminId }: { adminId: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Check if admin exists
        const foundAdmin = await db.V2User.findById( adminId );
        if( !foundAdmin || foundAdmin.role !== UserRole.TEAM_ADMIN ) return { success: false, message: 'Invalid User Permissions' };

        // Update team
        await db.V2FootballTeam.findByIdAndUpdate(
            teamId,
            { admin: foundAdmin._id }
        );

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballTeam',
            entityId: foundTeam._id,
            message: `${ foundAdmin.email } Set As ${ foundTeam.name } Admin`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: { admin: foundTeam.admin },
            newValues: { admin: adminId }
        });
        
        // Return success
        return { success: true, message: 'Team Admin Updated', data: foundTeam.admin }
    } catch( err ) {
        console.error('Error during updating team admin', err );
        throw new Error('Error With Team Admin Update');
    }
}

const deleteTeam = async (
    { teamId }: { teamId: ObjectId },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Delete team
        await db.V2FootballTeam.findByIdAndDelete( teamId );

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2FootballTeam',
            entityId: foundTeam._id,
            message: `Team ${ foundTeam.name } Deleted`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundTeam.toObject(),
            newValues: undefined
        });

        // Return success
        return { success: true, message: 'Team Deleted', data: null }
    } catch( err ) {
        console.error('Error during deleting team', err );
        throw new Error('Error With Team Deletion');
    }
}

const sendFriendlyRequest = async (
    { teamId }: { teamId: ObjectId },
    { targetTeam, proposedDate, message }: { targetTeam: ObjectId, proposedDate: Date, message: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Check if target team exists
        const foundTargetTeam = await db.V2FootballTeam.findById( targetTeam );
        if( !foundTargetTeam ) return { success: false, message: 'Invalid Target Team' };

        // Create friendly request
        const customId = new db.mongoose.Types.ObjectId();
        const requestSender = {};
        const requestReciever = {};
        foundTeam.friendlyRequests.push({
            requestId: customId,
            team: targetTeam,
            status: FriendlyRequestStatus.PENDING,
            message,
            proposedDate,
            type: 'sent'
        });
        foundTargetTeam.friendlyRequests.push({
            requestId: customId,
            team: teamId,
            status: FriendlyRequestStatus.PENDING,
            message,
            proposedDate,
            type: 'recieved'
        });
        await foundTeam.save();
        await foundTargetTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2FootballTeam',
            entityId: foundTeam._id,
            message: `Friendly Request Sent From ${ foundTeam.name } To ${ foundTargetTeam.name }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundTeam.toObject(),
            newValues: undefined
        });

        // Return success
        return { success: true, message: 'Friendly Request Sent', data: requestSender }
    } catch( err ) {
        console.error('Error sending friendly request', err );
        throw new Error('Error With Friendly Request Creation');
    }
}

const updateFriendlyRequestStatus = async (
    { teamId }: { teamId: ObjectId },
    { requestId, choice }: { requestId: string, choice: 'accepted' | 'rejected' },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2FootballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Delete team
        await db.V2FootballTeam.findByIdAndDelete( teamId );

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2FootballTeam',
            entityId: foundTeam._id,
            message: 'Team Deleted' ,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundTeam.toObject(),
            newValues: undefined
        });
    } catch( err ) {
        console.error('Error replying to friendly request', err );
        throw new Error('Error During Friendly Request Status Update');
    }
}

const teamService = {
    createTeam,
    getAllTeams,
    getSingleTeam,
    getTeamStats,
    getTeamPlayers,
    getTeamCompetitionAndCompetitionPerformance,
    updateTeamBasicInfo,
    updateTeamCoaches,
    updateTeamLogo,
    setTeamAdmin,
    updateTeamLifetimeStats,
    deleteTeam,
}

export default teamService;