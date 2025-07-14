import db from '../../config/db';
import { UserRole } from '../../types/user.enums';

const getLiveFixtureAdmins = async () => {
    try {
        // Check for live fixture admins
        const foundAdmins = await db.V2User.find({ role: UserRole.LIVE_FIXTURE_ADMIN })

        // Return success
        return { success: true, message: 'Live Admins Acquired', data: foundAdmins };
    } catch ( err ) {
        console.error('Error fetching live admins', err);
        throw new Error('Error Fetching Live Admins')
    }
}

const getAllAdmins = async () => {
    try {
        // Check for live fixture admins
        const foundAdmins = await db.V2User.find({ role: { $ne: UserRole.USER } })

        // Return success
        return { success: true, message: 'All Admins Acquired', data: foundAdmins };
    } catch ( err ) {
        console.error('Error fetching all admins', err);
        throw new Error('Error Fetching All Admins')
    }
}

const adminService = {
    getLiveFixtureAdmins,
    getAllAdmins,
}

export default adminService;