const express = require('express');
const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpecV1, swaggerSpecV2 } = require('./app/config/swagger');
const { PORT, ALLOWED_ORIGINS } = require('./app/config/env');
const { initializeWebSocket } = require('./app/config/socket');
const authRoutes = require('./app/routes/authRoutes');
const teamRoutes = require('./app/routes/teamRoutes');
const fixtureRoutes = require('./app/routes/fixtureRoutes');
const competitionRoutes = require('./app/routes/competitionRoutes');
const adminRoutes = require('./app/routes/adminRoutes');
const liveFixtureRoutes = require('./app/routes/liveFixtureRoutes');
const generalRoutes = require('./app/routes/generalRoutes');
const playerRoutes = require('./app/routes/playerRoutes');

const authenticationRoutes = require('./app/routes/general/authRoutes');
const userRoutes = require('./app/routes/general/userRoutes');
const auditRoutes = require('./app/routes/general/auditLogRoutes');
const footballPlayerRoutes = require('./app/routes/football/footballPlayerRoutes');
const footballFixtureRoutes = require('./app/routes/football/footballFixtureRoutes');
const footballTeamRoutes = require('./app/routes/football/footballTeamRoutes');
const footballCompetitionRoutes = require('./app/routes/football/footballCompetitionRoutes');
const footballTOTSRoutes = require('./app/routes/football/footballTOTSRoutes');

const app = express();
const APP_PORT = PORT;
const server = http.createServer( app );

// CORS SETTINGS //
const allowedOrigins = ALLOWED_ORIGINS;
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
app.use( express.json() );

app.use( '/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerSpecV1 ) );
app.use( '/api/v2/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerSpecV2 ) );

initializeWebSocket( server, corsOptions );
app.use((req, res, next) => {
    req.auditInfo = {
        ipAddress: req.ip,
        timestamp: new Date().toISOString(),
        route: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
    };
    next();
});
// END OF MIDDLEWARES //

// TEST ROUTE //
app.get( '/', ( req, res ) => {
    res.send( 'Deployed And Working with CORS for testing' );
});
//END OF TEST ROUTES //

// ROUTES //
app.use( '/api/v2/authentication', authenticationRoutes );
app.use( '/api/v2/user', userRoutes );
app.use( '/api/v2/audit', auditRoutes );
app.use( '/api/v2/football/player', footballPlayerRoutes );
app.use( '/api/v2/football/fixture', footballFixtureRoutes );
app.use( '/api/v2/football/team', footballTeamRoutes );
app.use( '/api/v2/football/competition', footballCompetitionRoutes );
app.use( '/api/v2/football/tots', footballTOTSRoutes );

app.use( '/api/auth', authRoutes );
app.use( '/api/teams', teamRoutes );
app.use( '/api/fixture', fixtureRoutes );
app.use( '/api/competition', competitionRoutes );
app.use( '/api/admin', adminRoutes );
app.use( '/api/live-fixtures', liveFixtureRoutes );
app.use( '/api/general', generalRoutes );
app.use( '/api/player', playerRoutes );
// END OF ROUTES //

// app.listen( PORT, () => {
//     console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
//     console.log(`Swagger Docs Available At: ${ APP_PORT }/api/api-docs`);
// });
server.listen( PORT, () => {
    console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
    console.log(`Swagger Docs Version 1 Available At: ${ APP_PORT }/api/v1/api-docs`);
    console.log(`Swagger Docs Version 2 Available At: ${ APP_PORT }/api/v2/api-docs`);
    console.log(`Websockets server running on port ${ APP_PORT }`);
});