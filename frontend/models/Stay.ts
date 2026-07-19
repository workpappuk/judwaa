import { Schema, model, models, Types } from 'mongoose';

/**
 * Stay
 * Replaces the earlier separate Lease and Booking models. A hotel room
 * booking, a PG bed rental, and an apartment lease are all the same
 * shape — someone occupies a Unit for a date range — they only differ
 * in HOW that range is billed. `billingType` carries that difference;
 * everything else (Unit, Bill, Complaint) stays agnostic to it.
 *
 * - monthly : apartment/villa/PG-style long-term tenancy. scheduledEnd
 *             is often null (ongoing, month-to-month) until terminated.
 * - daily   : hotel-style, per-night. scheduledEnd is always set.
 * - hourly  : short-stay / "day use" hotel bookings (e.g. 12-hour slot).
 *             rate is still expressed per hour; a 12hr package is just
 *             rate * 12 computed at Bill time.
 *
 * Early checkout / extension: don't mutate scheduledEnd when someone
 * leaves early or stays longer — set `actualEnd` instead (or push
 * scheduledEnd out for an extension) and let Bill generation calculate
 * the true amount from actualStart/actualEnd. scheduledEnd stays the
 * plan; actualEnd is what actually happened and drives billing.
 */
export interface IStay {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  occupantId?: Types.ObjectId | null; // registered User (tenant or guest)
  occupantDetails?: {
    name: string;
    phone?: string;
    email?: string;
  }; // walk-in guest with no platform account (hotel front-desk bookings)

  billingType: 'hourly' | 'daily' | 'monthly';
  rate: number; // price per billingType unit: per hour / per night / per month
  securityDeposit: number;

  scheduledStart: Date;
  scheduledEnd?: Date | null; // planned end; null = open-ended monthly tenancy
  actualStart?: Date | null; // set at check-in
  actualEnd?: Date | null; // set at check-out/termination — triggers final Bill

  // How to prorate when actualEnd differs from scheduledEnd.
  // 'prorate'  -> charge only for units actually used (early exit refunds,
  //               extension charges the extra)
  // 'no_refund'-> full scheduled amount is due regardless of early exit
  //               (common hotel no-refund policy); extensions still billed
  prorationPolicy: 'prorate' | 'no_refund';

  status: 'reserved' | 'active' | 'ended' | 'cancelled' | 'no_show';
  createdAt: Date;
  updatedAt: Date;
}

const StaySchema = new Schema<IStay>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    occupantId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    occupantDetails: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    billingType: { type: String, enum: ['hourly', 'daily', 'monthly'], required: true },
    rate: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },

    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, default: null },
    actualStart: { type: Date, default: null },
    actualEnd: { type: Date, default: null },

    prorationPolicy: { type: String, enum: ['prorate', 'no_refund'], default: 'prorate' },

    status: {
      type: String,
      enum: ['reserved', 'active', 'ended', 'cancelled', 'no_show'],
      default: 'reserved',
      index: true,
    },
  },
  { timestamps: true }
);

// Long-term tenancy: only one active monthly Stay per unit at a time.
// Daily/hourly stays are sequential and can't rely on a DB constraint
// for overlap — check availability at the application layer instead:
//   Stay.findOne({
//     unitId, billingType: { $in: ['daily', 'hourly'] },
//     status: { $in: ['reserved', 'active'] },
//     scheduledStart: { $lt: newScheduledEnd },
//     scheduledEnd: { $gt: newScheduledStart },
//   })
// A match means the requested range overlaps an existing stay.
StaySchema.index(
  { unitId: 1, billingType: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active', billingType: 'monthly' } }
);

StaySchema.index({ unitId: 1, status: 1 });
StaySchema.index({ propertyId: 1, status: 1 });
StaySchema.index({ occupantId: 1, status: 1 });
StaySchema.index({ unitId: 1, scheduledStart: 1, scheduledEnd: 1 });

export default models.Stay || model<IStay>('Stay', StaySchema);
