import { Schema, model, models, Types } from 'mongoose';

/**
 * Membership
 * Since Auth.js only identifies WHO a user is, this model answers WHAT
 * they can do WHERE (property-level access — see User.ts for the
 * separate platform-level admin/super_admin axis). Created when an
 * Invitation is accepted (see Invitation.ts), or directly by an
 * owner/manager for a walk-in guest. A single User can have multiple
 * Memberships across different Properties (e.g. tenant in one, owner
 * in another).
 *
 * 'tenant' vs 'guest': tenant = long-term occupant (monthly Stay),
 * guest = short-term occupant (daily/hourly Stay, e.g. hotel). Same
 * shape, narrower visibility for guest (own Stay + Bill only, no
 * broader lease-style access).
 */
export interface IMembership {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId | null; // set for tenants/guests (their occupied unit); null for owner/manager
  role: 'owner' | 'manager' | 'tenant' | 'guest';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', default: null },
    role: { type: String, enum: ['owner', 'manager', 'tenant', 'guest'], required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// A user shouldn't have two active memberships for the same unit
MembershipSchema.index(
  { userId: 1, propertyId: 1, unitId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

export default models.Membership || model<IMembership>('Membership', MembershipSchema);
