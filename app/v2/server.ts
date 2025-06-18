import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/env';
import { getSocketService } from './services/websocket/liveFixtureSocketService';

// ROUTE IMPORTS //
import authRoutes from './routes/general/authRoutes';
// END OF ROUTE IMPORTS //

const app = express();
const server = http.createServer(app);

// MIDDLEWARES //
app.use( cors( config.corsOptions ) );
app.use( express.json() );

// Initialize websockets
getSocketService( server );

app.use((req, res, next) => {
    req.auditInfo = {
        ipAddress: req.ip || '',
        timestamp: new Date().toISOString(),
        route: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent') || '',
    };
    next();
});
// END OF MIDDLEWARES //

// TEST ROUTES //
app.use('/test', (req, res) => {
    res.json({ message: 'Test route working!' });
});
// END OF TEST ROUTES //

// ROUTES //
app.use('/auth', authRoutes);
// END OF ROUTES //

// Export for testing
export { app, server };

// START SERVER //
if ( require.main === module ) {
    server.listen( config.PORT, () => {
        console.log( `V2 Server running on port ${ config.PORT }` );
    } );
}
// END OF START SERVER //