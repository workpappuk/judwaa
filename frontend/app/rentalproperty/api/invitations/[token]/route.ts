import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invitation from '@/models/Invitation';
import Property from '@/models/Property';
import Unit from '@/models/Unit';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await dbConnect();

  const invitation = (await Invitation.findOne({ token }).lean()) as any;
  if (!invitation || Array.isArray(invitation)) {
    return NextResponse.json({ error: 'INVITE_NOT_FOUND' }, { status: 404 });
  }

  const property = (await Property.findById(invitation.propertyId).lean()) as any;
  const unit = invitation.unitId ? ((await Unit.findById(invitation.unitId).lean()) as any) : null;

  return NextResponse.json({
    token: invitation.token,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    invitedEmail: invitation.invitedEmail || null,
    property: property
      ? {
          id: String(property._id),
          name: property.name,
          type: property.type,
          city: property.address.city,
        }
      : null,
    unit: unit ? { id: String(unit._id), name: unit.name, type: unit.type } : null,
  });
}
