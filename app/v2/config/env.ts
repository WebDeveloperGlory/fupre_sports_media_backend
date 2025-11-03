import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

interface Config {
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    NODEMAILER_USER: string;
    NODEMAILER_PASSWORD: string;
    OTP_EXPIRATION: number;
    ALLOWED_ORIGINS: string[];
    corsOptions: cors.CorsOptions;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
}

export const config: Config = {
    PORT: parseInt( process.env.PORT || '3000' ),
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'testingthisrandomstring',
    NODEMAILER_USER: process.env.NODEMAILER_USER || '',
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD || '',
    OTP_EXPIRATION: parseInt( process.env.OTP_EXPIRATION || '600' ),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [],
    corsOptions: {
        origin: ( origin, callback ) => {
            if ( !origin || config.ALLOWED_ORIGINS.includes( origin ) ) {
                callback( null, true );
            } else {
                callback( new Error( 'Not allowed by CORS' ) );
            }
        },
        credentials: true,
    },
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};