import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Bill from '@/models/Bill';
import Stay from '@/models/Stay';
import { calculateBill } from '@/models/billing';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const bills = await Bill.find({ propertyId: new Types.ObjectId(propertyId) }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    bills: bills.map((b) => ({
      id: String(b._id),
      stayId: String(b.stayId),
      unitId: String(b.unitId),
      billingType: b.billingType,
      amount: b.amount,
      status: b.status,
      isFinal: b.isFinal,
      periodStart: b.periodStart,
      periodEnd: b.periodEnd,
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
  if (!body?.stayId || !body?.periodStart || !body?.periodEnd) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const stay = (await Stay.findOne({
    _id: new Types.ObjectId(body.stayId),
    propertyId: new Types.ObjectId(propertyId),
  }).lean()) as any;

  if (!stay) return NextResponse.json({ error: 'STAY_NOT_FOUND' }, { status: 404 });

  const periodStart = new Date(body.periodStart);
  const periodEnd = new Date(body.periodEnd);

  if (!(periodStart < periodEnd)) {
    return NextResponse.json({ error: 'INVALID_PERIOD' }, { status: 400 });
  }

  const computed = calculateBill({
    billingType: stay.billingType,
    rate: stay.rate,
    periodStart,
    periodEnd,
    scheduledEnd: stay.scheduledEnd,
    prorationPolicy: stay.prorationPolicy,
  });

  const bill = await Bill.create({
    stayId: stay._id,
    propertyId: stay.propertyId,
    unitId: stay.unitId,
    occupantId: stay.occupantId,
    periodStart,
    periodEnd,
    billingType: stay.billingType,
    rate: stay.rate,
    units: computed.units,
    baseAmount: computed.baseAmount,
    adjustments: computed.adjustments,
    amount: computed.amount,
    isFinal: Boolean(body.isFinal),
    status: body.status || 'pending',
  });

  return NextResponse.json({ id: String(bill._id) }, { status: 201 });
}
