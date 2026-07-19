import { Schema, model, models, Types } from 'mongoose';
import crypto from 'crypto';

/**
 * Invitation
 * The core of your authorization flow. An Owner/Manager generates an
 * invitation for a specific Property (+ optionally a specific Unit for
 * tenants). The recipient signs in via OAuth, opens the invite link,
 * and on acceptance a Membership is created — the Invitation itself is
 * never mutated into a role; it's just the handshake record.
 */
export interface IInvitation {
  _id: Types.ObjectId;
  token: string; // opaque, unguessable — used in the invite URL
  propertyId: Types.ObjectId;
  unitId?: Types.ObjectId | null; // expected when role === 'tenant'
  role: 'manager' | 'tenant';
  invitedBy: Types.ObjectId; // User._id of the owner/manager who created it
  invitedEmail?: string; // optional pre-fill / restriction on who can accept
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  acceptedBy?: Types.ObjectId | null;
  acceptedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', default: null },
    role: { type: String, enum: ['manager', 'tenant'], required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedEmail: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    acceptedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

InvitationSchema.index({ token: 1, status: 1 });
InvitationSchema.index({ propertyId: 1, status: 1 });

export default models.Invitation || model<IInvitation>('Invitation', InvitationSchema);
