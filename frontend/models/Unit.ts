import { Schema, model, models, Types } from 'mongoose';

/**
 * Unit
 * The generic building block that represents any rentable OR grouping
 * entity within a Property:
 *   - Apartment/Villa property → one Unit per flat/villa, isRentable: true, no parent
 *   - PG property              → Unit (type: 'room', isRentable: false)
 *                                 └── Unit (type: 'bed', isRentable: true, parentUnitId: room._id)
 *
 * Leases MUST reference a Unit with isRentable: true. This keeps Lease,
 * RentInvoice, and Complaint completely agnostic to property type —
 * they only ever deal with a leaf, rentable Unit.
 *
 * `status` is stored only on rentable (leaf) units. A parent unit's
 * occupancy (e.g. a PG room) is DERIVED by aggregating its children's
 * status at query time — not stored, to avoid sync bugs.
 */
export interface IUnit {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  parentUnitId?: Types.ObjectId | null;
  type: 'flat' | 'villa' | 'room' | 'bed' | 'commercial' | 'hotel_room';
  name: string; // "Flat 3B", "Room 12", "Bed 2"
  isRentable: boolean;
  status: 'vacant' | 'occupied' | 'maintenance';
  metadata?: {
    floor?: number;
    areaSqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    sharingType?: '1-sharing' | '2-sharing' | '3-sharing' | '4-sharing';
    [key: string]: unknown; // escape hatch for type-specific attributes
  };
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    parentUnitId: { type: Schema.Types.ObjectId, ref: 'Unit', default: null, index: true },
    type: {
      type: String,
      enum: ['flat', 'villa', 'room', 'bed', 'commercial', 'hotel_room'],
      required: true,
    },
    name: { type: String, required: true },
    isRentable: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      enum: ['vacant', 'occupied', 'maintenance'],
      default: 'vacant',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Fast lookup of all units (and children) for a property's unit tree
UnitSchema.index({ propertyId: 1, parentUnitId: 1 });

export default models.Unit || model<IUnit>('Unit', UnitSchema);
