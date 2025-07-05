// app/v1/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpecV1, swaggerSpecV2 } = require('./config/swagger');

const app = express();
const server = http.createServer(app);

module.exports = (config) => {
    // CORS SETTINGS
    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || config.ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    };

    // MIDDLEWARES //
    app.use(cors(corsOptions));
    app.use(express.json());

    // Swagger docs
    app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecV1));
    app.use('/api/v1.2/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecV2));

    // Audit middleware
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
    app.get('/', (req, res) => {
        res.send('V1 Server Working');
    });
    // END OF TEST ROUTE //

    // V1 ROUTES //
    const authRoutes = require('./routes/authRoutes');
    const teamRoutes = require('./routes/teamRoutes');
    const fixtureRoutes = require('./routes/fixtureRoutes');
    const competitionRoutes = require('./routes/competitionRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const liveFixtureRoutes = require('./routes/liveFixtureRoutes');
    const generalRoutes = require('./routes/generalRoutes');
    const playerRoutes = require('./routes/playerRoutes');
    const totsRoutes = require('./routes/TOTSRoutes');
    // END OF V1 ROUTES //

    // V1 ROUTE MOUNT //
    app.use( '/api/auth', authRoutes );
    app.use( '/api/teams', teamRoutes );
    app.use( '/api/fixture', fixtureRoutes );
    app.use( '/api/competition', competitionRoutes );
    app.use( '/api/admin', adminRoutes );
    app.use( '/api/live-fixtures', liveFixtureRoutes );
    app.use( '/api/general', generalRoutes );
    app.use( '/api/player', playerRoutes );
    app.use( '/api/tots', totsRoutes );
    // END OF V1 ROUTE MOUNT //

    // V1.2 ROUTES //
    const authenticationRoutes = require('./routes/general/authRoutes');
    const notificationRoutes = require('./routes/general/notificationRoutes');
    const userRoutes = require('./routes/general/userRoutes');
    const auditRoutes = require('./routes/general/auditLogRoutes');
    const footballPlayerRoutes = require('./routes/football/footballPlayerRoutes');
    const footballFixtureRoutes = require('./routes/football/footballFixtureRoutes');
    const footballTeamRoutes = require('./routes/football/footballTeamRoutes');
    const footballCompetitionRoutes = require('./routes/football/footballCompetitionRoutes');
    const footballTOTSRoutes = require('./routes/football/footballTOTSRoutes');
    const viewRoutes = require('./routes/views/viewRoutes');
    // END OF V1.2 ROUTES //

    // V1.2 ROUTE MOUNT //
    app.use( '/api/v1.2/authentication', authenticationRoutes );
    app.use( '/api/v1.2/notification', notificationRoutes );
    app.use( '/api/v1.2/user', userRoutes );
    app.use( '/api/v1.2/audit', auditRoutes );
    app.use( '/api/v1.2/football/player', footballPlayerRoutes );
    app.use( '/api/v1.2/football/fixture', footballFixtureRoutes );
    app.use( '/api/v1.2/football/team', footballTeamRoutes );
    app.use( '/api/v1.2/football/competition', footballCompetitionRoutes );
    app.use( '/api/v1.2/football/tots', footballTOTSRoutes );
    app.use( '/api/v1.2/views', viewRoutes );
    // END OF V1.2 ROUTE MOUNT //

    return { app, server };
};