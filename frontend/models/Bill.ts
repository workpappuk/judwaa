import { Schema, model, models, Types } from 'mongoose';

/**
 * Bill
 * Replaces RentInvoice. One Bill = one charge for a period of a Stay.
 *
 * Generation happens two ways:
 *  1. Recurring (monthly Stays): a scheduled job creates one Bill per
 *     billing cycle, same as the old RentInvoice behavior.
 *  2. Final settlement (any billingType): generated once, when a Stay's
 *     `actualEnd` is set — on checkout, early termination, or extension
 *     settlement. `isFinal: true` marks this case. `units` and `amount`
 *     are computed from actualStart/actualEnd (or scheduledEnd if the
 *     stay ran exactly as planned), NOT simply copied from the Stay's
 *     scheduled dates — see calculateBill() in lib/billing.ts.
 *
 * `units` is intentionally fractional (e.g. 2.5 for half a day prorated,
 * or 11.5 hours) so proration math stays exact instead of always
 * rounding up before storing.
 */
export interface IBill {
  _id: Types.ObjectId;
  stayId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  occupantId?: Types.ObjectId | null;

  periodStart: Date;
  periodEnd: Date;
  billingType: 'hourly' | 'daily' | 'monthly'; // copied from Stay at generation time
  rate: number; // copied from Stay at generation time (rate could change between stays)
  units: number; // fractional units actually billed for this period
  baseAmount: number; // rate * units, before adjustments
  adjustments: {
    label: string; // e.g. "Early checkout discount", "Extension charge", "Late fee"
    amount: number; // positive = charge, negative = credit/discount
  }[];
  amount: number; // baseAmount + sum(adjustments) — the actual amount due

  isFinal: boolean; // true = settlement bill tied to actualEnd, not a routine cycle bill
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidAt?: Date | null;
  paymentMethod?: 'manual' | 'online' | null; // 'online' reserved for future
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    stayId: { type: Schema.Types.ObjectId, ref: 'Stay', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    occupantId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    billingType: { type: String, enum: ['hourly', 'daily', 'monthly'], required: true },
    rate: { type: Number, required: true, min: 0 },
    units: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    adjustments: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true, min: 0 },

    isFinal: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'waived'],
      default: 'pending',
      index: true,
    },
    paidAt: { type: Date, default: null },
    paymentMethod: { type: String, enum: ['manual', 'online', null], default: null },
  },
  { timestamps: true }
);

// One recurring bill per Stay per period (prevents the monthly cron from
// double-generating). Final bills use a period unique to their actual
// dates so they never collide with this constraint.
BillSchema.index({ stayId: 1, periodStart: 1 }, { unique: true });
BillSchema.index({ propertyId: 1, status: 1 });

export default models.Bill || model<IBill>('Bill', BillSchema);
