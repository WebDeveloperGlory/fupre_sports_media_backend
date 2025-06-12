import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import db from '../../config/db';

interface FixtureUpdateData {
    [key: string]: any;
}

class SocketService {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            methods: ['GET', 'POST']
        }
        });

        this.initializeConnection();
        this.initializeRooms();
    }

    private initializeConnection(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`New client connected: ${socket.id}`);

            socket.on('join-fixture', (fixtureId: string) => {
                socket.join(`fixture-${fixtureId}`);
                console.log(`Socket ${socket.id} joined fixture-${fixtureId}`);
            });

            socket.on('leave-fixture', (fixtureId: string) => {
                socket.leave(`fixture-${fixtureId}`);
                console.log(`Socket ${socket.id} left fixture-${fixtureId}`);
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

  private initializeRooms(): void {
    // Placeholder for persistent room setup if needed
  }

    private async emitFixtureUpdate(fixtureId: string, updateType: string, data: FixtureUpdateData): Promise<void> {
        try {
            const fixture = await db.V2FootballLiveFixture.findById(fixtureId).lean();
            if (!fixture) {
                console.error(`Fixture ${fixtureId} not found`);
                return;
            }

            this.io.to(`fixture-${fixtureId}`).emit('fixture-update', {
                type: updateType,
                data: {
                ...data,
                timestamp: new Date()
                },
                fixtureId
            });

            console.log(`Emitted ${updateType} update for fixture ${fixtureId}`);
        } catch (error) {
            console.error(`Error emitting update for fixture ${fixtureId}:`, error);
        }
    }

    async emitScoreUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'result status currentMinute').lean();
        if (!fixture) return;
        this.emitFixtureUpdate(fixtureId, 'score', {
            result: fixture.result,
            status: fixture.status,
            currentMinute: fixture.currentMinute
        });
    }

    async emitTimelineEvent(fixtureId: string, event: any): Promise<void> {
        this.emitFixtureUpdate(fixtureId, 'timeline-event', { event });
    }

    async emitStatisticsUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'statistics').lean();
        if (!fixture) return;
        this.emitFixtureUpdate(fixtureId, 'statistics', fixture.statistics);
    }

    async emitStatusUpdate(fixtureId: string, status: string, currentMinute: number): Promise<void> {
        this.emitFixtureUpdate(fixtureId, 'status', { status, currentMinute });
    }

    async emitLineupUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'lineups substitutions').lean();
        if (!fixture) return;
        this.emitFixtureUpdate(fixtureId, 'lineup', {
            lineups: fixture.lineups,
            substitutions: fixture.substitutions
        });
    }

    async emitCheerUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'cheerMeter').lean();
        if (!fixture) return;
        this.emitFixtureUpdate(fixtureId, 'cheer', fixture.cheerMeter);
    }

    async emitPlayerOfTheMatchUpdate(fixtureId: string): Promise<void> {
        const fixture = await db.V2FootballLiveFixture.findById(fixtureId, 'playerOfTheMatch').lean();
        if (!fixture) return;
        this.emitFixtureUpdate(fixtureId, 'player-of-the-match', fixture.playerOfTheMatch);
    }
}

export default SocketService;