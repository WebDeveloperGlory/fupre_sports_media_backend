import { Server, Socket } from 'socket.io';
import { IV2FootballLiveFixture } from '../models/football/LiveFixture';
import db from '../config/db';
import { LiveStatus } from '../types/fixture.enums';

interface SocketEvents {

}
type SocketHandler = (io: Server, socket: Socket) => void;

const roomCounts = new Map<string, number>();
const watchers: Map<string, Set<string>> = new Map();

const handleConnection: SocketHandler = (io, socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join room
    socket.on('join-room', (roomId: string) => {
        // Join new room
        socket.join(roomId);

        // Update watchers
        if (!watchers.has(roomId)) {
          watchers.set(roomId, new Set());
        }
        watchers.get(roomId)!.add(socket.id);

        // Broadcast updated count
        io.to(roomId).emit('room-count-update', { watchers: watchers.get(roomId)?.size });

        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
        console.log(`User ${socket.id} disconnected (reason: ${reason})`);
        
        watchers.forEach((set, roomId) => {
          if (set.has(socket.id)) {
            set.delete(socket.id);
            // Broadcast updated count
            io.to(roomId).emit('room-count-update', { watchers: watchers.get(roomId)?.size });
            if (set.size === 0) {
              watchers.delete(roomId);
            }
          }
        });
    });

    // Error handling
    socket.on('error', (err) => {
        console.log(`Socket error for ${socket.id}:`, err);
    })
};

export const getRoomCount = (roomId: string) => {
    return roomCounts.get(roomId) || 0;
};
export const registerSocketEvents = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        handleConnection(io, socket);
    })
}