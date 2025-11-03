import { ObjectId, Types } from 'mongoose';
import { AuditInfo } from '../../types/express';
import db from '../../config/db';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';
import { CoachRoles, TeamTypes } from '../../types/team.enums';
import { UserRole } from '../../types/user.enums';

type GetAllTeamsQuery = { 
    limit?: number;
    page?: number;
    academicYear?: string;
    type?: TeamTypes;
    departmentId?: Types.ObjectId;
    facultyId?: Types.ObjectId;
}
type TeamFilters = {
    academicYear?: string;
    type?: TeamTypes;
    department?: Types.ObjectId;
    faculty?: Types.ObjectId;    
}
type CreateTeamForm = {
    name: string;
    shorthand: string;
    type: TeamTypes;
    primaryColor?: string;
    secondaryColor?: string;
    departmentId: Types.ObjectId,
    facultyId: Types.ObjectId;
    academicYear: string;
}
type UpdateTeamForm = {
    name?: string;
    shorthand?: string;
    academicYear?: string;
    primaryColor?: string;
    secondaryColor?: string;
    coaches: { name: string; role: CoachRoles }[];
}

const getAllTeams = async(
    { limit=10, page=1, academicYear, departmentId, facultyId, type }: GetAllTeamsQuery
) => {
        try {
        const skip = ( page - 1 ) * limit;
        const filters: TeamFilters = {};
        if( departmentId ) filters.department = departmentId;
        if( facultyId ) filters.faculty = facultyId;
        if( academicYear ) filters.academicYear = academicYear;
        if( type && Object.values(TeamTypes).includes(type) ) filters.type = type;

        // Get team count and teams
        const allBBTeamCount = await db.V2BasketballTeam.countDocuments();
        const teams = await db.V2BasketballTeam.find(filters)
            .populate([
                { path: 'department', select: 'name' },
                { path: 'faculty', select: 'name' },
            ])
            .skip( skip )
            .limit( limit );
        
        
        return {
            success: true,
            message: 'All Basketball Teams Acquired',
            data: {
                page,
                limit,
                total: allBBTeamCount,
                teams,
            }
        }
    } catch(err) {
        console.error('Error fetching basketball teams', err);
        throw new Error('Error fetching teams');
    }
}

const getTeamDetails = async({ teamId }: { teamId: Types.ObjectId }) => {
    try {
        // Validate team
        const foundTeam = await db.V2BasketballTeam.findById(teamId)
            .populate([
                {
                    path: 'department',
                    select: 'name'
                },
                {
                    path: 'faculty',
                    select: 'name'
                },
            ]);
        if(!foundTeam) return { success: false, message: 'Invalid team ID' };

        // Return success
        return { success: true, message: '', data: foundTeam.toObject() };
    } catch(err) {
        console.error('Error fetching basketball team details', err);
        throw new Error('Error fetching team details');
    }
}

const getTeamPlayers = async({ teamId }: { teamId: Types.ObjectId }) => {
    try {
        // Validate team
        const foundTeam = await db.V2BasketballTeam.findById(teamId)
            .populate([
                {
                    path: 'players',
                    select: 'name admissionYear weight height nationality preferredHand photo marketValue department',
                    populate: {
                        path: 'department',
                        select: 'name'
                    }
                }
            ])
        if(!foundTeam) return { success: false, message: 'Invalid team ID' };

        // Return success
        return { success: true, message: 'Team players acquired', data: foundTeam.players };
    } catch(err) {
        console.error('Error fetching basketball team players', err);
        throw new Error('Error fetching team players');
    }
}

const createTeam = async(
    { name, shorthand, type, primaryColor, secondaryColor, departmentId, facultyId, academicYear }: CreateTeamForm,
    imageUrl: string,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate input fields
        if(!name || !shorthand || !academicYear || !type) return { success: false, message: 'Missing required fields' };
        if(!Object.values(TeamTypes).includes(type)) return { success: false, message: `Invalid type: ${type}. Valdi types: ${Object.values(TeamTypes)}` };
        if(type.includes('department') && !departmentId) return { success: false, message: `Department Required for ${ type } Teams` }
        if(type === TeamTypes.FACULTY_GENERAL && !facultyId) return { success: false, message: 'Faculty Required for Faculty General Teams' };

        // Check uniqueness of name
        const sameNameTeam = await db.V2BasketballTeam.findOne({ name });
        if( sameNameTeam ) return { success: false, message: `Team With ${ name } Already Exists` };

        // Validate department
        if(departmentId) {
            const isValidDepartment = await db.V2Department.findById(departmentId);
            if(!isValidDepartment) return { success: false, message: 'Invalid Department' }
        }
        if(facultyId) {
            const isValidFaculty = await db.V2Faculty.findById(facultyId);
            if(!isValidFaculty) return { success: false, message: 'Invalid Faculty' }
        }

        // Create team
        const createdTeam = new db.V2BasketballTeam({
            name, shorthand, type, academicYear,
            logo: imageUrl,
        });
        if(departmentId) createdTeam.department = departmentId;
        if(facultyId) createdTeam.faculty = facultyId;
        if(primaryColor && secondaryColor) {
            createdTeam.colors = {
                primary: primaryColor,
                secondary: secondaryColor
            }
        }
        await createdTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2BasketballTeam',
            entityId: createdTeam._id,
            message: `New basketball team ${name} created by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: createdTeam.toObject()
        });

        // Return success
        return {
            success: true,
            message: 'Basketball team created successfully',
            data: createdTeam.toObject(),
        }
    } catch(err) {
        console.error('Error creating basketball team', err);
        throw new Error(`Error creating team: ${err}`);
    }
}

const updateTeamAdmin = async(
    { teamId }: { teamId: Types.ObjectId },
    { adminId }: { adminId: Types.ObjectId },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate team and admin id
        const foundTeam = await db.V2BasketballTeam.findById(teamId);
        const foundAdmin = await db.V2User.findById(adminId);
        if(!foundTeam) return { success: false, message: 'Invalid team ID' };
        if(!foundAdmin) return { success: false, message: 'Invalid admin ID' };
        if(foundAdmin.role !== UserRole.TEAM_ADMIN) return { success: false, message: 'Invalid admin type' };

        // Update team admin
        foundTeam.admin = adminId;
        await foundTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2BasketballTeam',
            entityId: foundTeam._id,
            message: `Basketball team admin updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: foundTeam.toObject()
        });

        // Return success
        return { success: true, message: 'Team admin updated', data: foundTeam.admin };
    } catch(err) {
        console.error('Error assigning admin to basketball team', err);
        throw new Error(`Error assigning team admin: ${err}`);
    }
}

const updateTeamLogo = async(
    { teamId }: { teamId: Types.ObjectId },
    imageUrl: string,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate team and admin id
        const foundTeam = await db.V2BasketballTeam.findById(teamId);
        if(!foundTeam) return { success: false, message: 'Invalid team ID' };

        // Update team logo
        foundTeam.logo = imageUrl;
        await foundTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2BasketballTeam',
            entityId: foundTeam._id,
            message: `Basketball team logo updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundTeam.logo ? foundTeam.logo : undefined,
            newValues: foundTeam.logo
        });

        // Return success
        return { success: true, message: 'Team logo updated', data: foundTeam.logo };
    } catch(err) {
        console.error('Error updating basketball team logo', err);
        throw new Error(`Error updating team logo: ${err}`);
    }
}

const updateTeam = async(
    { teamId }: { teamId: Types.ObjectId },
    { name, shorthand, academicYear, primaryColor, secondaryColor, coaches }: UpdateTeamForm,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Validate team id
        const foundTeam = await db.V2BasketballTeam.findById(teamId);
        if(!foundTeam) return { success: false, message: 'Invalid team ID' };
        const oldTeam = await db.V2BasketballTeam.findById(teamId);
        
        // Update team logo
        if(name) foundTeam.name = name;
        if(shorthand) foundTeam.shorthand = shorthand;
        if(academicYear) foundTeam.academicYear = academicYear;
        if(primaryColor && secondaryColor) {
            foundTeam.colors = {
                primary: primaryColor,
                secondary: secondaryColor,
            };
        }
        if(coaches) {
            // Validate coaches
            let hasInvalidCoach: boolean = false;

            coaches.forEach(coach => {
                if(!Object.values(CoachRoles).includes(coach.role)) {
                    hasInvalidCoach = true
                } else {
                    null
                }
            });

            if(hasInvalidCoach) return { success: false, message: 'All coach roles need to be valid' };
        }
        await foundTeam.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2BasketballTeam',
            entityId: foundTeam._id,
            message: `Basketball team logo updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldTeam!.toObject(),
            newValues: foundTeam.toObject()
        });

        // Return success
        return { success: true, message: 'Basketball team updated', data: foundTeam.toObject() };
    } catch(err) {
        console.error('Error updating basketball team', err);
        throw new Error(`Error updating team: ${err}`);
    }
}

const deleteTeam = async (
    { teamId }: { teamId: Types.ObjectId },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if team exists
        const foundTeam = await db.V2BasketballTeam.findById( teamId );
        if( !foundTeam ) return { success: false, message: 'Invalid Team' };

        // Delete team
        await db.V2BasketballTeam.findByIdAndDelete( teamId );

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2BasketballTeam',
            entityId: foundTeam._id,
            message: `Team ${ foundTeam.name } Deleted`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundTeam.toObject(),
            newValues: undefined
        });

        // Return success
        return { success: true, message: 'Basketball team Deleted', data: null }
    } catch( err ) {
        console.error('Error during deleting basketball team', err );
        throw new Error(`Error during team deletion: ${err}`);
    }
}

const teamService = {
    getAllTeams,
    getTeamDetails,
    getTeamPlayers,
    createTeam,
    updateTeamAdmin,
    updateTeamLogo,
    updateTeam,
    deleteTeam,
    
}

export default teamService;