const express = require('express');
const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpecV1, swaggerSpecV2 } = require('./app/v1/config/swagger');
const { PORT, ALLOWED_ORIGINS } = require('./app/v1/config/env');
const { initializeWebSocket } = require('./app/v1/config/socket');

// V1 ROUTES //
const authRoutes = require('./app/v1/routes/authRoutes');
const teamRoutes = require('./app/v1/routes/teamRoutes');
const fixtureRoutes = require('./app/v1/routes/fixtureRoutes');
const competitionRoutes = require('./app/v1/routes/competitionRoutes');
const adminRoutes = require('./app/v1/routes/adminRoutes');
const liveFixtureRoutes = require('./app/v1/routes/liveFixtureRoutes');
const generalRoutes = require('./app/v1/routes/generalRoutes');
const playerRoutes = require('./app/v1/routes/playerRoutes');
const totsRoutes = require('./app/v1/routes/TOTSRoutes');
// END OF V1 ROUTES //

// V1.2 ROUTES //
const authenticationRoutes = require('./app/v1/routes/general/authRoutes');
const notificationRoutes = require('./app/v1/routes/general/notificationRoutes');
const userRoutes = require('./app/v1/routes/general/userRoutes');
const auditRoutes = require('./app/v1/routes/general/auditLogRoutes');
const footballPlayerRoutes = require('./app/v1/routes/football/footballPlayerRoutes');
const footballFixtureRoutes = require('./app/v1/routes/football/footballFixtureRoutes');
const footballTeamRoutes = require('./app/v1/routes/football/footballTeamRoutes');
const footballCompetitionRoutes = require('./app/v1/routes/football/footballCompetitionRoutes');
const footballTOTSRoutes = require('./app/v1/routes/football/footballTOTSRoutes');
// END OF V1.2 ROUTES //

// V1.2 VIEWS ROUTES //
const viewRoutes = require('./app/v1/routes/views/viewRoutes');
// END OF V1.2 VIEWS ROUTES //

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
app.use( '/api/v1.2/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerSpecV2 ) );

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

// V1.2 ROUTES //
app.use( '/api/v1.2/authentication', authenticationRoutes );
app.use( '/api/v1.2/notification', notificationRoutes );
app.use( '/api/v1.2/user', userRoutes );
app.use( '/api/v1.2/audit', auditRoutes );
app.use( '/api/v1.2/football/player', footballPlayerRoutes );
app.use( '/api/v1.2/football/fixture', footballFixtureRoutes );
app.use( '/api/v1.2/football/team', footballTeamRoutes );
app.use( '/api/v1.2/football/competition', footballCompetitionRoutes );
app.use( '/api/v1.2/football/tots', footballTOTSRoutes );
// END OF V1.2 ROUTES //

// V1.2 VIEWS ROUTES //
app.use( '/api/v1.2/views', viewRoutes );
// END OF V1.2 VIEWS ROUTES //

// V1 ROUTES //
app.use( '/api/auth', authRoutes );
app.use( '/api/teams', teamRoutes );
app.use( '/api/fixture', fixtureRoutes );
app.use( '/api/competition', competitionRoutes );
app.use( '/api/admin', adminRoutes );
app.use( '/api/live-fixtures', liveFixtureRoutes );
app.use( '/api/general', generalRoutes );
app.use( '/api/player', playerRoutes );
app.use( '/api/tots', totsRoutes );
// END OF V1 ROUTES //

// app.listen( PORT, () => {
//     console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
//     console.log(`Swagger Docs Available At: ${ APP_PORT }/api/api-docs`);
// });
server.listen( PORT, () => {
    console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
    console.log(`Swagger Docs Version 1 Available At: ${ APP_PORT }/api/v1/api-docs`);
    console.log(`Swagger Docs Version 2 Available At: ${ APP_PORT }/api/v1.2/api-docs`);
    console.log(`Websockets server running on port ${ APP_PORT }`);
});