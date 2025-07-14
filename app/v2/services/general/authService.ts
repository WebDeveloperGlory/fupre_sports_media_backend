import { ObjectId } from "mongoose";
import db from "../../config/db";
import { LogAction } from "../../types/auditlog.enums";
import { AuditInfo } from "../../types/express";
import { UserRole, UserStatus } from "../../types/user.enums";
import logutils from '../../utils/general/auditLogUtils';
import notificationutils from '../../utils/general/notificationUtils';
import otpUtils from "../../utils/general/otpUtils";
import { generateToken } from "../../utils/general/jwtUtils";

const registrationMessage = ( name: string, role: string ) => `Welcome to FUPRE Sports Media, ${ name }. Your ${ role } account has been successfully created.`;
const registrationHTML = ( name: string, role: string ) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Welcome to FUPRE Sports Media!</h2>
            <p>Hello ${ name },</p>
            <p>Your ${ role } account has been successfully created.</p>
            <p>You can now log in and start using our services.</p>
            <p style="margin-top: 30px; color: #666;">FUPRE Sports Media Team</p>
        </div>
    `;
};

const registerRegularUser = async (
    { name, email, password }: { name: string, email: string, password: string }, 
    { auditInfo }: { auditInfo: AuditInfo }
) => {
    try {
        // Check if user already exists
        const foundUser = await db.V2User.findOne({ email });
        if( foundUser && foundUser.status === UserStatus.INACTIVE ) return { success: false, message: 'Verify OTP' }
        if( foundUser && foundUser.status === UserStatus.SUSPENDED ) return { success: false, message: 'Banned User Contact An Admin' }
        if( foundUser && foundUser.status === UserStatus.ACTIVE ) return { success: false, message: 'Email Already Registered In DB' }

        // Create user
        const createdUser = new db.V2User({ name, email, password });
        await createdUser.save();

        const user = {
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role
        }

        // Send notification
        await notificationutils.sendNotification({
            preferences: createdUser.preferences,
            recipient: createdUser._id,
            email: createdUser.email,
            title: 'Welcome to FUPRE Sports Media',
            subject: 'Welcome to FUPRE Sports Media',
            message: registrationMessage( createdUser.name, createdUser.role ),
            html: registrationHTML( createdUser.name, createdUser.role ),
        });

        // Log action
        await logutils.logAction({
            userId: createdUser._id, 
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            action: LogAction.CREATE,
            entity: 'V2User',
            entityId: createdUser._id,
            message: `Regular User ${ createdUser.name } Signed Up`
        });

        // Return success
        return { success: true, message: 'User Created', data: user };
    } catch( err ) {
        throw new Error('Error With User Registration');
    }
}

const registerAdmin = async (
    { name, email, role, password }: { name: string, email: string, password: string, role: UserRole }, 
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if user already exists
        const foundUser = await db.V2User.findOne({ email });
        if( foundUser ) return { success: false, message: 'Email Already Registered In DB' }
        
        // Create User
        const createdUser = new db.V2User({ name, email, role, password });
        await createdUser.save();

        const user = {
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            status: createdUser.status,
            createdAt: createdUser.createdAt,
            lastLogin: createdUser.lastLogin,
        }

        // Send notification
        await notificationutils.sendNotification({
            preferences: createdUser.preferences,
            recipient: createdUser._id,
            email: createdUser.email,
            title: 'Welcome to FUPRE Sports Media',
            subject: 'Welcome to FUPRE Sports Media',
            message: registrationMessage( createdUser.name, createdUser.role ),
            html: registrationHTML( createdUser.name, createdUser.role ),
        });

        // Log action
        await logutils.logAction({
            userId,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            action: LogAction.CREATE,
            entity: 'V2User',
            entityId: createdUser._id,
            message: `Admin ${ createdUser.email } Created By ${ userId }`
        });

        // Return success
        return { success: true, message: 'Admin Account Created', data: user };
    } catch( err ) {
        throw new Error('Error With Admin Registration');
    }
}

const loginUser = async (
    { email, password }: { email: string, password: string }, 
    { auditInfo }: { auditInfo: AuditInfo }
) => {
    try {
        // Check if user exists
        const foundUser = await db.V2User.findOne({ email });
        if( !foundUser ) return { success: false, message: 'Invalid Email' };

        // Check if password is coreect
        const isPasswordMatch = await foundUser.comparePassword( password );
        if( !isPasswordMatch ) return { success: false, message: 'Invalid Password' };

        // Generate jwt
        const token = generateToken({ _id: foundUser._id, email: foundUser.email, role: foundUser.role });

        // Update last login
        foundUser.lastLogin = new Date();
        await foundUser.save();

        // Log action
        await logutils.logAction({
            userId: foundUser._id,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            action: LogAction.LOGIN,
            entity: 'V2User',
            entityId: foundUser._id,
            message: `User ${ foundUser.email } Login`
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
    } catch( err ) {
        throw new Error('Error With User Login');
    }
}

const logoutUser = async (
    { auditInfo }: { auditInfo: AuditInfo }
) => {
    // Return success
    return { success: true, message: 'User Logged Out', data: null };
}

const generateOTP = async ({ email }: { email: string }) => {
    try {
        // Find user
        const foundUser = await  db.V2User.findOne({ email });
        if( !foundUser ) return { success: false, message: 'Invalid User' };

        // Generate otp
        const otp = otpUtils.setOtp( foundUser );
        await foundUser.save();

        // Send otp to email
        await otpUtils.sendOtpEmail( foundUser.email, otp );

        // Return success
        return { success: true, message: 'OTP sent to email', data: otp };
    } catch( err ) {
        throw new Error('Error Generating OTP');
    }
}

const verifyOTP = async (
    { email, otp }: { email: string, otp: string }
) => {
    try {
        console.log(otp)
        // Find user
        const user = await db.V2User.findOne({ email });
        if( !user ) return { success: false, message: 'Invalid User' };

        // Verify otp
        const verifiedOTP = otpUtils.verifyOtp( user, otp );
        if( !verifiedOTP ) return { success: false, message: 'Invalid/Expired Token' };

        // Clear otp from user
        user.otp = null;
        user.otpExpiresAt = null;
        user.status = user.status === UserStatus.SUSPENDED ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
        await user.save();

        // Generate jwt
        const token = generateToken( user );

        // Return success
        return {
            success: true,
            message: 'OTP Verified',
            data: { user, token }
        }
    } catch( err ) {
        throw new Error('Error Verifying OTP');
    }
}

const changePassword = async (
    { email, newPassword, confirmNewPassword }: { email: string, newPassword: string, confirmNewPassword: string },
    { auditInfo }: { auditInfo: AuditInfo }
) => {
    try {
        // Find user in database
        const foundUser = await db.V2User.findOne({ email });
        if( !foundUser ) return { success: false, message: 'User Not Found' };

        // Check if passwords match
        const matchingPasswords = newPassword === confirmNewPassword;
        if( !matchingPasswords ) return { success: false, message: 'Passwords Do Not Match' };

        // Change password
        foundUser.password = newPassword;
        await foundUser.save();

        // Log action
        await logutils.logAction({
            userId: foundUser._id,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            action: LogAction.UPDATE,
            entity: 'V2User',
            entityId: foundUser._id,
            message: `User ${ foundUser.email } Password Changed`
        });

        // Return success
        return { success: true, message: 'Password Changed Successfully', data: null };
    } catch( err ) {
        throw new Error('Error With User Registration');
    }
}

const service = {
    registerRegularUser,
    registerAdmin,
    loginUser,
    logoutUser,
    generateOTP,
    verifyOTP,
    changePassword
}

export default service;