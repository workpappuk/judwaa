import { Schema, model, models, Types } from 'mongoose';

/**
 * Property
 * The top-level container an Owner manages. A Property has one or more
 * Units (see Unit.ts). Property "type" is informational/display only —
 * it does NOT change how Units, Leases, Rent, or Complaints behave.
 */
export interface IProperty {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  type: 'apartment' | 'flat' | 'pg' | 'villa' | 'commercial' | 'hotel';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  managerIds: Types.ObjectId[]; // Users with role: manager for this property
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['apartment', 'flat', 'pg', 'villa', 'commercial', 'hotel'],
      required: true,
    },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true, default: 'IN' },
    },
    managerIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PropertySchema.index({ ownerId: 1, isActive: 1 });

export default models.Property || model<IProperty>('Property', PropertySchema);
