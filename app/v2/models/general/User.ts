import { Schema, model, Document, ObjectId } from "mongoose";
import bcrypt from 'bcrypt';
import { UserRole, SportType, UserStatus } from "../../types/user.enums";

export type UserPreference = {
    notifications: {
        inApp: boolean;
        email: boolean;
    }
}

export interface IV2User extends Document {
    _id: ObjectId;
    name: string;
    password: string;
    email: string;
    role: UserRole;
    sport: SportType;
    status: UserStatus;
    otp: string | null;
    otpExpiresAt: Date | null;
    lastLogin: Date | null;
    passwordChangedAt: Date | null;
    preferences: UserPreference;
    comparePassword: ( password: string ) => Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

const v2userSchema = new Schema<IV2User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values( UserRole ),
        default: UserRole.USER
    },
    sport: {
        type: String,
        enum: Object.values( SportType ),
        default: null
    },
    status: {
        type: String,
        enum: Object.values( UserStatus ),
        default: UserStatus.ACTIVE
    },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    preferences: {
        notifications: {
            inApp: { type: Boolean, default: true },
            email: { type: Boolean, default: false },
        }
    }
}, {
    timestamps: true,
});

v2userSchema.pre('save', async function (next) {
    if ( !this.isModified('password') ) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        if (!this.isNew) {
            this.passwordChangedAt = new Date(Date.now() - 1000);
        }
        
        next();
    } catch (err: any) {
        next(err);
    }
});

v2userSchema.methods.comparePassword = function( candidatePassword: string ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default model<IV2User>("V2User", v2userSchema, "v2users");