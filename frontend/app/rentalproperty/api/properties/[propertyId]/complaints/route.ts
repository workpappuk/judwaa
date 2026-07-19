import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Complaint from '@/models/Complaint';
import Unit from '@/models/Unit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const complaints = await Complaint.find({ propertyId: new Types.ObjectId(propertyId) })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    complaints: complaints.map((c) => ({
      id: String(c._id),
      unitId: String(c.unitId),
      raisedBy: String(c.raisedBy),
      assignedTo: c.assignedTo ? String(c.assignedTo) : null,
      category: c.category,
      title: c.title,
      priority: c.priority,
      status: c.status,
      createdAt: c.createdAt,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const body = await req.json();
  if (!body?.unitId || !body?.category || !body?.title || !body?.description) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const unit = await Unit.findOne({
    _id: new Types.ObjectId(body.unitId),
    propertyId: new Types.ObjectId(propertyId),
  }).lean();

  if (!unit) return NextResponse.json({ error: 'UNIT_NOT_FOUND' }, { status: 404 });

  const complaint = await Complaint.create({
    propertyId: new Types.ObjectId(propertyId),
    unitId: new Types.ObjectId(body.unitId),
    raisedBy: new Types.ObjectId(authUser.id),
    assignedTo: body.assignedTo ? new Types.ObjectId(body.assignedTo) : null,
    category: body.category,
    title: body.title,
    description: body.description,
    attachmentUrls: body.attachmentUrls || [],
    priority: body.priority || 'medium',
    status: body.status || 'open',
  });

  return NextResponse.json({ id: String(complaint._id) }, { status: 201 });
}
