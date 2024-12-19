const { Schema, default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: [ 'team-admin', 'super-admin', 'competition-admin' ],
        required: true
    },
    associatedTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    associatedCompetitions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Competition'
        }
    ],
    status: {
        type: String,
        enum: [ 'active', 'inactive', 'suspended' ],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    lastLogin: { type: Date },
    auditLogs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'AuditLog'
        }
    ]

});

userSchema.pre('save', async function (next) {
    if ( !this.isModified('password') ) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function( candidatePassword ) {
    return bcrypt.compare( candidatePassword, this.password );
};

module.exports = mongoose.model( 'User', userSchema );