import { Schema, model, models, Types } from 'mongoose';

/**
 * Complaint
 * Raised by a tenant against their Unit. Category list is intentionally
 * generic (works the same whether it's a flat, villa, or PG bed).
 * `assignedTo` lets an owner delegate to a manager without a separate
 * workflow module.
 */
export interface IComplaint {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  raisedBy: Types.ObjectId; // tenant User._id
  assignedTo?: Types.ObjectId | null; // owner/manager User._id
  category: 'plumbing' | 'electrical' | 'appliance' | 'cleanliness' | 'security' | 'other';
  title: string;
  description: string;
  attachmentUrls: string[]; // Cloudinary URLs
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'appliance', 'cleanliness', 'security', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachmentUrls: [{ type: String }],
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ComplaintSchema.index({ propertyId: 1, status: 1 });

export default models.Complaint || model<IComplaint>('Complaint', ComplaintSchema);
