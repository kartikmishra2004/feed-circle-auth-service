import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    email: string;
    password: string;
    fullName: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    fbPageId?: string;
    fbPageAccessToken?: string;
    igBusinessAccountId?: string;
}

const userSchema: Schema<IUser> = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [60, 'Full name cannot exceed 50 characters']
    },
    fbPageId: {
        type: String,
        trim: true,
    },
    igBusinessAccountId: {
        type: String,
        trim: true,
    },
    fbPageAccessToken: {
        type: String,
        trim: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{
        type: String
    }],

}, { timestamps: true });

// middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);