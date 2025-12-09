import mongoose, { Schema, Document } from 'mongoose';

interface HearingProfile {
  eqBands: {
    500: number;
    1000: number;
    2000: number;
    4000: number;
    8000: number;
  };
}

export interface UserDoc extends Document {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  profile?: HearingProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const HearingProfileSchema = new Schema<HearingProfile>(
  {
    eqBands: {
      500: { type: Number, required: true, default: 0 },
      1000: { type: Number, required: true, default: 0 },
      2000: { type: Number, required: true, default: 0 },
      4000: { type: Number, required: true, default: 0 },
      8000: { type: Number, required: true, default: 0 }
    }
  },
  { _id: false }
);

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    profile: { type: HearingProfileSchema, required: false },
    lastLoginAt: { type: Date }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.model<UserDoc>('User', UserSchema);
