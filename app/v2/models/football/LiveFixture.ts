import { Schema, model, Document, ObjectId } from 'mongoose';
import { LiveStatus, FixtureResult, FixtureStat, TeamType, FixtureTimelineType, FixtureTimelineCardType, FixtureTimelineGoalType, FixtureLineup, FixtureSubstitutions, FixtureTimeline, FixtureOdds, FixturePlayerRatings, FixtureCommentaryType, FixtureCommentary, FixtureStreamLinks, FixtureCheerMeter, FixturePlayerOfTheMatch } from '../../types/fixture.enums';

export interface IV2FootballLiveFixture extends Document {
    _id: ObjectId;
    fixture: ObjectId;
    competition: ObjectId;
    homeTeam: ObjectId;
    awayTeam: ObjectId;
    matchType: string;
    stadium: string;
    matchDate: Date;
    kickoffTime: Date;
    referee: string;
    status: LiveStatus;
    currentMinute: number;
    injuryTime: number;
    result: FixtureResult;
    statistics: {
        home: FixtureStat,
        away: FixtureStat
    };
    lineups: {
        home: FixtureLineup,
        away: FixtureLineup
    };
    substitutions: FixtureSubstitutions[];
    timeline: FixtureTimeline[];
    commentary: FixtureCommentary[];
    streamLinks: FixtureStreamLinks[];
    cheerMeter: FixtureCheerMeter;
    playerOfTheMatch: FixturePlayerOfTheMatch;
    playerRatings: FixturePlayerRatings[];
    odds: FixtureOdds;
    attendance: number;
    weather: {
        condition: string,
        temperature: number
        humidity: number
    };
    createdAt: Date;
    updatedAt: Date;
}

const v2footballLivefixtureSchema = new Schema<IV2FootballLiveFixture>({
    fixture: { type: Schema.Types.ObjectId, ref: 'V2FootballFixture', required: true },
    competition: { type: Schema.Types.ObjectId, ref: 'V2FootballCompetition' },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam', required: true },
    matchType: {
        type: String,
        enum: ['friendly', 'competition'],
        default: 'competition'
    },
    stadium: { type: String },
    matchDate: { type: Date, required: true },
    kickoffTime: { type: Date, required: true },
    referee: { type: String },
    
    // Match status and progress
    status: {
        type: String,
        enum: Object.values( LiveStatus ),
        default: LiveStatus.PREMATCH
    },
    currentMinute: { type: Number, default: 0 },
    injuryTime: { type: Number, default: 0 },
    
    // Scores and results
    result: {
        homeScore: { type: Number, default: 0 },
        awayScore: { type: Number, default: 0 },
        halftimeHomeScore: { type: Number, default: null },
        halftimeAwayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null }
    },
    
    // Match statistics
    statistics: {
        home: {
            shotsOnTarget: { type: Number, default: 0 },
            shotsOffTarget: { type: Number, default: 0 },
            fouls: { type: Number, default: 0 },
            yellowCards: { type: Number, default: 0 },
            redCards: { type: Number, default: 0 },
            offsides: { type: Number, default: 0 },
            corners: { type: Number, default: 0 },
            possessionTime: { type: Number, default: 0 }, // in seconds
        },
        away: {
            shotsOnTarget: { type: Number, default: 0 },
            shotsOffTarget: { type: Number, default: 0 },
            fouls: { type: Number, default: 0 },
            yellowCards: { type: Number, default: 0 },
            redCards: { type: Number, default: 0 },
            offsides: { type: Number, default: 0 },
            corners: { type: Number, default: 0 },
            possessionTime: { type: Number, default: 0 }, // in seconds
        }
    },
    
    // Lineups and substitutions
    lineups: {
        home: {
            startingXI: [{
                player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
                position: String,
                shirtNumber: Number,
                isCaptain: Boolean
            }],
            substitutes: [{
                player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
                position: String,
                shirtNumber: Number
            }],
            formation: { type: String },
            coach: { type: String }
        },
        away: {
            startingXI: [{
                player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
                position: String,
                shirtNumber: Number,
                isCaptain: Boolean
            }],
            substitutes: [{
                player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
                position: String,
                shirtNumber: Number
            }],
            formation: { type: String },
            coach: { type: String }
        }
    },
    
    // Substitutions that have occurred
    substitutions: [{
        team: { type: String, enum: TeamType },
        playerOut: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        playerIn: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        minute: { type: Number },
        injury: { type: Boolean, default: false }
    }],
    
    // Match events timeline
    timeline: [{
        type: {
            type: String,
            enum: FixtureTimelineType,
            required: true
        },
        team: { type: String, enum: TeamType },
        player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        relatedPlayer: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' }, // For assists etc.
        minute: Number,
        injuryTime: Boolean,
        description: String,
        // Specific to goals
        goalType: {
            type: String,
            enum: FixtureTimelineGoalType
        },
        // Specific to cards
        cardType: {
            type: String,
            enum: FixtureTimelineCardType
        }
    }],
    
    // Commentary
    commentary: [{
        minute: Number,
        injuryTime: Boolean,
        type: {
            type: String,
            enum: FixtureCommentaryType
        },
        text: String,
        eventId: Schema.Types.ObjectId // Reference to timeline event if applicable
    }],
    
    // Streaming information
    streamLinks: [{
        platform: String,
        url: String,
        isOfficial: Boolean,
        requiresSubscription: Boolean
    }],
    
    // Fan engagement
    cheerMeter: {
        official: {
            home: { type: Number, default: 0 },
            away: { type: Number, default: 0 }
        },
        unofficial: {
            home: { type: Number, default: 0 },
            away: { type: Number, default: 0 }
        },
        userVotes: [{
            userId: Schema.Types.ObjectId,
            team: { type: String, enum: TeamType },
            isOfficial: Boolean,
            timestamp: Date
        }]
    },
    
    // Player of the match voting
    playerOfTheMatch: {
        official: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        fanVotes: [{
            player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            votes: { type: Number, default: 0 }
        }],
        userVotes: [{
            userId: Schema.Types.ObjectId,
            playerId: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
            timestamp: Date
        }]
    },
    
    // Player ratings
    playerRatings: [{
        player: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        team: { type: String, enum: TeamType },
        official: {
            rating: {
                type: Number, 
                min: 0, 
                max: 10,
                set: ( v: number ) => parseFloat(v.toFixed(1))
            },
            ratedBy: { 
                type: Schema.Types.ObjectId,
                ref: 'V2User' // Ref to admin/staff account
            },
        },
        fanRatings: {
            average: {
                type: Number,
                min: 0,
                max: 10,
                default: 0,
                set: (v: number) => parseFloat(v.toFixed(1))
            },
            count: { type: Number, default: 0 },
            distribution: { // Track rating distribution
                '1': { type: Number, default: 0 },
                '2': { type: Number, default: 0 },
                '3': { type: Number, default: 0 },
                '4': { type: Number, default: 0 },
                '5': { type: Number, default: 0 },
                '6': { type: Number, default: 0 },
                '7': { type: Number, default: 0 },
                '8': { type: Number, default: 0 },
                '9': { type: Number, default: 0 },
                '10': { type: Number, default: 0 }
            }
        },
        stats: {
            goals: Number,
            assists: Number,
            shots: Number,
            passes: Number,
            tackles: Number,
            saves: Number // for goalkeepers
        }
    }],
    
    // Betting odds
    odds: {
        preMatch: {
            homeWin: Number,
            draw: Number,
            awayWin: Number,
            overUnder: [{
                line: Number, // e.g., 2.5 for over/under 2.5 goals
                over: Number,
                under: Number
            }]
        },
        live: {
            updatedAt: Date,
            homeWin: Number,
            draw: Number,
            awayWin: Number,
            overUnder: [{
                line: Number,
                over: Number,
                under: Number
            }]
        }
    },
    
    // Additional metadata
    attendance: Number,
    weather: {
        condition: String,
        temperature: Number,
        humidity: Number
    },
}, {
    timestamps: true
});

export default model<IV2FootballLiveFixture>("V2FootballLiveFixture", v2footballLivefixtureSchema, "v2footballLivefixtures");