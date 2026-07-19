import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Unit from '@/models/Unit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const units = await Unit.find({ propertyId: new Types.ObjectId(propertyId) })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    units: units.map((u) => ({
      id: String(u._id),
      name: u.name,
      type: u.type,
      isRentable: u.isRentable,
      status: u.status,
      parentUnitId: u.parentUnitId ? String(u.parentUnitId) : null,
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
  if (!body?.name || !body?.type) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  const unit = await Unit.create({
    propertyId: new Types.ObjectId(propertyId),
    parentUnitId: body.parentUnitId ? new Types.ObjectId(body.parentUnitId) : null,
    type: body.type,
    name: body.name,
    isRentable: Boolean(body.isRentable),
    status: body.status || 'vacant',
    metadata: body.metadata || {},
  });

  return NextResponse.json({ id: String(unit._id) }, { status: 201 });
}
