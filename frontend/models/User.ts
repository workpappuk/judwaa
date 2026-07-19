import { Schema, model, models, Types } from 'mongoose';

/**
 * User
 * Auth.js (OAuth only) creates/updates this on sign-in.
 * A single user can hold different roles on different properties —
 * property-level role is NOT stored here; it's derived from accepted
 * Invitations / Membership records per property. This document only
 * identifies the person plus their PLATFORM-level access (separate
 * axis from property-level roles):
 *   - platformRole: 'user'       -> everyone by default, no special access
 *   - platformRole: 'super_admin'-> full platform control, sees across
 *                                   ALL tenants/properties. This is the
 *                                   ONLY platform-level role that crosses
 *                                   tenant boundaries — intentionally.
 * There is no platform-level "admin" role. What might look like "an
 * admin for property X" is just a scoped Membership (role: 'owner' or
 * 'manager') tied to that propertyId — it structurally cannot see other
 * properties because the record itself never says "all properties,"
 * only "this one." Two admins managing two different properties never
 * share a Membership row, so there's no boundary to accidentally cross.
 * Platform role is global and singular — it does NOT repeat per
 * property the way Membership.role does.
 */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'apple' | 'microsoft';
  providerAccountId: string;
  phone?: string;
  platformRole: 'user' | 'super_admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    provider: {
      type: String,
      enum: ['google', 'apple', 'microsoft'],
      required: true,
    },
    providerAccountId: { type: String, required: true },
    phone: { type: String },
    platformRole: {
      type: String,
      enum: ['user', 'super_admin'],
      default: 'user',
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate OAuth identities from creating separate users
UserSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export default models.User || model<IUser>('User', UserSchema);
