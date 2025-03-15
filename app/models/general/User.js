const { Schema, default: mongoose } = require('mongoose');

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: [ 'user', 'superAdmin', 'mediaAdmin', 'headMediaAdmin', 'sportAdmin' ],
        required: true
    },
    sports: [{
        sport: { type: String }, // e.g., "football", "chess", "basketball"
        enum: [ 'football', 'chess', 'basketball', 'volleyball' ],
        role: { 
            type: String, 
            enum: [ 'competitionAdmin', 'teamAdmin', 'liveMatchAdmin', 'specialRole' ] 
        }
    }],
    mediaAccess: [{
        // competition: { 
        //     type: Schema.Types.ObjectId, 
        //     ref: 'Competition' 
        // },
        role: { 
            type: String, 
            enum: [ 'mediaAdmin', 'headMediaAdmin' ] 
        }
    }],
    status: {
        type: String,
        enum: [ 'active', 'inactive', 'suspended' ],
        default: 'active'
    },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
    if ( !this.isModified('password') ) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model( 'User', userSchema );