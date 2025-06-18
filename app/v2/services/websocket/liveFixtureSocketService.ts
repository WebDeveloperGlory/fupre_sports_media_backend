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

interface MinuteData {
    currentMinute: number;
    injuryTime?: number;
    status: string;
}

export class SocketService {
    private io: SocketIOServer;
    private watchersCount: Map<string, Set<string>>;
    private minuteIntervals: Map<string, NodeJS.Timeout>;
    private activeFixtureData: Map<string, MinuteData>;

    constructor(server: HttpServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(','),
                methods: ['GET', 'POST'],
            },
        });
        this.watchersCount = new Map();
        this.minuteIntervals = new Map();
        this.activeFixtureData = new Map();

        this.initializeConnection();
    }

    private initializeConnection(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`);

            socket.on('join-fixture', async (fixtureId: string) => {
                socket.join(`fixture-${fixtureId}`);
                
                if (!this.watchersCount.has(fixtureId)) {
                    this.watchersCount.set(fixtureId, new Set());
                    this.startMinuteUpdates(fixtureId);
                }
                this.watchersCount.get(fixtureId)?.add(socket.id);
                
                // Send current data immediately
                await this.emitCurrentMinuteStatus(fixtureId);
                this.emitWatchersCount(fixtureId);
            });

            socket.on('leave-fixture', (fixtureId: string) => {
                socket.leave(`fixture-${fixtureId}`);
                
                if (this.watchersCount.has(fixtureId)) {
                    this.watchersCount.get(fixtureId)?.delete(socket.id);
                    
                    if (this.watchersCount.get(fixtureId)?.size === 0) {
                        this.watchersCount.delete(fixtureId);
                        this.stopMinuteUpdates(fixtureId);
                        this.activeFixtureData.delete(fixtureId);
                    }
                    this.emitWatchersCount(fixtureId);
                }
            });

            socket.on('get-watchers-count', (fixtureId: string, callback: (count: number) => void) => {
                callback(this.getWatchersCount(fixtureId));
            });

            socket.on('disconnect', () => {
                this.watchersCount.forEach((sockets, fixtureId) => {
                    if (sockets.has(socket.id)) {
                        sockets.delete(socket.id);
                        if (sockets.size === 0) {
                            this.watchersCount.delete(fixtureId);
                            this.stopMinuteUpdates(fixtureId);
                            this.activeFixtureData.delete(fixtureId);
                        }
                        this.emitWatchersCount(fixtureId);
                    }
                });
            });
        });
    }

    private startMinuteUpdates(fixtureId: string): void {
        this.stopMinuteUpdates(fixtureId);
        
        const emitMinuteUpdate = async () => {
            try {
                const fixture = await db.V2FootballLiveFixture.findById(fixtureId)
                    .select('currentMinute injuryTime status')
                    .lean<Pick<IV2FootballLiveFixture, 'currentMinute' | 'injuryTime' | 'status'>>();
                
                if (fixture) {
                    const minuteData: MinuteData = {
                        currentMinute: fixture.currentMinute,
                        injuryTime: fixture.injuryTime,
                        status: fixture.status
                    };
                    this.activeFixtureData.set(fixtureId, minuteData);
                    
                    this.io.to(`fixture-${fixtureId}`).emit('minute-update', {
                        ...minuteData,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error(`Error in minute update for ${fixtureId}:`, error);
            }
        };

        // Initial update
        emitMinuteUpdate();
        
        // Set interval (120000ms = 2 minutes)
        const interval = setInterval(emitMinuteUpdate, 120000);
        this.minuteIntervals.set(fixtureId, interval);
    }

    private stopMinuteUpdates(fixtureId: string): void {
        const interval = this.minuteIntervals.get(fixtureId);
        if (interval) {
            clearInterval(interval);
            this.minuteIntervals.delete(fixtureId);
        }
    }

    private async emitCurrentMinuteStatus(fixtureId: string): Promise<void> {
        const cachedData = this.activeFixtureData.get(fixtureId);
        if (cachedData) {
            this.io.to(`fixture-${fixtureId}`).emit('minute-update', {
                currentMinute: cachedData.currentMinute,
                injuryTime: cachedData.injuryTime,
                status: cachedData.status,
                timestamp: new Date()
            });
            return;
        }

        const fixture = await db.V2FootballLiveFixture.findById(fixtureId)
            .select('currentMinute injuryTime status')
            .lean<Pick<IV2FootballLiveFixture, 'currentMinute' | 'injuryTime' | 'status'>>();
        
        if (fixture) {
            const minuteData: MinuteData = {
                currentMinute: fixture.currentMinute,
                injuryTime: fixture.injuryTime,
                status: fixture.status
            };
            this.activeFixtureData.set(fixtureId, minuteData);
            
            this.io.to(`fixture-${fixtureId}`).emit('minute-update', {
                ...minuteData,
                timestamp: new Date()
            });
        }
    }

    private getWatchersCount(fixtureId: string): number {
        return this.watchersCount.get(fixtureId)?.size || 0;
    }

    private emitWatchersCount(fixtureId: string): void {
        this.io.to(`fixture-${fixtureId}`).emit('watchers-count', {
            count: this.getWatchersCount(fixtureId)
        });
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
            
            // Update the emitFixtureUpdate method's cache update logic:
            if (updateType === 'status' || updateType === 'score') {
                const cachedData = this.activeFixtureData.get(fixtureId) || {
                    currentMinute: 0,
                    status: ''
                };
                this.activeFixtureData.set(fixtureId, {
                    currentMinute: data.currentMinute || cachedData.currentMinute,
                    status: data.status || cachedData.status,
                    injuryTime: data.injuryTime || cachedData.injuryTime
                });
            }
        } catch (error) {
            console.error(`Error emitting update for fixture ${fixtureId}:`, error);
        }
    }

    // =====================
    // Public Methods
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

    async emitCustomEvent(fixtureId: string, eventType: string, payload: any): Promise<void> {
        await this.emitFixtureUpdate(fixtureId, eventType, payload);
    }

    async forceMinuteUpdate(fixtureId: string): Promise<void> {
        await this.emitCurrentMinuteStatus(fixtureId);
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