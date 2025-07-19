import { getIO } from "../config/socket";
import { IV2FootballLiveFixture } from "../models/football/LiveFixture";
import { LiveStatus } from "../types/fixture.enums";
import { getRoomCount } from "./socketEvents";

export const emitToRoom = (roomId: string, event: string, data: any) => {
    getIO().to(roomId).emit(event, data);
}

export const emitScoreUpdate = (roomId: string, result: IV2FootballLiveFixture['result']) => {
    getIO().to(roomId).emit('score-update', result);
}

export const emitMinuteUpdate = (roomId: string, minute: number, injuryTime?: number) => {
    getIO().to(roomId).emit('minute-update', { minute, injuryTime });
};

export const emitTimelineUpdate = (roomId: string, timeline: IV2FootballLiveFixture['timeline'][0]) => {
    getIO().to(roomId).emit('timeline-update', timeline);
};

export const emitStatisticsUpdate = (roomId: string, statistics: IV2FootballLiveFixture['statistics']) => {
    getIO().to(roomId).emit('statistics-update', statistics);
};

export const emitStatusUpdate = (roomId: string, status: LiveStatus) => {
    getIO().to(roomId).emit('status-update', status);
};

export const emitGeneralInfoUpdate = (roomId: string, info: Partial<IV2FootballLiveFixture>) => {
    getIO().to(roomId).emit('general-update', info);
};

export const emitCheerUpdate = (roomId: string, cheerMeter: IV2FootballLiveFixture['cheerMeter']) => {
    getIO().to(roomId).emit('cheer-update', cheerMeter);
};

export const emitPlayerOfTheMatchUpdate = (roomId: string, playerOfTheMatch: IV2FootballLiveFixture['playerOfTheMatch']) => {
    getIO().to(roomId).emit('potm-update', playerOfTheMatch);
};

export const emitSubstitutionUpdate = (roomId: string, substitution: IV2FootballLiveFixture['substitutions'][0]) => {
    getIO().to(roomId).emit('substitution-update', substitution);
};

export const emitGoalScorersUpdate = (roomId: string, goalScorers: IV2FootballLiveFixture['goalScorers']) => {
    getIO().to(roomId).emit('goalscorer-update', goalScorers);
};

export { getRoomCount };