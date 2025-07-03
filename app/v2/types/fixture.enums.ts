import { ObjectId } from "mongoose"

export enum LiveStatus {
    PREMATCH = 'pre-match', 
    FIRSTHALF = '1st-half', 
    HALFTIME = 'half-time', 
    SECONDHALF = '2nd-half', 
    EXTRATIME = 'extra-time', 
    PENALTIES = 'penalties', 
    FINISHED = 'finished', 
    POSTPONED = 'postponed', 
    ABANDONED = 'abandoned'
}

export enum FixtureStatus {
    SCHEDULED = 'scheduled', 
    LIVE = 'live', 
    COMPLETED = 'completed', 
    POSTPONED = 'postponed', 
    CANCELED = 'canceled'
}

export enum TeamType {
    HOME = 'home',
    AWAY = 'away'
}

export enum FixtureTimelineType {
    GOAL = 'goal', 
    YELLOWCARD = 'yellow-card', 
    REDCARD = 'red-card', 
    SUBSTITUTION = 'substitution',
    CORNER = 'corner',
    OFFSIDE = 'offside',
    PENALTYAWARDED = 'penalty-awarded', 
    PENALTYMISSED = 'penalty-missed', 
    PENALTYSAVED = 'penalty-saved', 
    OWNGOAL = 'own-goal', 
    VARDECISION = 'var-decision', 
    INJURY = 'injury'
}

export enum FixtureTimelineGoalType {
    REGULAR = 'regular', 
    PENALTY = 'penalty', 
    FREEKICK = 'free-kick', 
    HEADER = 'header', 
    OWNGOAL = 'own-goal'
}

export enum FixtureTimelineCardType {
    FIRSTYELLOW = 'first-yellow', 
    SECONDYELLOW = 'second-yellow', 
    STRAIGHTRED = 'straight-red'
}

export enum FixtureCommentaryType {
    IMPORTANT = 'important', 
    REGULAR = 'regular', 
    HIGHLIGHT = 'highlight'
}

export type FixtureResult = {
    homeScore: number,
    awayScore: number,
    halftimeHomeScore: number,
    halftimeAwayScore: number,
    homePenalty: number,
    awayPenalty: number,
    winner?: 'home' | 'away' | 'draw'
}

export type FixtureStat = {
    shotsOnTarget: number,
    shotsOffTarget: number,
    fouls: number,
    yellowCards: number,
    redCards: number,
    offsides: number,
    corners: number,
    possessionTime: number,
}

export type FixtureLineup = {
    startingXI: StartingXI[],
    substitutes: Substitute[],
    formation: string,
    coach: string,
}

export type FixtureSubstitutions = {
    id: string,
    team: TeamType,
    playerOut: ObjectId,
    playerIn: ObjectId,
    minute: number,
    injury: boolean
}

export type FixtureTimeline = {
    id: string,
    type: FixtureTimelineType,
    team: ObjectId,
    player: ObjectId,
    relatedPlayer: ObjectId,
    minute: number,
    injuryTime: boolean,
    description: string,
    goalType: FixtureTimelineGoalType,
    cardType: FixtureTimelineCardType
}

export type FixtureCommentary = {
    id: string,
    minute: number,
    injuryTime: boolean,
    type: FixtureCommentaryType,
    text: string,
    eventId: string
}

export type FixtureStreamLinks = {
    platform: string,
    url: string,
    isOfficial: boolean,
    requiresSubscription: boolean
}

export type FixtureCheerMeter = {
    official: {
        home: number,
        away: number
    },
    unofficial: {
        home: number,
        away: number
    },
    userVotes: UserCheerVote[]
}

export type FixturePlayerOfTheMatch = {
    official: ObjectId,
    fanVotes: FanPOTMVote[],
    userVotes: UserPOTMVote[]
}

export type FixturePlayerRatings = {
    player: ObjectId,
    team: TeamType,
    official: {
        rating: number,
        ratedBy: string,
    },
    fanRatings: {
        average: number,
        count: number,
        distribution: { 
            '1': number, '2': number, '3': number,
            '4': number, '5': number, '6': number,
            '7': number, '8': number, '9': number,
            '10': number
        },
    },
    stats: {
        goals: number,
        assists: number,
        shots: number,
        passes: number,
        tackles: number,
        saves: number
    }
}

export type FixtureOdds = {
    preMatch: PreMatchOdds,
    live: LiveOdds
}

type StartingXI = {
    player: ObjectId,
    position: string,
    shirtNumber: number,
    isCaptain: boolean,
}

type Substitute = {
    player: ObjectId,
    position: string,
    shirtNumber: number,
}

type PreMatchOdds = {
    homeWin: Number,
    draw: Number,
    awayWin: Number,
    overUnder: OverUnder[]
}

type LiveOdds = {
    updatedAt: Date,
    homeWin: number,
    draw: number,
    awayWin: number,
    overUnder: OverUnder[]
}

type OverUnder = {
    line: number,
    over: number,
    under: number
}

type UserCheerVote = {
    userId: ObjectId,
    team: TeamType,
    isOfficial: boolean,
    timestamp: Date
}

type UserPOTMVote = {
    userId: ObjectId,
    playerId: ObjectId,
    timestamp: Date
}

type FanPOTMVote = {
    player: ObjectId,
    votes: number,
}