import { ObjectId, Types } from 'mongoose';
import '../../config/db';
import { AuditInfo } from '../../types/express';
import { BasketBallPlayerHands, BasketBallPlayerPosition } from '../../types/player.enums';
import db from '../../config/db';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';

type CreatePlayerBody = {
    name: string;
    admissionYear: string;
    departmentId: Types.ObjectId;
    weight: number;
    height: number;
    nationality: string;
    preferredHand: BasketBallPlayerHands;
    position: BasketBallPlayerPosition;
}
type PlayerFilters = {
    department?: Types.ObjectId;
    academicYear?: string;
    preferredHand?: BasketBallPlayerHands;
    position?: BasketBallPlayerPosition;
}
type PlayerUpdateDetails = {
    name?: string;
    admissionYear?: string;
    weight?: number;
    height?: number;
    nationality?: string;
    preferredHand?: BasketBallPlayerHands;
    position?: BasketBallPlayerPosition;
}

const createPlayer = async (
    { name, admissionYear, weight, height, nationality, preferredHand, position, departmentId }: CreatePlayerBody,
    imageUrl: string,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Valdiate required fields
        if(!name || !admissionYear || !weight || !height || !nationality || !preferredHand || !position || !departmentId) {
            return { success: false, message: 'Missing required fields' };
        }
        if(!Object.values(BasketBallPlayerHands).includes(preferredHand)) {
            return {
                success: false,
                message: `${preferredHand} has an invalid value. Valid values: ${Object.values(BasketBallPlayerHands).join(',')}`
            }
        }
        if(!Object.values(BasketBallPlayerPosition).includes(position)) {
            return {
                success: false,
                message: `${position} has an invalid value. Valid values: ${Object.values(BasketBallPlayerPosition).join(',')}`
            }
        }
        const foundDepartment = await db.V2Department.findById(departmentId);
        if(!foundDepartment) return { success: false, message: 'Invalid Department ID' };

        // Create new player
        const newPlayer = new db.V2BasketballPlayer({
            name, admissionYear, weight, height, nationality, preferredHand, position, 
            department: departmentId,
            photo: imageUrl,
        });
        await newPlayer.save();

        // Create player stat records
        const newCareerStat = new db.V2BasketballPlayerCareerStat({ player: newPlayer._id });
        await newCareerStat.save();

        // Update player with career stat ID
        newPlayer.careerStats = newCareerStat._id;
        await newPlayer.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2BasketballPlayer',
            entityId: newPlayer._id,
            message: `New basketball player ${name} created by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: newPlayer.toObject()
        });

        // Return success
        return { success: true, message: 'Basketball player registered successfully', data: newPlayer.toObject() };
    } catch(err) {
        console.error('Error creating player', err);
        throw new Error('Error creating player');
    }
}

const getAllPlayers = async(
    { limit=10, page=1, academicYear, departmentId, preferredHand, position }: 
        { limit?: number, page?: number, academicYear?: string, departmentId?: Types.ObjectId, preferredHand?: BasketBallPlayerHands, position?: BasketBallPlayerPosition }
) => {
    try {
        const skip = ( page - 1 ) * limit;
        const filters: PlayerFilters = {};
        if( departmentId ) filters.department = departmentId;
        if( academicYear ) filters.academicYear = academicYear;
        if( preferredHand && Object.values(BasketBallPlayerHands).includes(preferredHand) ) filters.preferredHand = preferredHand;
        if( position && Object.values(BasketBallPlayerPosition).includes(position) ) filters.position = position;

        // Get player count and players
        const allBBPlayersCount = await db.V2BasketballPlayer.countDocuments();
        const players = await db.V2BasketballPlayer.find(filters)
            .populate([
                { path: 'department', select: 'name' },
            ])
            .skip( skip )
            .limit( limit );
        
        
        return {
            success: true,
            message: 'All Basketball Players Acquired',
            data: {
                page,
                limit,
                total: allBBPlayersCount,
                players,
            }
        }
    } catch(err) {
        console.error('Error Fetching Basketball Players', err);
        throw new Error('Error Fetching Basketball Players');
    }
}

const getPlayerDetails = async({ playerId }: { playerId: Types.ObjectId }) => {
    try {
        // Check if player exists
        const foundPlayer = await db.V2BasketballPlayer.findById(playerId)
            .populate([
                { path: 'department', select: 'name' },
                { path: 'seasonStats' },
                { path: 'careertats' },
                { path: 'contracts' },
            ]);
        if(!foundPlayer) return { success: false, message: 'Invalid Player ID' };

        // Return success
        return {
            success: true,
            message: 'Player details acquired',
            data: foundPlayer,
        }
    } catch(err) {
        console.error('Error fetching player details', err);
        throw new Error(`Error fetching player details: ${err}`);
    }
}

const updatePlayer = async(
    { playerId }: { playerId: Types.ObjectId },
    { name, admissionYear, nationality, preferredHand, position, height, weight }: PlayerUpdateDetails,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if player exists
        const foundPlayer = await db.V2BasketballPlayer.findById(playerId);
        if(!foundPlayer) return { success: false, message: 'Invalid Player ID' };
        const oldPlayer = await db.V2BasketballPlayer.findById(playerId);

        // Update details
        if(name) foundPlayer.name = name;
        if(nationality) foundPlayer.nationality = nationality;
        if(weight) foundPlayer.weight = weight;
        if(height) foundPlayer.height = height;
        if(preferredHand) {
            if(!Object.values(BasketBallPlayerHands).includes(preferredHand)) return { success: false, message: `Invalid value of preferredHand: ${preferredHand}`}
            foundPlayer.preferredHand = preferredHand;
        }
        if(position) {
            if(!Object.values(BasketBallPlayerPosition).includes(position)) return { success: false, message: `Invalid value of position: ${position}`}
            foundPlayer.position = position;
        }
        if(admissionYear) foundPlayer.admissionYear = admissionYear;
        await foundPlayer.save();

        // Log actions
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2BasketballPlayer',
            entityId: foundPlayer._id,
            message: `Basketball player details updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldPlayer!.toObject(),
            newValues: foundPlayer.toObject()
        });

        // Return success
        return {
            success: true,
            message: 'Basketball player updated',
            data: foundPlayer.toObject(),
        }
    } catch(err) {
        console.error('Error updating basketball player', err);
        throw new Error(`Error updating basketball player: ${err}`);
    }
}

const updatePlayerImage = async (
    { playerId }: { playerId: Types.ObjectId },
    imageUrl: string,
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if player exists
        const foundPlayer = await db.V2BasketballPlayer.findById(playerId);
        if(!foundPlayer) return { success: false, message: 'Invalid Player ID' };
        const oldPlayer = await db.V2BasketballPlayer.findById(playerId);

        // Update details
        foundPlayer.photo = imageUrl,
        await foundPlayer.save();

        // Log actions
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2BasketballPlayer',
            entityId: foundPlayer._id,
            message: `Basketball player image updated by ${userId}`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldPlayer!.photo,
            newValues: foundPlayer.photo,
        });

        // Return success
        return {
            success: true,
            message: 'Basketball player updated',
            data: foundPlayer.toObject(),
        }
    } catch(err) {
        console.error('Error updating basketball player image', err);
        throw new Error(`Error updating basketball player image: ${err}`);
    }
}

const comparePlayers = async(
    { playerAId, playerBId }: { playerAId: Types.ObjectId, playerBId: Types.ObjectId }
) => {
    try {
        // Check both players exist
        const playerA = await db.V2BasketballPlayer.findById( playerAId );
        const playerB = await db.V2BasketballPlayer.findById( playerBId );
        if(!playerA) return { success: false, message: 'Invalid player A ID' };
        if(!playerB) return { success: false, message: 'Invalid player B ID' };

        // Return success
        return {
            success: true,
            message: 'Player comparison run',
            data: {

            }
        }
    } catch(err) {
        console.error('Error updating basketball player', err);
        throw new Error(`Error updating basketball player: ${err}`);
    }
}

const playerService = {
    createPlayer,
    getPlayerDetails,
    getAllPlayers,
    updatePlayer,
    updatePlayerImage,
    
}

export default playerService;