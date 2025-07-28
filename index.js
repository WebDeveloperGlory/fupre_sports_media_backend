const express = require('express');
const http = require('http');
const { PORT, ALLOWED_ORIGINS } = require('./app/v1/config/env');
// const { initializeWebSocket } = require('./app/v1/config/socket');

// Import v1 server
const createV1Server = require('./app/v1/server');
const v1 = createV1Server({ ALLOWED_ORIGINS });

// Import v2 server (TypeScript)
let v2;
try {
    v2 = require('./dist/app/v2/server');
} catch (err) {
    console.warn('V2 server not available', err.message);
}

const mainApp = express();
const server = http.createServer(mainApp);

// Initialize WebSocket
// initializeWebSocket(server, {
//     origin: (origin, callback) => {
//         if (!origin || ALLOWED_ORIGINS.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true
// });

// Mount v1 and v2 apps
mainApp.use( v1.app );
if (v2) {
    mainApp.use( '/api/v2', v2.app );
    v2.initializeSocket(server);
}

// Health check
mainApp.get('/', ( req, res ) => {
    res.send('Fupre Sports Media API is running');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`V1 Docs: http://localhost:${PORT}/api/v1/api-docs`);
    if (v2) {
        console.log(`V2 Docs: http://localhost:${PORT}/api/v2/api-docs`);
    }
});