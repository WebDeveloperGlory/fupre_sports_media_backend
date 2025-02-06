const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./app/config/swagger');
const { PORT } = require('./app/config/env');
const authRoutes = require('./app/routes/authRoutes');
const teamRoutes = require('./app/routes/teamRoutes');
const fixtureRoutes = require('./app/routes/fixtureRoutes');
const competitionRoutes = require('./app/routes/competitionRoutes');
const adminRoutes = require('./app/routes/adminRoutes');

const app = express();
const APP_PORT = PORT;

// CORS SETTINGS //
const allowedOrigins = [ 'http://localhost:3000', 'http://localhost:5000', 'https://fupre-sports.netlify.app' ];
const corsOptions = {
    origin: ( origin, callback ) => {
        if ( !origin || allowedOrigins.includes( origin ) ) {
            callback( null, true );
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
// END OF CORS SETTINGS //

// MIDDLEWARES //
app.use( cors( corsOptions ) );
// app.use( cors() );
app.use( express.json() );
app.use( '/api/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerSpec ) );
// END OF MIDDLEWARES //

// TEST ROUTE //
app.get( '/', ( req, res ) => {
    res.send( 'Deployed And Working with CORS for testing' );
});
//END OF TEST ROUTES //

// ROUTES //
app.use( '/api/auth', authRoutes );
app.use( '/api/teams', teamRoutes );
app.use( '/api/fixture', fixtureRoutes );
app.use( '/api/competition', competitionRoutes );
app.use( '/api/admin', adminRoutes );
// END OF ROUTES //

app.listen( PORT, () => {
    console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
    console.log(`Swagger Docs Available At: ${ APP_PORT }/api/api-docs`);
});