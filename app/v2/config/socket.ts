import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerSocketEvents } from '../events/socketEvents';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
    console.log('[Socket.IO] Initializing...');
    console.log(`[Socket.IO] Allowed origins: ${process.env.ALLOWED_ORIGINS || 'NOT_SET'}`);
    
    io = new Server(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(','),
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'] // Explicit transport logging
    });

    // Minimal connection logging for debug
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] New connection: ${socket.id} (Origin: ${socket.handshake.headers.origin})`);
    });

    registerSocketEvents(io); // Your existing event registration
    
    console.log('[Socket.IO] Ready');
    return io;
};

export const getIO = () => {
    if (!io) {
        console.error('[Socket.IO] Access attempted before initialization');
        throw new Error('Socket.io not initialized');
    }
    return io;
};