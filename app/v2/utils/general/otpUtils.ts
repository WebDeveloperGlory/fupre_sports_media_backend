import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { config } from '../../config/env';
import { IV2User } from '../../models/general/User';

const generateOtp = (): string => {
    const otp = crypto.randomInt(1000, 10000);
    return otp.toString();
}

const setOtp = (user: IV2User): string => {
    const otp = generateOtp();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + (config.OTP_EXPIRATION * 1000));

    return otp;
}

const verifyOtp = (user: IV2User, otp: string): boolean => {
    const currentDate = new Date();

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < currentDate) {
        return false;
    }
    return user.otp === otp;
}

const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.NODEMAILER_USER,
            pass: config.NODEMAILER_PASSWORD
        }
    });

    const mailOptions = {
        from: `"FUPRE Sports Media" <noreply@fupresportsmedia.com>`,
        to: email,
        subject: 'Your OTP Code',
        html: `
            <div style="font-family: sans-serif; padding: 10px;">
                <h2>Your One-Time Password</h2>
                <p>Use the following OTP to complete your action:</p>
                <h3 style="color: #2e86de;">${otp}</h3>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error; // Consider throwing the error for the caller to handle
    }
};

export default {
    setOtp,
    verifyOtp,
    sendOtpEmail
};