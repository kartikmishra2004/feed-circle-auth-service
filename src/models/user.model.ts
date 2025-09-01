import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  fullName: string;
  organizationName: string;
  organizationType: string;
  contactPersonName: string;
  phone: string;
  refreshTokens: string[];
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fbPageId?: string;
  fbPageAccessToken?: string;
  igBusinessAccountId?: string;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ['individual', 'organization'],
      required: true,
    },
    fullName: {
      type: String,
      required: [function () { return this.role === 'individual' }, "Full name is required"],
      trim: true,
      maxlength: [60, "Full name cannot exceed 60 characters"],
    },
    organizationName: {
      type: String,
      required: [function () { return this.role === 'organization' }, "Organization name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    organizationType: {
      type: String,
      required: [function () { return this.role === 'organization' }, "Organization type is required"],
      trim: true,
    },
    contactPersonName: {
      type: String,
      required: [function () { return this.role === 'organization' }, "Organization type is required"],
      trim: true,
      maxlength: [60, "Contact person name cannot exceed 60 characters"],
    },
    phone: {
      type: String,
      required: [function () { return this.role === 'organization' }, "Organization type is required"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
