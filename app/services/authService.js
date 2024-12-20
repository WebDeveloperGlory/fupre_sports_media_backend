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

exports.getUserProfile = async ({ userId }) => {
    // Find user in database
    const foundUser = await db.User.findById( userId );
    if( !foundUser ) return { success: false, message: 'User Not Found' };

    // Return success
    return { success: true, message: 'User Aquired', data: foundUser };
}

module.exports = exports;