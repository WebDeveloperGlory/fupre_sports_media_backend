const db = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');

exports.createUser = async ({ name, email, password, role }) => {
    // Create User
    const createdUser = await db.User.create({ name, email, role });
    createdUser.password = password;
    await createdUser.save();
    const user = {
        id: createdUser._id,
        email: createdUser.email,
        role: createdUser.role
    }

    // Return success
    return { success: true, message: 'User Created', data: user };
}

exports.loginUser = async ({ email, password }) => {
    // Check if user exists
    const foundUser = await db.User.findOne({ email });
    if( !foundUser ) return { success: false, message: 'Invalid Email' };

    // Check if password is coreect
    const isPasswordMatch = await foundUser.comparePassword( password );
    if( !isPasswordMatch ) return { success: false, message: 'Invalid Password' };

    // Generate jwt
    const token = generateToken( foundUser );

    // Return success
    return { success: true, message: 'User Logged In', data: token };
}

exports.logoutUser = async () => {
    // Return success
    return { success: true, message: 'User Logged Out', data: null };
}

exports.completePasswordReset = async ( { userId }, { newPassword, confirmNewPassword } ) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    // Check if passwords match
    const matchingPasswords = newPassword === confirmNewPassword;
    if( !matchingPasswords ) return { success: false, message: 'Passwords Do Not Match' };

    // Update password
    foundUser.password = newPassword;
    await foundUser.save();

    return { success: true, message: 'Password Reset Successfully', data: null };
}

exports.changePassword = async ( { userId }, { oldPassword, newPassword, confirmNewPassword } ) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    // Check if old password is correct
    const isPasswordMatch = await foundUser.comparePassword( oldPassword );
    if( !isPasswordMatch ) return { success: false, message: 'Invalid Old Password' };

    // Check if passwords match
    const matchingPasswords = newPassword === confirmNewPassword;
    if( !matchingPasswords ) return { success: false, message: 'Passwords Do Not Match' };

    // Change password and invalidate otp
    foundUser.password = newPassword;
    await foundUser.save();

    // Return success
    return { success: true, message: 'Password Changed Successfully', data: null };
}

exports.getAllUsers = async () => {
    // Find all users
    const foundUsers = await db.User.find().select( '-password' );

    // Return success
    return { success: true, message: 'All Users Aquired', data: foundUsers };
}

exports.getUserProfile = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId )
        .populate([
            {
                path: 'associatedTeam',
                select: 'name department shorthand level coach players assistantCoach captain'
            },
            {
                path: 'associatedCompetitions',
                select: 'name description teams status fixtures'
            }
        ])
        .select( '-password' );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    let nextFixtures = [];
    // Check if user is competition-admin or team-admin
    if ( foundUser.role === 'competition-admin' ) {
        const competitions = foundUser.associatedCompetitions;
        nextFixtures = await db.Fixture.find({
            competition: { $in: competitions },
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .sort({ date: 1 })
            .limit(5)
            .populate( 'homeTeam awayTeam competition' );
    } else if (foundUser.role === 'team-admin') {
        const teamId = foundUser.associatedTeam;

        if ( teamId ) {
            nextFixtures = await db.Fixture.find({
                $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
                status: 'upcoming',
                date: { $gte: new Date() },
            })
                .sort({ date: 1 })
                .limit(5)
                .populate( 'homeTeam awayTeam competition' );
        }
    } else if ( foundUser.role === 'super-admin' ) {
        nextFixtures = await db.Fixture.find({
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .populate( 'homeTeam awayTeam competition' )
            .sort({ date: 1 })
            .limit(5)
            .populate('homeTeam awayTeam competition');
    }

    // Destructure properties
    const { name, email, status, associatedTeam, associatedCompetitions, _id } = foundUser;

    // Return success
    return { 
        success: true, 
        message: 'User Aquired', 
        data: {
            name, email, status, _id,
            competitions: associatedCompetitions.map( comp => {
                const { _id, name, description, fixtures, status, teams } = comp;

                return {
                    _id, name, description, status,
                    fixtures: fixtures.length,
                    teams: teams.length
                }
            } ),
            team: associatedTeam,
            nextFixtures
        }
    };
}

exports.getUserFixtures = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );

    // Check if user is competition-admin or team-admin
    if ( foundUser.role === 'competition-admin' ) {
        // Fetch all fixtures for competitions associated with the competition-admin
        const competitions = foundUser.associatedCompetitions;
        const allUpcomingFixtures = await db.Fixture.find({
            competition: { $in: competitions },
            status: 'upcoming',
        }).populate( 'homeTeam awayTeam competition' );

        const allCompletedFixtures = await db.Fixture.find({
            competition: { $in: competitions },
            status: 'completed',
        }).populate( 'homeTeam awayTeam competition' );

        // Fetch fixtures with a past date and status still "upcoming"
        const overdueFixtures = await db.Fixture.find({
            competition: { $in: competitions },
            status: 'upcoming',
            date: { $lt: new Date() },
        }).populate( 'homeTeam awayTeam competition' );

        return { 
            success: true, 
            message: 'User Fixture Aquired', 
            data: { allUpcomingFixtures, allCompletedFixtures, overdueFixtures } 
        };
    } else if ( foundUser.role === 'team-admin' ) {
        // Fetch the team associated with the team-admin
        const teamId = foundUser.associatedTeam;

        if ( !teamId ) {
            return { success: false, message: 'Team Not Assigned Yet' };
        }

        // Fetch all fixtures for the associated team
        const allUpcomingFixtures = await db.Fixture.find({
            $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
            status: 'upcoming',
        }).populate( 'homeTeam awayTeam competition' );

        const allCompletedFixtures = await db.Fixture.find({
            $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
            status: 'upcoming',
        }).populate( 'homeTeam awayTeam competition' );

        // Fetch next 5 fixtures for the associated team
        const nextFixtures = await db.Fixture.find({
            $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
            status: 'upcoming',
            date: { $gte: new Date() },
        })
            .sort({ date: 1 })
            .limit(5)
            .populate('homeTeam awayTeam competition');

        // Fetch overdue fixtures for the associated team
        const overdueFixtures = await db.Fixture.find({
            $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
            status: 'upcoming',
            date: { $lt: new Date() },
        }).populate('homeTeam awayTeam competition');

        return {
            success: true,
            message: 'User Fixture Aquired',
            data: { allUpcomingFixtures, allCompletedFixtures, nextFixtures, overdueFixtures }
        }
    } else if ( foundUser.role === 'super-admin' ) {
        const allUpcomingFixtures = await db.Fixture.find()
            .populate( 'homeTeam awayTeam competition' );

        const allCompletedFixtures = await db.Fixture.find()
            .populate( 'homeTeam awayTeam competition' );

        const overdueFixtures = await db.Fixture.find({
            status: 'upcoming',
            date: { $lt: new Date() },
        }).populate('homeTeam awayTeam competition');

        return {
            success: true,
            message: 'User Fixture Aquired',
            data: { allUpcomingFixtures, allCompletedFixtures, overdueFixtures }
        }
    } else {
        return { success: false, message: 'Invalid User Type' };
    }
}

exports.deleteUser = async ({ userId }) => {
    // Delete user from database
    const deletedUser = await db.User.findByIdAndDelete( userId ).select( '-password' );
    if( !deletedUser ) return { success: false, message: 'Invalid User' }

    // Return success
    return { success: true, message: 'User Deleted', data: deletedUser }
}

module.exports = exports;