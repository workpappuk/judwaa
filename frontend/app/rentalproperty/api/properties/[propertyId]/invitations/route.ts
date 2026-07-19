import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Invitation from '@/models/Invitation';
import Unit from '@/models/Unit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

  const body = await req.json();
  const role = body?.role as 'manager' | 'tenant';
  const unitId = body?.unitId as string | undefined;
  const invitedEmail = body?.invitedEmail ? String(body.invitedEmail).toLowerCase() : undefined;

  if (!role || (role !== 'manager' && role !== 'tenant')) {
    return NextResponse.json({ error: 'INVALID_ROLE' }, { status: 400 });
  }

  if (role === 'tenant' && !unitId) {
    return NextResponse.json({ error: 'UNIT_REQUIRED_FOR_TENANT' }, { status: 400 });
  }

  if (unitId) {
    const unit = (await Unit.findOne({ _id: new Types.ObjectId(unitId), propertyId: new Types.ObjectId(propertyId) }).lean()) as any;
    if (!unit) return NextResponse.json({ error: 'UNIT_NOT_FOUND' }, { status: 404 });
    if (role === 'tenant' && !unit.isRentable) {
      return NextResponse.json({ error: 'UNIT_NOT_RENTABLE' }, { status: 400 });
    }
  }

  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await Invitation.create({
    propertyId: new Types.ObjectId(propertyId),
    unitId: unitId ? new Types.ObjectId(unitId) : null,
    role,
    invitedBy: new Types.ObjectId(authUser.id),
    invitedEmail,
    expiresAt,
  });

  const origin = req.nextUrl.origin;
  const inviteUrl = `${origin}/invite/${invitation.token}`;

  return NextResponse.json({
    id: String(invitation._id),
    token: invitation.token,
    inviteUrl,
  });
}
