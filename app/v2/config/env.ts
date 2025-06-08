import cors from 'cors';

interface Config {
    PORT: number;
    MONGO_URI: string;
    NODEMAILER_USER: string;
    NODEMAILER_PASSWORD: string;
    ALLOWED_ORIGINS: string[];
    corsOptions: cors.CorsOptions;
}

export const config: Config = {
    PORT: parseInt( process.env.PORT || '3000' ),
    MONGO_URI: process.env.MONGO_URI || '',
    NODEMAILER_USER: process.env.NODEMAILER_USER || '',
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD || '',
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
};