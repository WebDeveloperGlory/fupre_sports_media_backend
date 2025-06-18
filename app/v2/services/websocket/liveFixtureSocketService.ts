import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { IV2FootballLiveFixture } from '../../models/football/LiveFixture';
import db from '../../config/db';
import { Types } from 'mongoose';

interface FixtureUpdatePayload {
    type: string;
    data: any;
    fixtureId: Types.ObjectId | string;
}

export class SocketService {
    private io: SocketIOServer;
    private watchersCount: Map<string, Set<string>>; // Track watchers per fixture: { fixtureId: Set<socketId> }

    constructor(server: HttpServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(','),
                methods: ['GET', 'POST'],
            },
        });
        this.watchersCount = new Map();

        this.initializeConnection();
    }

    private initializeConnection(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`);

            socket.on('join-fixture', (fixtureId: string) => {
                socket.join(`fixture-${fixtureId}`);
                console.log(`Socket ${socket.id} joined fixture-${fixtureId}`);
                
                // Track the socket in the fixture's watchers
                if (!this.watchersCount.has(fixtureId)) {
                    this.watchersCount.set(fixtureId, new Set());
                }
                this.watchersCount.get(fixtureId)?.add(socket.id);
                
                // Notify about watchers count update
                this.emitWatchersCount(fixtureId);
            });

            socket.on('leave-fixture', (fixtureId: string) => {
                socket.leave(`fixture-${fixtureId}`);
                console.log(`Socket ${socket.id} left fixture-${fixtureId}`);
                
                // Remove the socket from the fixture's watchers
                if (this.watchersCount.has(fixtureId)) {
                    this.watchersCount.get(fixtureId)?.delete(socket.id);
                    
                    // Clean up if empty
                    if (this.watchersCount.get(fixtureId)?.size === 0) {
                        this.watchersCount.delete(fixtureId);
                    }
                    
                    // Notify about watchers count update
                    this.emitWatchersCount(fixtureId);
                }
            });

            socket.on('get-watchers-count', (fixtureId: string, callback: (count: number) => void) => {
                const count = this.getWatchersCount(fixtureId);
                callback(count);
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
                
                // Remove the socket from all fixtures it was watching
                this.watchersCount.forEach((sockets, fixtureId) => {
                    if (sockets.has(socket.id)) {
                        sockets.delete(socket.id);
                        
                        // Clean up if empty
                        if (sockets.size === 0) {
                            this.watchersCount.delete(fixtureId);
                        }
                        
                        // Notify about watchers count update
                        this.emitWatchersCount(fixtureId);
                    }
                });
            });
        });
    }

    private getWatchersCount(fixtureId: string): number {
        return this.watchersCount.get(fixtureId)?.size || 0;
    }

    private emitWatchersCount(fixtureId: string): void {
        const count = this.getWatchersCount(fixtureId);
        this.io.to(`fixture-${fixtureId}`).emit('watchers-count', { count });
    }

    private async emitFixtureUpdate(fixtureId: string, updateType: string, data: any): Promise<void> {
        try {
            const fixture = await db.V2FootballLiveFixture.findById(fixtureId).lean<IV2FootballLiveFixture>();
            if (!fixture) {
                console.error(`Fixture ${fixtureId} not found`);
                return;
            }

        const payload: FixtureUpdatePayload = {
            type: updateType,
            data: { ...data, timestamp: new Date() },
            fixtureId,
        };

            this.io.to(`fixture-${fixtureId}`).emit('fixture-update', payload);
            console.log(`Emitted ${updateType} update for fixture ${fixtureId}`);
        } catch (error) {
            console.error(`Error emitting update for fixture ${fixtureId}:`, error);
        }
    }

    // =====================
    // Specific Emitters
    // =====================

    async emitScoreUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'result status currentMinute').lean<IV2FootballLiveFixture>();
        if (fixture) {
            await this.emitFixtureUpdate(fixtureId, 'score', {
                result: fixture.result,
                status: fixture.status,
                currentMinute: fixture.currentMinute,
            });
        }
    }

    async emitTimelineEvent(fixtureId: string, event: any): Promise<void> {
        await this.emitFixtureUpdate(fixtureId, 'timeline-event', { event });
    }

    async emitStatisticsUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'statistics').lean<IV2FootballLiveFixture>();
        if (fixture) {
            await this.emitFixtureUpdate(fixtureId, 'statistics', fixture.statistics);
        }
    }

    async emitStatusUpdate(fixtureId: string, status: string, currentMinute: number): Promise<void> {
        await this.emitFixtureUpdate(fixtureId, 'status', { status, currentMinute });
    }

    async emitLineupUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'lineups substitutions').lean<IV2FootballLiveFixture>();
        if (fixture) {
            await this.emitFixtureUpdate(fixtureId, 'lineup', {
                lineups: fixture.lineups,
                substitutions: fixture.substitutions,
            });
        }
    }

    async emitCheerUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'cheerMeter').lean<IV2FootballLiveFixture>();
        if (fixture) {
            await this.emitFixtureUpdate(fixtureId, 'cheer', fixture.cheerMeter);
        }
    }

    async emitPlayerOfTheMatchUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'playerOfTheMatch').lean<IV2FootballLiveFixture>();
        if (fixture) {
        await this.emitFixtureUpdate(fixtureId, 'player-of-the-match', fixture.playerOfTheMatch);
        }
    }

    // Optional generic method if needed
    async emitCustomEvent(fixtureId: string, eventType: string, payload: any): Promise<void> {
        await this.emitFixtureUpdate(fixtureId, eventType, payload);
    }
}

let socketServiceInstance: SocketService | null = null;

export const getSocketService = (server?: HttpServer): SocketService => {
    if (!socketServiceInstance && server) {
        socketServiceInstance = new SocketService(server);
    }
    if (!socketServiceInstance) {
        throw new Error('SocketService not initialized. Call getSocketService(server) first.');
    }
    return socketServiceInstance;
};