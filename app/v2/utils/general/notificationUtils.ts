import nodemailer from 'nodemailer';
import db from '../../config/db';
import { IV2Notification } from '../../models/general/Notification';
import { config } from '../../config/env';
import { UserPreference } from '../../models/general/User';
import { ObjectId } from 'mongoose';

export type NotificationParams = { 
    preferences: UserPreference;
    email?: string;
    subject?: string;
    html?: string;
    recipient: ObjectId;
    message: string;
    title: string;
}

const sendInAppNotification = async (
    { recipient, message, title }: { recipient: ObjectId, message: string, title: string }
) => {
    // Check if recipient exists
    const user = await db.V2User.findById( recipient );
    if ( !user ) {
        console.warn('No user found in request to send notification');
        return;
    }
    
    try {
        // Create the notification
        const notification = new db.V2Notification({ recipient, title, message });
        await notification.save();
    } catch( err ) {
        console.error('Error Creating Notification', err);
    }
}

const sendEmailNotification = async (
    { email, subject, html }: { email: string, subject: string, html: string }
) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.NODEMAILER_USER,
            pass: config.NODEMAILER_PASSWORD
        }
    });
    const mailOptions = {
        from: `"FSM Contact" <${ config.NODEMAILER_USER }>`,
        to: email,
        subject, html
    };
        
    try {
        await transporter.sendMail( mailOptions );
        console.log(`Email Sent`);
    } catch (error) {
        console.error('Error Sending Email:', error);
    }
}

const sendNotification = async(
    { preferences, email, subject, html, recipient, message, title }: NotificationParams
) => {
    if( preferences.notifications.email && email && subject && html ) {
        await sendEmailNotification({ email, subject, html })
            .then(() => console.log('Email Notification sent!'))
            .catch((err) => console.error('Email Error:', err.message));
    }

    if( preferences.notifications.inApp ) {
        await sendInAppNotification({ recipient, message, title })
            .then(() => console.log('In App Notification sent!'))
            .catch((err) => console.error('Notifiation Error:', err.message));
    }
}

export default {
    sendNotification
}