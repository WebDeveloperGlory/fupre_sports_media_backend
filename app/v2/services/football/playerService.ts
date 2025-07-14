import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import { FavoriteFoot, PlayerClubStatus, PlayerRole } from '../../types/player.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';
import { UserRole } from '../../types/user.enums';
import { TeamTypes } from '../../types/team.enums';

type PlayerCreateDetails = {
    name: string;
    department: ObjectId;
    admissionYear: string;
    preferredFoot?: FavoriteFoot;
    height?: number;
    weight?: number;
    createdBy: ObjectId;
}

type PlayerUpdateDetails = {
    name?: string;
    admissionYear?: string;
    preferredFoot?: FavoriteFoot;
    height?: string;
    weight?: string;
    clubStatus?: PlayerClubStatus;
    marketValue?: number;
}

type TeamAssignmentDetails = {
    teamId: ObjectId;
    role?: PlayerRole;
    position?: string;
    jerseyNumber?: number;
}

type PlayerVerificationDetails = {
    status: 'verified' | 'rejected';
    reason?: string;
    verifiedBy: ObjectId;
}

const createPlayer = async (
    { name, department, admissionYear, preferredFoot, height, weight, createdBy }: PlayerCreateDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if (!name || !department || !admissionYear) {
            return { success: false, message: 'Name, department and admission year are required' };
        }

        // Validate department exists
        const departmentExists = await db.V2Department.findById(department);
        if (!departmentExists) {
            return { success: false, message: 'Invalid department' };
        }

        // Create new player
        const newPlayer = new db.V2FootballPlayer({
            name,
            department,
            admissionYear,
            preferredFoot,
            height,
            weight,
            createdBy,
            verificationStatus: 'pending'
        });

        await newPlayer.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballPlayer',
            entityId: newPlayer._id,
            message: `New player ${name} created by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: newPlayer.toObject()
        });

        return { success: true, message: 'Player created successfully', data: newPlayer };
    } catch (err) {
        console.error('Error creating player', err);
        throw new Error('Error creating player');
    }
}

const updatePlayer = async (
    { playerId }: { playerId: string },
    updateData: PlayerUpdateDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Find player
        const player = await db.V2FootballPlayer.findById(playerId);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Save old values for audit
        const oldPlayer = player.toObject();

        // Update fields
        if (updateData.name) player.name = updateData.name;
        if (updateData.admissionYear) player.admissionYear = updateData.admissionYear;
        if (updateData.preferredFoot) player.preferredFoot = updateData.preferredFoot;
        if (updateData.height) player.height = updateData.height;
        if (updateData.weight) player.weight = updateData.weight;
        if (updateData.clubStatus) player.clubStatus = updateData.clubStatus;
        if (updateData.marketValue !== undefined) player.marketValue = updateData.marketValue;

        await player.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballPlayer',
            entityId: player._id,
            message: `Player ${player.name} updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldPlayer,
            newValues: player.toObject()
        });

        return { success: true, message: 'Player updated successfully', data: player };
    } catch (err) {
        console.error('Error updating player', err);
        throw new Error('Error updating player');
    }
}

const registerUnverifiedPlayer = async (
    { name, department, admissionYear }: { name: string; department: ObjectId; admissionYear: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate required fields
        if (!name || !department || !admissionYear) {
            return { success: false, message: 'Name, department and admission year are required' };
        }

        // Validate department exists
        const departmentExists = await db.V2Department.findById(department);
        if (!departmentExists) {
            return { success: false, message: 'Invalid department' };
        }

        // Create new unverified player
        const newPlayer = new db.V2FootballPlayer({
            name,
            department,
            admissionYear,
            createdBy: userId,
            verificationStatus: 'pending'
        });

        await newPlayer.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2FootballPlayer',
            entityId: newPlayer._id,
            message: `New unverified player ${name} registered by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: newPlayer.toObject()
        });

        return { 
            success: true, 
            message: 'Unverified player registered successfully', 
            data: newPlayer 
        };
    } catch (err) {
        console.error('Error registering unverified player', err);
        throw new Error('Error registering unverified player');
    }
}

const verifyPlayerRegistration = async (
    { playerId }: { playerId: string },
    { status, reason, verifiedBy }: PlayerVerificationDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Find player
        const player = await db.V2FootballPlayer.findById(playerId);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Check if user has verification permissions
        const verifier = await db.V2User.findById(verifiedBy);
        if (!verifier || ![UserRole.SUPER_ADMIN].includes(verifier.role)) {
            return { success: false, message: 'Unauthorized verification attempt' };
        }

        // Save old values for audit
        const oldPlayer = player.toObject();

        // Update verification status
        player.verificationStatus = status;
        player.verifiedBy = verifiedBy;

        if (status === 'rejected' && reason) {
            // Add rejection reason to player document if needed
            // (You might want to add a rejectionReason field to your model)
        }

        await player.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballPlayer',
            entityId: player._id,
            message: `Player ${player.name} verification status updated to ${status} by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldPlayer,
            newValues: player.toObject()
        });

        return { 
            success: true, 
            message: `Player verification ${status} successfully`, 
            data: player 
        };
    } catch (err) {
        console.error('Error verifying player registration', err);
        throw new Error('Error verifying player registration');
    }
}

const addPlayerToTeam = async (
    { playerId }: { playerId: string },
    { teamId, role, position, jerseyNumber }: TeamAssignmentDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Find player and team
        const player = await db.V2FootballPlayer.findById(playerId);
        const team = await db.V2FootballTeam.findById(teamId);

        if (!player) {
            return { success: false, message: 'Player not found' };
        }
        if (!team) {
            return { success: false, message: 'Team not found' };
        }

        // Check if player is already in the team
        const existingTeamAssignment = player.teams.find(t => t.team.toString() === teamId.toString());
        if (existingTeamAssignment) {
            return { success: false, message: 'Player is already in this team' };
        }

        // Check if team is in player's eligible teams
        if (!player.eligibleTeams.some(id => id.toString() === teamId.toString())) {
            return { success: false, message: 'Player is not eligible for this team' };
        }

        // Save old values for audit
        const oldPlayer = player.toObject();

        // Add team assignment
        player.teams.push({
            team: teamId,
            role: role || PlayerRole.PLAYER,
            position: position || '',
            jerseyNumber: jerseyNumber || 0,
            isActive: true,
            joinedAt: new Date()
        });

        await player.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2FootballPlayer',
            entityId: player._id,
            message: `Player ${player.name} added to team ${team.name} by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldPlayer,
            newValues: player.toObject()
        });

        return { 
            success: true, 
            message: 'Player added to team successfully', 
            data: player 
        };
    } catch (err) {
        console.error('Error adding player to team', err);
        throw new Error('Error adding player to team');
    }
}

const getTeamSuggestedPlayers = async (
    { teamId }: { teamId: string },
    { limit = 10, page = 1 }: { limit?: number; page?: number }
) => {
    try {
        // Find team
        const team = await db.V2FootballTeam.findById(teamId);
        if (!team) {
            return { success: false, message: 'Team not found' };
        }

        // Determine filters based on team type
        let filters: any = {};
        
        if (team.type.includes('department')) {
            // For department teams, suggest players from same department
            filters.department = team.department;
            
            if (team.type === TeamTypes.DEPARTMENT_LEVEL) {
                // For academic year teams, filter by admission year
                filters.admissionYear = team.academicYear;
            }
        } else if (team.type === 'school-general') {
            // For school general teams, suggest all verified players
            filters.verificationStatus = 'verified';
        } else if (team.type === 'club') {
            // For clubs, suggest players with club status
            filters.clubStatus = { $exists: true };
        }

        // Exclude players already in the team
        const teamPlayers = await db.V2FootballPlayer.find({ 'teams.team': teamId }).select('_id');
        filters._id = { $nin: teamPlayers.map(p => p._id) };

        // Pagination
        const skip = (page - 1) * limit;

        // Get suggested players
        const suggestedPlayers = await db.V2FootballPlayer.find(filters)
            .skip(skip)
            .limit(limit)
            .populate('department', 'name')
            .select('name admissionYear department verificationStatus');

        return { 
            success: true, 
            message: 'Suggested players retrieved successfully', 
            data: {
                team: { _id: team._id, name: team.name, type: team.type },
                suggestedPlayers
            }
        };
    } catch (err) {
        console.error('Error getting suggested players', err);
        throw new Error('Error getting suggested players');
    }
}

const playerService = {
    createPlayer,
    updatePlayer,
    registerUnverifiedPlayer,
    verifyPlayerRegistration,
    addPlayerToTeam,
    getTeamSuggestedPlayers
};

export default playerService;