import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerSocketEvents } from '../events/socketEvents';

let io: Server;

export const initializeSocket = ( httpServer: HttpServer ) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(','),
            methods: ['GET', 'POST'],
        }
    });

    registerSocketEvents(io);
    
    return io;
};

export const getIO = () => {
    if(!io) throw new Error('Socket.io not iniialized');
    return io;
}