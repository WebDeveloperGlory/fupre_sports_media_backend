const express = require('express');
const cors = require('cors');
const { PORT } = require('./app/config/env');
const authRoutes = require('./app/routes/authRoutes');
const teamRoutes = require('./app/routes/teamRoutes');
const fixtureRoutes = require('./app/routes/fixtureRoutes');
const competitionRoutes = require('./app/routes/competitionRoutes');

const app = express();
const APP_PORT = PORT;

// MIDDLEWARES //
app.use( cors() );
app.use( express.json() );
// app.use( '/api/api-docs', swaggerUi.serve, swaggerUi.setup( swaggerSpec ) );
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
// END OF ROUTES //

app.listen( PORT, () => {
    console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
    // console.log(`Swagger Docs Available At: ${ APP_PORT }/api/api-docs`);
});