import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Stay from '@/models/Stay';
import Unit from '@/models/Unit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const stays = await Stay.find({ propertyId: new Types.ObjectId(propertyId) }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    stays: stays.map((s) => ({
      id: String(s._id),
      unitId: String(s.unitId),
      occupantId: s.occupantId ? String(s.occupantId) : null,
      occupantName: s.occupantDetails?.name || null,
      billingType: s.billingType,
      rate: s.rate,
      status: s.status,
      scheduledStart: s.scheduledStart,
      scheduledEnd: s.scheduledEnd,
      actualStart: s.actualStart,
      actualEnd: s.actualEnd,
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
  if (!body?.unitId || !body?.billingType || !body?.rate || !body?.scheduledStart) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const unit = (await Unit.findOne({
    _id: new Types.ObjectId(body.unitId),
    propertyId: new Types.ObjectId(propertyId),
  }).lean()) as any;

  if (!unit) return NextResponse.json({ error: 'UNIT_NOT_FOUND' }, { status: 404 });
  if (!unit.isRentable) return NextResponse.json({ error: 'UNIT_NOT_RENTABLE' }, { status: 400 });

  const stay = await Stay.create({
    propertyId: new Types.ObjectId(propertyId),
    unitId: new Types.ObjectId(body.unitId),
    occupantId: body.occupantId ? new Types.ObjectId(body.occupantId) : null,
    occupantDetails: body.occupantDetails?.name
      ? {
          name: String(body.occupantDetails.name),
          phone: body.occupantDetails.phone ? String(body.occupantDetails.phone) : undefined,
          email: body.occupantDetails.email ? String(body.occupantDetails.email) : undefined,
        }
      : undefined,
    billingType: body.billingType,
    rate: Number(body.rate),
    securityDeposit: Number(body.securityDeposit || 0),
    scheduledStart: new Date(body.scheduledStart),
    scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : null,
    prorationPolicy: body.prorationPolicy || 'prorate',
    status: body.status || 'reserved',
  });

  return NextResponse.json({ id: String(stay._id) }, { status: 201 });
}
