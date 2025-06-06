const db = require('../../config/db');
const { generateToken } = require('../../utils/jwtUtils');
const { logActionManually } = require('../../middlewares/auditMiddleware');
const { sendNotification } = require('../../utils/general/notificationUtils');

exports.registerRegularUser = async ({ name, email, password }, { auditInfo }) => {
    // Check if user already exists
    const foundUser = await db.RefactoredUser.findOne({ email });
    if( foundUser ) return { success: false, message: 'Email Already Registered In DB' }
    
    // Create User
    const createdUser = await db.RefactoredUser.create({ name, email });
    createdUser.password = password;
    await createdUser.save();
    const user = {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
    }

    await sendNotification({
        recipient: createdUser._id,
        title: 'Welcome to FUPRE Sports Media',
        message: `Welcome to FUPRE Sports Media, ${createdUser.name}. Your account has been successfully created.`
    });

    // Log action
    logActionManually({
        userId: createdUser._id, 
        auditInfo,
        action: 'CREATE',
        entity: 'RefactoredUser',
        entityId: createdUser._id,
        details: {
            message: `Regular User Created`
        }
    });

    // Return success
    return { success: true, message: 'User Created', data: user };
}

exports.registerAdmin = async ({ name, email, role, password }, { userId, auditInfo }) => {
    // Check if user already exists
    const foundUser = await db.RefactoredUser.findOne({ email });
    if( foundUser ) return { success: false, message: 'Email Already Registered In DB' }
    
    // Create User
    const createdUser = await db.RefactoredUser.create({ name, email, role });
    createdUser.password = password;
    await createdUser.save();
    const user = {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
    }

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'CREATE',
        entity: 'RefactoredUser',
        entityId: createdUser._id,
        details: {
            message: `Admin Created`
        }
    });

    // Return success
    return { success: true, message: 'Admin Account Created', data: user };
}

exports.loginUser = async ({ email, password }, { auditInfo }) => {
    // Check if user exists
    const foundUser = await db.RefactoredUser.findOne({ email });
    if( !foundUser ) return { success: false, message: 'Invalid Email' };

    // Check if password is coreect
    const isPasswordMatch = await foundUser.comparePassword( password );
    if( !isPasswordMatch ) return { success: false, message: 'Invalid Password' };

    // Generate jwt
    const token = generateToken( foundUser );

    // Update last login
    foundUser.lastLogin = new Date();
    await foundUser.save();

    // Log action
    logActionManually({
        userId: foundUser._id, 
        auditInfo,
        action: 'LOGIN',
        entity: 'RefactoredUser',
        entityId: foundUser._id,
        details: {
            message: `User Login`
        }
    });

    // Return success
    return { 
        success: true, 
        message: 'User Logged In', 
        data: {
            token,
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
            }
        }
    };
}

exports.logoutUser = async ({ userId, auditInfo }) => {
    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'LOGIN',
        entity: 'RefactoredUser',
        entityId: userId,
        details: {
            message: `User Login`
        }
    });

    // Return success
    return { success: true, message: 'User Logged Out', data: null };
}

exports.changePassword = async ( { oldPassword, newPassword, confirmNewPassword }, { userId, auditInfo } ) => {
    // Find user in database
    const foundUser = await db.RefactoredUser.findById( userId );
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

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: 'RefactoredUser',
        entityId: userId,
        details: {
            message: `User Password Changed`
        }
    });

    // Return success
    return { success: true, message: 'Password Changed Successfully', data: null };
}

module.exports = exports;