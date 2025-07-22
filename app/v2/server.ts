import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';

// ROUTE IMPORTS //
import authRoutes from './routes/general/authRoutes'; 
import departmentAndFacultyRoutes from './routes/general/departmentAndFacultyRoutes';
import blogRoutes from './routes/general/blogRoutes';
import userRoutes from './routes/general/userRoutes';
import teamRoutes from './routes/football/teamRoutes'; 
import fixtureRoutes from './routes/football/fixtureRoutes';
import liveFixtureRoutes from './routes/football/liveFixtureRoutes';
import playerRoutes from './routes/football/playerRoutes';
import adminRoutes from './routes/football/adminRoutes';
import adminDashboardRoutes from './routes/views/adminDashboardRoutes'; 
import { initializeSocket } from './config/socket';
// END OF ROUTE IMPORTS //

const app = express();
const server = http.createServer(app);

// MIDDLEWARES //
app.use( cors( config.corsOptions ) );
app.use( express.json() );
app.use(cookieParser());

// Initialize websockets
initializeSocket( server );

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
app.use('/deptnfac', departmentAndFacultyRoutes);
app.use('/blog', blogRoutes);
app.use('/user', userRoutes);
app.use('/live', liveFixtureRoutes);
app.use('/admin', adminRoutes);
app.use('/teams', teamRoutes);
app.use('/fixture', fixtureRoutes);
app.use('/player', playerRoutes);
app.use('/views', adminDashboardRoutes);
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