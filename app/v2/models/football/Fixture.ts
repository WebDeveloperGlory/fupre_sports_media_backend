import { Schema, model, Document, ObjectId } from 'mongoose';
import { FixtureCommentary, FixtureCommentaryType, FixtureLineup, FixturePlayerOfTheMatch, FixturePlayerRatings, FixtureResult, FixtureStat, FixtureStatus, FixtureStreamLinks, FixtureSubstitutions, FixtureTimeline, FixtureTimelineCardType, FixtureTimelineGoalType, FixtureTimelineType, TeamType } from '../../types/fixture.enums';

export interface IV2FootballFixture extends Document {
    _id: ObjectId;
    competition: ObjectId;
    homeTeam: ObjectId;
    awayTeam: ObjectId;
    matchType: string;
    stadium: string;
    
    scheduledDate: Date;
    status: FixtureStatus;
    postponedReason: string;
    rescheduledDate: Date;

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

    playerOfTheMatch: FixturePlayerOfTheMatch;
    playerRatings: FixturePlayerRatings[];

    referee: string;
    attendance: number;
    weather: {
        condition: string,
        temperature: number
    };
    highlights: FixtureStreamLinks[];
    isDerby: Boolean;

    createdAt: Date;
    updatedAt: Date;
}

const v2footballfixtureSchema = new Schema<IV2FootballFixture>({
    competition: { type: Schema.Types.ObjectId, ref: 'V2FootballCompetition' },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'V2FootballTeam', required: true },
    matchType: {
        type: String,
        enum: ['friendly', 'competition'],
        default: 'competition'
    },
    stadium: { type: String },

    // Timing and Status
    scheduledDate: { type: Date, required: true },
    status: {
        type: String,
        enum: Object.values( FixtureStatus ),
        default: FixtureStatus.SCHEDULED
    },
    postponedReason: { type: String }, // Only if status=postponed
    rescheduledDate: { type: Date },   // For postponed matches

    // Scores, results and stats
    result: {
        homeScore: { type: Number, default: 0 },
        awayScore: { type: Number, default: 0 },
        halftimeHomeScore: { type: Number, default: null },
        halftimeAwayScore: { type: Number, default: null },
        homePenalty: { type: Number, default: null },
        awayPenalty: { type: Number, default: null }
    },
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
    substitutions: [{
        team: { type: String, enum: TeamType },
        playerOut: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        playerIn: { type: Schema.Types.ObjectId, ref: 'V2FootballPlayer' },
        minute: { type: Number },
        injury: { type: Boolean, default: false }
    }],

    // Timeline and commentary
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
    

    // Player of the match and ratings
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
    

    // Metadata
    referee: { type: String },
    attendance: { type: Number },
    weather: {
        condition: String,
        temperature: Number
    },
    highlights: [{
        platform: String,
        url: String,
        isOfficial: Boolean,
        requiresSubscription: Boolean
    }],
    isDerby: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Indexes
v2footballfixtureSchema.index({ competition: 1, season: 1, matchday: 1 });
v2footballfixtureSchema.index({ homeTeam: 1, awayTeam: 1 });
v2footballfixtureSchema.index({ scheduledDate: 1 });
v2footballfixtureSchema.index({ status: 1 });

// Pre-save hook for winner calculation
v2footballfixtureSchema.pre('save', function(next) {
    if (this.status === 'completed' && this.result.homeScore !== null && this.result.awayScore !== null) {
        const matchToPenalties = this.result.homePenalty !== null || this.result.awayPenalty !== null;

        this.result.winner = 
            matchToPenalties
                ? this.result.homePenalty > this.result.awayPenalty
                    ? 'home'
                    : this.result.awayPenalty > this.result.homePenalty 
                        ? 'away'
                        : 'draw'
                : this.result.homeScore > this.result.awayScore 
                    ? 'home' 
                    : this.result.awayScore > this.result.homeScore 
                        ? 'away' 
                        : 'draw';
    }

    next();
});

export default model<IV2FootballFixture>('V2FootballFixture', v2footballfixtureSchema, 'v2footballFixtures');