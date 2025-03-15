const { Schema, default: mongoose } = require('mongoose');

const competitionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sportType: { 
        type: String, 
        required: true,
        enum: [ 'football', 'chess', 'basketball', 'volleyball' ],
    },
    status: {
        type: String,
        enum: [ 'upcoming', 'ongoing', 'completed', 'cancelled' ],
        default: 'upcoming'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rounds: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'RefactoredUser' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'RefactoredUser' },
    createdAt: { type: Date, default: Date.now }
},{
    discriminatorKey: 'sportType',
    timestamps: true
})

// Indexes
competitionSchema.index({ name: 1 });
competitionSchema.index({ startDate: 1 });
competitionSchema.index({ sportType: 1 });
competitionSchema.index({ status: 1 });
competitionSchema.index({ createdBy: 1 });

module.exports = mongoose.model( 'RefactoredCompetition', competitionSchema );