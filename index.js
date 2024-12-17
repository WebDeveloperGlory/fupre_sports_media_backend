const express = require('express');
const { PORT } = require('./app/config/env');
const cors = require('cors');

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

// END OF ROUTES //

app.listen( PORT, () => {
    console.log(`Fupre Sports Media Server Running On Port: ${ APP_PORT }`);
    // console.log(`Swagger Docs Available At: ${ APP_PORT }/api/api-docs`);
});