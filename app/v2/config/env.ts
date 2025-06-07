import cors from 'cors';

interface Config {
    PORT: number;
    MONGO_URI: string;
    ALLOWED_ORIGINS: string[];
    corsOptions: cors.CorsOptions;
}

export const config: Config = {
    PORT: parseInt( process.env.PORT || '3000' ),
    MONGO_URI: process.env.MONGO_URI || '',
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