import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IV2FootballLiveFixture } from '../../models/football/LiveFixture';
import db from '../../config/db';
import { LiveStatus } from '../../types/fixture.enums';

interface SocketService {
  io: Server;
  init: (httpServer: HttpServer) => void;
  emitMinuteUpdate: (fixtureId: string, minute: number, injuryTime?: number) => void;
  emitScoreUpdate: (fixtureId: string, result: IV2FootballLiveFixture['result']) => void;
  emitTimelineUpdate: (fixtureId: string, timeline: IV2FootballLiveFixture['timeline'][0]) => void;
  emitStatisticsUpdate: (fixtureId: string, statistics: IV2FootballLiveFixture['statistics']) => void;
  emitStatusUpdate: (fixtureId: string, status: LiveStatus) => void;
  emitGeneralInfoUpdate: (fixtureId: string, info: Partial<IV2FootballLiveFixture>) => void;
  emitCheerUpdate: (fixtureId: string, cheerMeter: IV2FootballLiveFixture['cheerMeter']) => void;
  emitPlayerOfTheMatchUpdate: (fixtureId: string, playerOfTheMatch: IV2FootballLiveFixture['playerOfTheMatch']) => void;
  emitLiveWatchersUpdate: (fixtureId: string, watchers: number) => void;
  emitSubstitutionUpdate: (fixtureId: string, substitution: IV2FootballLiveFixture['substitutions'][0]) => void;
  emitGoalScorersUpdate: (fixtureId: string, goalScorers: IV2FootballLiveFixture['goalScorers']) => void;
  stopMinuteTimer: (fixtureId: string) => void;
  startTimersForLiveFixtures: () => Promise<void>;
}

const socketService: SocketService = {
  io: null as unknown as Server,

  init(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        methods: ['GET', 'POST'],
      },
    });

    const watchers: Map<string, Set<string>> = new Map();

    this.io.on('connection', (socket: Socket) => {
      socket.on('joinFixture', (fixtureId: string) => {
        socket.join(fixtureId);
        if (!watchers.has(fixtureId)) {
          watchers.set(fixtureId, new Set());
        }
        watchers.get(fixtureId)!.add(socket.id);
        this.emitLiveWatchersUpdate(fixtureId, watchers.get(fixtureId)!.size);
      });

      socket.on('disconnect', () => {
        watchers.forEach((set, fixtureId) => {
          if (set.has(socket.id)) {
            set.delete(socket.id);
            this.emitLiveWatchersUpdate(fixtureId, set.size);
            if (set.size === 0) {
              watchers.delete(fixtureId);
            }
          }
        });
      });
    });

    const activeFixtures = new Map<string, NodeJS.Timeout>();
    const startMinuteTimer = (fixtureId: string, initialMinute: number, status: LiveStatus) => {
      if (status !== LiveStatus.FIRSTHALF && status !== LiveStatus.SECONDHALF && status !== LiveStatus.EXTRATIME) {
        return;
      }
      const timer = setInterval(() => {
        initialMinute += 2;
        this.emitMinuteUpdate(fixtureId, initialMinute);
      }, 120000);
      activeFixtures.set(fixtureId, timer);
    };

    this.stopMinuteTimer = (fixtureId: string) => {
      const timer = activeFixtures.get(fixtureId);
      if (timer) {
        clearInterval(timer);
        activeFixtures.delete(fixtureId);
      }
    };

    this.startTimersForLiveFixtures = async () => {
      const liveFixtures = await db.V2FootballLiveFixture.find({
        status: { $in: [LiveStatus.FIRSTHALF, LiveStatus.SECONDHALF, LiveStatus.EXTRATIME] },
      });
      for (const fixture of liveFixtures) {
        startMinuteTimer(fixture._id.toString(), fixture.currentMinute, fixture.status);
      }
    };
  },

  emitMinuteUpdate(fixtureId: string, minute: number, injuryTime?: number) {
    this.io.to(fixtureId).emit('fixture:minuteUpdate', { minute, injuryTime });
  },

  emitScoreUpdate(fixtureId: string, result: IV2FootballLiveFixture['result']) {
    this.io.to(fixtureId).emit('fixture:scoreUpdate', result);
  },

  emitTimelineUpdate(fixtureId: string, timeline: IV2FootballLiveFixture['timeline'][0]) {
    this.io.to(fixtureId).emit('fixture:timelineUpdate', timeline);
  },

  emitStatisticsUpdate(fixtureId: string, statistics: IV2FootballLiveFixture['statistics']) {
    this.io.to(fixtureId).emit('fixture:statisticsUpdate', statistics);
  },

  emitStatusUpdate(fixtureId: string, status: LiveStatus) {
    this.io.to(fixtureId).emit('fixture:statusUpdate', status);
  },

  emitGeneralInfoUpdate(fixtureId: string, info: Partial<IV2FootballLiveFixture>) {
    this.io.to(fixtureId).emit('fixture:generalInfoUpdate', info);
  },

  emitCheerUpdate(fixtureId: string, cheerMeter: IV2FootballLiveFixture['cheerMeter']) {
    this.io.to(fixtureId).emit('fixture:cheerUpdate', cheerMeter);
  },

  emitPlayerOfTheMatchUpdate(fixtureId: string, playerOfTheMatch: IV2FootballLiveFixture['playerOfTheMatch']) {
    this.io.to(fixtureId).emit('fixture:playerOfTheMatchUpdate', playerOfTheMatch);
  },

  emitLiveWatchersUpdate(fixtureId: string, watchers: number) {
    this.io.to(fixtureId).emit('fixture:liveWatchersUpdate', { watchers });
  },

  emitSubstitutionUpdate(fixtureId: string, substitution: IV2FootballLiveFixture['substitutions'][0]) {
    this.io.to(fixtureId).emit('fixture:substitutionUpdate', substitution);
  },

  emitGoalScorersUpdate(fixtureId: string, goalScorers: IV2FootballLiveFixture['goalScorers']) {
    this.io.to(fixtureId).emit('fixture:goalScorersUpdate', goalScorers);
  },

  stopMinuteTimer(fixtureId: string) {
    // Implemented in init
  },

  startTimersForLiveFixtures: async () => {
    // Implemented in init
  },
};

export default socketService;